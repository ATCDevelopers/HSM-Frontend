import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import Dropdown from "../../components/atoms/ui/Dropdown";
import Modal from "../../components/atoms/ui/Modal";
import Button from "../../components/atoms/ui/Button";
import Input from "../../components/atoms/forms/Input";
import { userAPI, type User } from "../../services/userAPI";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import Swal from "sweetalert2";

import Table from "../../components/sections/Table";

export default function UsersIndex() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canCreate = can('create', 'User', user?.role) || can('manage', 'User', user?.role);
  const canUpdate = can('update', 'User', user?.role) || can('manage', 'User', user?.role);
  const canDelete = can('delete', 'User', user?.role) || can('manage', 'User', user?.role);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    userAPI.list()
      .then(setUsers)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return [u.id, u.firstName, u.secondName || "", u.lastName, u.email, u.role].some((v) => v.toLowerCase().includes(s));
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  function openView(u: User) {
    setSelected(u);
    setViewOpen(true);
  }
  function openEdit(u: User) {
    setSelected(u);
    setEditOpen(true);
  }

  async function handleDelete(u: User) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${u.firstName} ${u.lastName}?`,
      icon: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    
    userAPI.remove(u.id)
      .then(() => {
        setUsers((current) => current.filter((x) => x.id !== u.id));
        Swal.fire('Deleted!', 'The user has been deleted.', 'success');
      })
      .catch((requestError: unknown) => {
        const msg = requestError instanceof Error ? requestError.message : "Failed to delete user";
        setError(msg);
        Swal.fire('Error', msg, 'error');
      });
  }

  async function handleSave(updated: User) {
    try {
      const saved = await userAPI.update(updated.id, updated);
      setUsers((current) => current.map((u) => (u.id === saved.id ? saved : u)));
      setEditOpen(false);
      Swal.fire({
        title: 'Success!',
        text: 'User updated successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (requestError: unknown) {
      const msg = requestError instanceof Error ? requestError.message : "Failed to update user";
      setError(msg);
      Swal.fire('Error', msg, 'error');
    }
  }

  interface DropdownItem {
    label: string;
    onClick: () => void;
    className?: string;
  }

  const getUserActions = (u: User): DropdownItem[] => {
    const actions: DropdownItem[] = [{ label: 'View', onClick: () => openView(u) }];
    if (canUpdate) {
      actions.push({ label: 'Edit', onClick: () => openEdit(u) });
    }
    if (canDelete) {
      actions.push({ label: 'Delete', onClick: () => handleDelete(u), className: 'text-red-600 hover:bg-red-50' });
    }
    return actions;
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (_: any, u: User) => (
        <span className="font-semibold text-gray-900">
          {u.firstName} {u.secondName ? `${u.secondName} ` : ""}{u.lastName}
        </span>
      ),
    },
    {
      key: "id",
      title: "User ID",
      render: (val: string) => <span className="text-gray-700">{val}</span>,
    },
    {
      key: "email",
      title: "Email",
      render: (val: string) => <span className="text-gray-700">{val}</span>,
    },
    {
      key: "role",
      title: "Role",
      render: (val: string) => <span className="text-gray-700">{val}</span>,
    },
    {
      key: "status",
      title: "Status",
      render: (val: string) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            val === "ACTIVE" || !val
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {val || "ACTIVE"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: any, u: User) => (
        <Dropdown
          children={null}
          showChevron={false}
          trigger={<EllipsisVerticalIcon className="h-5 w-5" />}
          triggerAriaLabel="User actions"
          items={getUserActions(u)}
          position="bottom-right"
        />
      ),
    },
  ];

  return (
    <BaseLayout resourceName="Users">
      <div className="w-full rounded-2xl bg-blue-50 p-6 min-h-[calc(100vh-6rem)] flex flex-col justify-between">
        <div className="mx-auto max-w-6xl w-full flex-1 flex flex-col">
          {/* Top Toolbar Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
            <div className="shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Users</h2>
              <p className="mt-0.5 text-sm text-gray-500">Manage system users, roles and portals.</p>
            </div>

            {/* Fluid Centered Search Field */}
            <div className="w-full md:flex-1 md:max-w-md md:mx-auto">
              <Input
                label=""
                type="search"
                placeholder="Search users by name, id, email or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Action Button */}
            <div className="shrink-0">
              {canCreate && (
                <Button
                  variant="primary"
                  onClick={() => navigate('/users/register')}
                  className="whitespace-nowrap"
                >
                  Add user
                </Button>
              )}
            </div>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {/* Main Content Area */}
          <div className="w-full flex-1 flex flex-col justify-between">
            <Table
              columns={columns}
              data={paginated}
              loading={loading}
              emptyMessage="No users found."
            />
            
            {/* Static Bottom Pagination Controls */}
            {!loading && (
              <div className="sticky bottom-0 z-10 border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl border shadow-sm flex items-center justify-between mt-3">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{filtered.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-medium">{Math.min(page * itemsPerPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                      >
                        <span className="sr-only">Previous</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                      >
                        <span className="sr-only">Next</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View modal */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selected ? `${selected.firstName} ${selected.secondName ? `${selected.secondName} ` : ''}${selected.lastName}` : undefined} size="md">
        {selected && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Email: <span className="font-medium text-gray-900">{selected.email}</span></p>
            {selected.phoneNumber && <p className="text-sm text-gray-600">Phone: <span className="font-medium text-gray-900">{selected.phoneNumber}</span></p>}
            <p className="text-sm text-gray-600">Role: <span className="font-medium text-gray-900">{selected.role}</span></p>
            <p className="text-sm text-gray-600">Status: <span className="font-medium text-gray-900">{selected.status || "ACTIVE"}</span></p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setViewOpen(false)}>Close</Button>
              {canUpdate && <Button onClick={() => { setViewOpen(false); openEdit(selected); }}>Edit</Button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit user" size="lg">
        {selected && <EditUserForm user={selected} onCancel={() => setEditOpen(false)} onSave={handleSave} />}
      </Modal>
    </BaseLayout>
  );
}

function EditUserForm({ user, onCancel, onSave }: { user: User; onCancel: () => void; onSave: (u: User) => void }) {
  const [form, setForm] = useState<User>(user);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
      <Input label="Second name" value={form.secondName || ""} onChange={(e) => setForm({ ...form, secondName: e.target.value })} />
      <Input label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
      <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <Input label="Phone number" type="tel" value={form.phoneNumber || ""} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
      <label className="text-sm font-medium text-gray-700">Role
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
          {['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'LabTechnician', 'Cashier', 'ClinicManager', 'Accountant', 'Patient'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium text-gray-700">Status
        <select value={form.status || "ACTIVE"} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </label>
      <div className="md:col-span-2 flex justify-end gap-3 mt-3">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
