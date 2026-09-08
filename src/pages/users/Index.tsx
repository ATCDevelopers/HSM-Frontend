import { useEffect, useState } from "react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import Dropdown from "../../components/atoms/ui/Dropdown";
import Modal from "../../components/atoms/ui/Modal";
import Button from "../../components/atoms/ui/Button";
import Input from "../../components/atoms/forms/Input";
import { User, readUsers, writeUsers, defaultUsers, generateUserId } from "./usersStorage";

export default function UsersIndex() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  useEffect(() => {
    const saved = readUsers();
    if (!saved.length) {
      writeUsers(defaultUsers);
      setUsers(defaultUsers);
    } else setUsers(saved);
  }, []);

  const filtered = users.filter((u) => {
    const s = search.trim().toLowerCase();
    if (!s) return true;
    return [u.id, u.firstName, u.lastName, u.email, u.role].some((v) => v.toLowerCase().includes(s));
  });

  function openView(u: User) {
    setSelected(u);
    setViewOpen(true);
  }
  function openEdit(u: User) {
    setSelected(u);
    setEditOpen(true);
  }

  function handleDelete(u: User) {
    if (!confirm(`Delete ${u.firstName} ${u.lastName}?`)) return;
    const updated = users.filter((x) => x.id !== u.id);
    writeUsers(updated);
    setUsers(updated);
  }

  function handleSave(updated: User) {
    const list = users.map((u) => (u.id === updated.id ? updated : u));
    writeUsers(list);
    setUsers(list);
    setEditOpen(false);
  }

  return (
    <BaseLayout resourceName="Users">
      <div className="rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Users</h2>
              <p className="mt-0.5 text-sm text-gray-500">Manage system users, roles and portals.</p>
            </div>
            <div className="flex items-center gap-3">
              <Input type="search" placeholder="Search users by name, id, email or role" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button onClick={() => window.location.assign('/users/register')}>Add user</Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  {['Name', 'User ID', 'Email', 'Role', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length ? filtered.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-gray-700">{u.id}</td>
                    <td className="px-4 py-3 text-gray-700">{u.email}</td>
                    <td className="px-4 py-3 text-gray-700">{u.role}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                    <td className="px-4 py-3"><Dropdown showChevron={false} trigger={<EllipsisVerticalIcon className="h-5 w-5" />} triggerAriaLabel="User actions" items={[{label:'View', onClick:() => openView(u)}, {label:'Edit', onClick:() => openEdit(u)}, {label:'Delete', onClick:() => handleDelete(u), className:'text-red-600 hover:bg-red-50'}]} position="bottom-right" /></td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View modal */}
      <Modal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selected ? `${selected.firstName} ${selected.lastName}` : undefined} size="md">
        {selected && (
          <div>
            <p className="text-sm text-gray-600">Email: <span className="font-medium text-gray-900">{selected.email}</span></p>
            <p className="text-sm text-gray-600 mt-2">Role: <span className="font-medium text-gray-900">{selected.role}</span></p>
            <p className="text-sm text-gray-600 mt-2">Status: <span className="font-medium text-gray-900">{selected.status}</span></p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setViewOpen(false)}>Close</Button>
              <Button onClick={() => { setViewOpen(false); openEdit(selected); }}>Edit</Button>
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
      <Input label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
      <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <label className="text-sm font-medium text-gray-700">Role
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
          {['SYS_ADMIN','MGR','DOC','NURSE','RECEP','PHARM','LAB_TECH','CASHIER','ACCT'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </label>
      <label className="text-sm font-medium text-gray-700">Status
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
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
