import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import { useAuth } from "../../auth/AuthContext";
import { getErrorMessage } from "../../services/apiResponse";
import { availabilityInfo, departmentAPI, departmentStaffAPI, type Department, type StaffMember } from "../../services/departmentAPI";

const fullName = (s: StaffMember) => `${s.firstName} ${s.lastName}`;

/** Admin view of every department and its head, with a one-step way to appoint or change the head. */
export default function HeadsOfDepartment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    Promise.all([departmentAPI.list(), departmentStaffAPI.allStaff()])
      .then(([depts, people]) => {
        setDepartments(depts);
        setStaff(people);
      })
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load departments")));
  }, []);

  useEffect(load, [load]);

  const appoint = async (dept: Department, userId: string) => {
    const person = staff.find((s) => s.id === userId);
    setBusyId(dept.id);
    try {
      await departmentAPI.setHead(dept.id, userId || null);
      Swal.fire({ title: person ? `${fullName(person)} now heads ${dept.name}` : `${dept.name} has no head`, icon: "success", timer: 1400, showConfirmButton: false });
      load();
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e), "error");
    } finally {
      setBusyId("");
    }
  };

  if (!isAdmin) {
    return (
      <BaseLayout resourceName="Heads of Department">
        <div className="rounded-2xl bg-white p-8 text-sm text-gray-500 shadow-sm">Only administrators can appoint heads of department.</div>
      </BaseLayout>
    );
  }

  const withoutHead = departments.filter((d) => !d.headUserId).length;

  return (
    <BaseLayout resourceName="Heads of Department">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Heads of department</h1>
          <p className="text-sm text-gray-500">
            A head sees their own department from their dashboard, can set their team's availability and edit the department's details. They cannot add, transfer or remove staff.
            {withoutHead > 0 && <span className="font-semibold text-amber-700"> {withoutHead} department{withoutHead === 1 ? " has" : "s have"} no head.</span>}
          </p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept) => {
            const members = staff.filter((s) => s.departmentId === dept.id);
            const head = staff.find((s) => s.id === dept.headUserId);
            return (
              <section key={dept.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button onClick={() => navigate(`/departments/${dept.id}`)} className="text-left font-bold text-gray-900 hover:text-blue-700">{dept.name}</button>
                    <p className="text-xs text-gray-500">{members.length} staff{dept.code && ` · ${dept.code}`}</p>
                  </div>
                  <StarIcon className={`h-6 w-6 ${head ? "text-amber-500" : "text-gray-200"}`} />
                </div>

                <div className={`mt-4 rounded-xl p-3 ${head ? "bg-amber-50" : "bg-gray-50"}`}>
                  {head ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900">{fullName(head)}</p>
                      <p className="text-xs text-gray-500">{head.role} · <span className="font-medium">{availabilityInfo(head.availability).label}</span></p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No head appointed</p>
                  )}
                </div>

                <label className="mt-4 text-xs font-semibold text-gray-500">
                  {head ? "Change head" : "Appoint head"}
                  <select
                    value={dept.headUserId ?? ""}
                    disabled={busyId === dept.id || members.length === 0}
                    onChange={(e) => appoint(dept, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">{members.length ? "— No head —" : "No staff in this department"}</option>
                    {members.map((m) => <option key={m.id} value={m.id}>{fullName(m)} ({m.role})</option>)}
                  </select>
                </label>
              </section>
            );
          })}
        </div>
      </div>
    </BaseLayout>
  );
}
