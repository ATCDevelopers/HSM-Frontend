import { useEffect, useState } from "react";
import BaseLayout from "../../components/layouts/BaseLayout";
import Button from "../../components/atoms/ui/Button";
import Input from "../../components/atoms/forms/Input";
import { userAPI, type User } from "../../services/userAPI";

export default function Notes() {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState("Notes API is not available yet.");

  useEffect(() => { userAPI.list().then((loadedUsers) => { setUsers(loadedUsers); setUserId(loadedUsers[0]?.id ?? ""); }).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Failed to load users")); }, []);

  return (
    <BaseLayout resourceName="User Notes">
      <div className="w-full rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-4xl w-full px-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm w-full">
            <h1 className="text-lg font-bold text-gray-900">Notes</h1>
            <p className="mt-0.5 mb-4 text-sm text-gray-500">Create and view user-specific notes and audit comments.</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4 w-full">
              <label className="text-sm font-medium text-gray-700 md:col-span-2">User
                <select value={userId} onChange={(e) => setUserId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} — {u.role}</option>)}
                </select>
              </label>
              <div className="md:col-span-3 w-full">
                <Input label="New note" value="" onChange={() => undefined} placeholder="Notes API is not available yet" disabled />
                <div className="flex justify-end mt-3"><Button disabled onClick={() => undefined}>Add note</Button></div>
              </div>
            </div>

            <div className="space-y-3 w-full">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{error}</div>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
