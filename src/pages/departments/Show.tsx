import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowsRightLeftIcon, MagnifyingGlassIcon, PencilSquareIcon, StarIcon, UserMinusIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import Modal from "../../components/atoms/ui/Modal";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import {
  AVAILABILITY,
  availabilityInfo,
  departmentAPI,
  departmentStaffAPI,
  type Availability,
  type Department,
  type StaffMember,
} from "../../services/departmentAPI";

const ROLE_LABELS: Record<string, string> = { LabTechnician: "Lab Technician", ClinicManager: "Clinic Manager" };
const roleLabel = (role: string) => ROLE_LABELS[role] ?? role;
const fullName = (s: StaffMember) => [s.firstName, s.secondName, s.lastName].filter(Boolean).join(" ");
const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none";

/**
 * One department: who works in it and whether they're available.
 * - Managers (Admin, Clinic Manager) can also add, transfer and remove staff.
 * - The head of department can view the team, set availability and edit the department's details,
 *   but cannot add, transfer or remove anyone.
 * - Admins appoint the head.
 */
export default function DepartmentShow() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = can("update", "Department", user?.role);
  const isAdmin = user?.role === "Admin";

  const [department, setDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [transferring, setTransferring] = useState<StaffMember | null>(null);
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState({ name: "", code: "", location: "" });
  const [busyId, setBusyId] = useState("");

  const isHead = Boolean(department && user?.id && department.headUserId === user.id);
  const canEditTeam = isManager || isHead;

  const load = useCallback(() => {
    Promise.all([departmentAPI.get(id), departmentStaffAPI.members(id)])
      .then(([dept, people]) => {
        setDepartment(dept);
        setMembers(people);
        setError("");
      })
      .catch((e: unknown) => setError(getErrorMessage(e, "You don't have access to this department")));
    // Other departments and the full staff list are only needed for adding and transferring (managers).
    if (isManager) {
      departmentAPI.list().then(setDepartments).catch(() => undefined);
      departmentStaffAPI.allStaff().then(setAllStaff).catch(() => undefined);
    }
  }, [id, isManager]);

  useEffect(load, [load]);

  const run = async (staffId: string, action: () => Promise<unknown>, success?: string) => {
    setBusyId(staffId);
    try {
      await action();
      if (success) Swal.fire({ title: success, icon: "success", timer: 1200, showConfirmButton: false });
      load();
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e), "error");
    } finally {
      setBusyId("");
    }
  };

  const remove = async (s: StaffMember) => {
    const confirm = await Swal.fire({
      title: `Remove ${fullName(s)}?`,
      text: `They will no longer belong to ${department?.name}${department?.headUserId === s.id ? " and will stop being its head" : ""}. Their account stays active.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Remove from department",
    });
    if (confirm.isConfirmed) run(s.id, () => departmentStaffAPI.remove(id, s.id), "Removed");
  };

  const transfer = (s: StaffMember, targetId: string) => {
    const target = departments.find((d) => d.id === targetId);
    setTransferring(null);
    run(s.id, () => departmentStaffAPI.assign(targetId, s.id), `${s.firstName} moved to ${target?.name}`);
  };

  const makeHead = async (s: StaffMember | null) => {
    const confirm = await Swal.fire({
      title: s ? `Make ${fullName(s)} head of ${department?.name}?` : `Clear the head of ${department?.name}?`,
      text: s ? "They will be able to view this department, set staff availability and edit its details." : "The department will have no head until a new one is appointed.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: s ? "Appoint head" : "Clear head",
    });
    if (confirm.isConfirmed) run(s?.id ?? "head", () => departmentAPI.setHead(id, s?.id ?? null), s ? "Head appointed" : "Head cleared");
  };

  const openEdit = () => {
    if (!department) return;
    setDetails({ name: department.name, code: department.code ?? "", location: department.location ?? "" });
    setEditing(true);
  };

  const saveDetails = async (e: FormEvent) => {
    e.preventDefault();
    if (!details.name.trim()) return Swal.fire("Name required", "A department needs a name.", "warning");
    setEditing(false);
    run("details", () => departmentAPI.update(id, { name: details.name.trim(), code: details.code.trim() || null, location: details.location.trim() || null }), "Department updated");
  };

  const counts = useMemo(() => Object.fromEntries(AVAILABILITY.map((a) => [a.id, members.filter((m) => m.availability === a.id).length])), [members]);
  const roles = [...new Set(members.map((m) => m.role))].sort();
  const visible = members.filter((m) => (!roleFilter || m.role === roleFilter) && (!availabilityFilter || m.availability === availabilityFilter));
  const head = members.find((m) => m.id === department?.headUserId);

  const term = addSearch.trim().toLowerCase();
  const candidates = allStaff
    .filter((s) => s.departmentId !== id)
    .filter((s) => !term || `${fullName(s)} ${s.role} ${s.email} ${s.departmentName ?? ""}`.toLowerCase().includes(term))
    // Unassigned staff first: they are the ones most likely being added
    .sort((a, b) => Number(Boolean(a.departmentId)) - Number(Boolean(b.departmentId)) || a.firstName.localeCompare(b.firstName));
  const unassignedCount = allStaff.filter((s) => !s.departmentId).length;

  if (!department) {
    return (
      <BaseLayout resourceName="Department">
        <div className="rounded-2xl bg-white p-8 text-sm text-gray-500 shadow-sm">{error || "Loading department..."}</div>
      </BaseLayout>
    );
  }

  const parent = departments.find((d) => d.id === department.parentDepartmentId);

  return (
    <BaseLayout resourceName={department.name}>
      <div className="w-full space-y-6">
        {isManager ? (
          <Link to="/departments" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← All departments</Link>
        ) : (
          <p className="text-sm font-semibold text-blue-700">My department</p>
        )}

        {isHead && !isManager && (
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
            <StarSolidIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <p>
              You are the <strong>head of {department.name}</strong>. You can see your team, update each person's availability and edit the department's details.
              Adding, transferring or removing staff is done by the administration.
            </p>
          </div>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
                {department.code && <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{department.code}</span>}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {members.length} staff member{members.length === 1 ? "" : "s"}
                {department.location && ` · ${department.location}`}
                {parent && ` · part of ${parent.name}`}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm">
                <StarSolidIcon className={`h-4 w-4 ${head ? "text-amber-500" : "text-gray-300"}`} />
                {head ? (
                  <span>Head of department: <strong className="text-gray-900">{fullName(head)}</strong> <span className="text-gray-500">({roleLabel(head.role)})</span></span>
                ) : (
                  <span className="text-gray-500">No head of department{isAdmin && " — use the star on a team member to appoint one"}</span>
                )}
                {isAdmin && head && (
                  <button onClick={() => makeHead(null)} className="ml-1 text-xs font-semibold text-gray-500 hover:text-red-600">Clear</button>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 self-start">
              {canEditTeam && (
                <button onClick={openEdit} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  <PencilSquareIcon className="h-4 w-4" /> Edit details
                </button>
              )}
              {isManager && (
                <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                  <UserPlusIcon className="h-4 w-4" /> Add staff
                  {unassignedCount > 0 && <span className="rounded-full bg-white/20 px-1.5 text-xs">{unassignedCount} unassigned</span>}
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {AVAILABILITY.map((a) => (
              <button
                key={a.id}
                onClick={() => setAvailabilityFilter(availabilityFilter === a.id ? "" : a.id)}
                className={`rounded-xl border p-3 text-left transition ${availabilityFilter === a.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-gray-500"><span className={`h-2 w-2 rounded-full ${a.dot}`} />{a.label}</span>
                <span className="mt-1 block text-2xl font-bold text-gray-900">{counts[a.id] ?? 0}</span>
              </button>
            ))}
          </div>
        </section>

        {roles.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {["", ...roles].map((r) => (
              <button key={r || "all"} onClick={() => setRoleFilter(r)} className={`rounded-full px-3 py-1 text-xs font-semibold ${roleFilter === r ? "bg-blue-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}>
                {r ? roleLabel(r) : "All roles"}
              </button>
            ))}
          </div>
        )}

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {visible.length === 0 && (
            <p className="p-8 text-center text-sm text-gray-500">{members.length ? "Nobody matches these filters." : "No staff in this department yet."}</p>
          )}
          <ul className="divide-y divide-gray-100">
            {visible.map((s) => {
              const info = availabilityInfo(s.availability);
              const isThisHead = s.id === department.headUserId;
              return (
                <li key={s.id} className={`flex flex-col gap-3 p-4 md:flex-row md:items-center ${isThisHead ? "bg-amber-50/40" : ""}`}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {s.firstName[0]}{s.lastName[0]}
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${info.dot}`} />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5">
                        {isManager ? (
                          <button onClick={() => navigate(`/users/${s.id}`)} className="truncate text-left font-semibold text-gray-900 hover:text-blue-700">{fullName(s)}</button>
                        ) : (
                          <span className="truncate font-semibold text-gray-900">{fullName(s)}</span>
                        )}
                        {isThisHead && <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800"><StarSolidIcon className="h-3 w-3" /> HEAD</span>}
                      </p>
                      <p className="truncate text-xs text-gray-500">{roleLabel(s.role)} · {s.phoneNumber} · {s.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canEditTeam ? (
                      <select
                        value={s.availability}
                        disabled={busyId === s.id}
                        onChange={(e) => run(s.id, () => departmentStaffAPI.setMemberAvailability(id, s.id, e.target.value as Availability))}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${info.badge}`}
                        aria-label={`Availability of ${fullName(s)}`}
                      >
                        {AVAILABILITY.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                      </select>
                    ) : (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${info.badge}`}>{info.label}</span>
                    )}
                    {s.availabilityUpdatedAt && <span className="text-[11px] text-gray-400">since {new Date(s.availabilityUpdatedAt).toLocaleString()}</span>}
                    {isAdmin && !isThisHead && (
                      <button onClick={() => makeHead(s)} disabled={busyId === s.id} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50" title="Appoint as head of department">
                        <StarIcon className="h-4 w-4" /> Make head
                      </button>
                    )}
                    {isManager && (
                      <>
                        <button onClick={() => setTransferring(s)} disabled={busyId === s.id} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                          <ArrowsRightLeftIcon className="h-4 w-4" /> Transfer
                        </button>
                        <button onClick={() => remove(s)} disabled={busyId === s.id} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                          <UserMinusIcon className="h-4 w-4" /> Remove
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <Modal isOpen={editing} onClose={() => setEditing(false)} title={`Edit ${department.name}`}>
          <form onSubmit={saveDetails} className="space-y-4">
            <label className="block space-y-1 text-sm font-medium text-gray-700">Name *<input className={inputClass} value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} /></label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Code<input className={inputClass} value={details.code} onChange={(e) => setDetails({ ...details, code: e.target.value })} /></label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Location<input className={inputClass} value={details.location} onChange={(e) => setDetails({ ...details, location: e.target.value })} placeholder="e.g. Block B, Ground Floor" /></label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
            </div>
          </form>
        </Modal>

        <Modal isOpen={Boolean(transferring)} onClose={() => setTransferring(null)} title={`Transfer ${transferring ? fullName(transferring) : ""}`}>
          {transferring && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Move them from {department.name} to:
                {transferring.id === department.headUserId && <span className="mt-1 block font-semibold text-amber-700">They are the head of {department.name}; transferring them clears that.</span>}
              </p>
              {departments.filter((d) => d.id !== id).map((d) => (
                <button key={d.id} onClick={() => transfer(transferring, d.id)} className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left text-sm font-medium hover:border-blue-400 hover:bg-blue-50">
                  {d.name} {d.code && <span className="text-xs text-gray-400">{d.code}</span>}
                </button>
              ))}
            </div>
          )}
        </Modal>

        <Modal isOpen={adding} onClose={() => setAdding(false)} title={`Add staff to ${department.name}`} size="lg">
          <div className="space-y-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input autoFocus value={addSearch} onChange={(e) => setAddSearch(e.target.value)} placeholder="Search by name, role or email..." className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none" />
            </div>
            <ul className="max-h-[55vh] divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200">
              {candidates.length === 0 && <li className="p-4 text-sm text-gray-500">Everyone matching is already in this department.</li>}
              {candidates.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{fullName(s)}</p>
                    <p className="truncate text-xs text-gray-500">
                      {roleLabel(s.role)} · {s.departmentName ? <>currently in <strong>{s.departmentName}</strong></> : <span className="font-semibold text-amber-700">no department</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => run(s.id, () => departmentStaffAPI.assign(id, s.id), `${s.firstName} added to ${department.name}`)}
                    disabled={busyId === s.id}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${s.departmentId ? "border border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                  >
                    {s.departmentId ? "Transfer here" : "Add"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      </div>
    </BaseLayout>
  );
}
