import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import Table from "../../components/sections/Table";
import Modal from "../../components/atoms/ui/Modal";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import { departmentAPI, type Department, type DepartmentPayload } from "../../services/departmentAPI";
import { userAPI, type User } from "../../services/userAPI";

const fieldClass = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none";
const EMPTY: DepartmentPayload = { name: "", code: "", location: "", parentDepartmentId: null };

export default function DepartmentsIndex() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = can("update", "Department", user?.role);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Department | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<DepartmentPayload>(EMPTY);
  const [staff, setStaff] = useState<User[]>([]);

  const load = () =>
    departmentAPI
      .list()
      .then(setDepartments)
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load departments")))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    userAPI.list().then(setStaff).catch(() => undefined);
  }, []);

  const staffIn = (id: string) => staff.filter((u) => u.departmentId === id && u.status !== "INACTIVE");

  const nameOf = (id: string | null) => departments.find((d) => d.id === id)?.name ?? "—";

  const openForm = (dept: Department | null) => {
    setEditing(dept);
    setForm(dept ? { name: dept.name, code: dept.code ?? "", location: dept.location ?? "", parentDepartmentId: dept.parentDepartmentId } : EMPTY);
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Department name is required.");
    const payload: DepartmentPayload = {
      name: form.name.trim(),
      code: form.code?.trim() || null,
      location: form.location?.trim() || null,
      parentDepartmentId: form.parentDepartmentId || null,
    };
    try {
      if (editing) await departmentAPI.update(editing.id, payload);
      else await departmentAPI.create(payload);
      setOpen(false);
      setError("");
      load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save department"));
    }
  };

  const remove = async (dept: Department) => {
    const confirm = await Swal.fire({ title: `Delete ${dept.name}?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Delete" });
    if (!confirm.isConfirmed) return;
    try {
      await departmentAPI.remove(dept.id);
      load();
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e, "Failed to delete department"), "error");
    }
  };

  const columns = [
    { key: "name", title: "Name", render: (v: string) => <span className="font-semibold text-gray-900">{v}</span> },
    { key: "code", title: "Code", render: (v: string | null) => v || "—" },
    { key: "location", title: "Location", render: (v: string | null) => v || "—" },
    { key: "parentDepartmentId", title: "Parent", render: (v: string | null) => nameOf(v) },
    {
      key: "headUserId",
      title: "Head",
      render: (v: string | null) => {
        const head = staff.find((u) => u.id === v);
        return head ? <span className="font-medium text-gray-900">★ {head.firstName} {head.lastName}</span> : <span className="text-gray-400">—</span>;
      },
    },
    {
      key: "staff",
      title: "Staff",
      render: (_: unknown, d: Department) => {
        const members = staffIn(d.id);
        const roles = [...new Set(members.map((u) => u.role))].join(", ");
        return (
          <span className="text-gray-700">
            <strong>{members.length}</strong>
            {roles && <span className="block text-xs text-gray-400">{roles}</span>}
          </span>
        );
      },
    },
    ...(canManage
      ? [{
          key: "actions",
          title: "",
          render: (_: unknown, d: Department) => (
            // Stop the click here so editing doesn't also open the department page
            <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => openForm(d)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
              <button onClick={() => remove(d)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <BaseLayout resourceName="Departments">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
            <p className="text-sm text-gray-500">Clinical and administrative units; staff can be assigned to one.</p>
          </div>
          {canManage && (
            <button onClick={() => openForm(null)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Add department</button>
          )}
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {staff.some((u) => !u.departmentId && u.status !== "INACTIVE") && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            {staff.filter((u) => !u.departmentId && u.status !== "INACTIVE").length} staff member(s) have no department. Open a department and use "Add staff" to place them.
          </p>
        )}

        <p className="text-xs text-gray-400">Click a department to see its staff, their availability, and to add, transfer or remove people.</p>
        <Table columns={columns} data={departments} loading={loading} emptyMessage="No departments yet." onRowClick={(d: Department) => navigate(`/departments/${d.id}`)} />

        <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? "Edit department" : "Add department"}>
          <form onSubmit={submit} className="space-y-4">
            <label className="block space-y-1 text-sm font-medium text-gray-700">Name *<input className={fieldClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Code<input className={fieldClass} placeholder="e.g. OPD" value={form.code ?? ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Location<input className={fieldClass} placeholder="e.g. Block A, Floor 1" value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Parent department
              <select className={fieldClass} value={form.parentDepartmentId ?? ""} onChange={(e) => setForm({ ...form, parentDepartmentId: e.target.value || null })}>
                <option value="">None</option>
                {departments.filter((d) => d.id !== editing?.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Save</button>
            </div>
          </form>
        </Modal>
      </div>
    </BaseLayout>
  );
}
