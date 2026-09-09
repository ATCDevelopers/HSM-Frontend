import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import Input from "../../components/atoms/forms/Input";
import Button from "../../components/atoms/ui/Button";
import { User, readUsers, writeUsers, generateUserId } from "./usersStorage";

export default function RegisterUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<User>>({ firstName: "", lastName: "", email: "", role: "NURSE", status: "ACTIVE" });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      setError("Please fill in required fields.");
      return;
    }
    
    const users = readUsers();
    const newUser: User = {
      id: generateUserId(users),
      firstName: form.firstName as string,
      lastName: form.lastName as string,
      email: form.email as string,
      role: form.role as string,
      status: form.status as any,
    };
    writeUsers([...users, newUser]);
    navigate('/users');
  }

  return (
    <BaseLayout resourceName="Register User">
      <div className="w-full rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-4xl w-full px-4">
          <button onClick={() => navigate('/users')} className="mb-4 text-sm font-semibold text-blue-600">← Back to Users</button>
          <div className="rounded-2xl bg-white p-8 shadow-sm w-full">
            <h1 className="text-lg font-bold text-gray-900">Register New User</h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">Create account and assign a role.</p>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <form className="grid grid-cols-1 gap-5 md:grid-cols-2 w-full" onSubmit={handleSubmit}>
              <Input label="First name" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Last name" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              <Input label="Email" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} required />

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

              <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-5">
                <Button variant="outline" onClick={handleSubmit} type="button">
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
