import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import Input from "../../components/atoms/forms/Input";

export default function RegisterUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });

  return (
    <BaseLayout resourceName="Register User">
      <div className="rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button onClick={() => navigate('/users')} className="mb-4 text-sm font-semibold text-blue-600">← Back to Users</button>
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-lg font-bold text-gray-900">Register New User</h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">Create account and assign a role.</p>

            <form className="grid grid-cols-1 gap-5 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); navigate('/users'); }}>
              <Input label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button type="button" onClick={() => navigate('/users')} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white">Register User</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
