import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import Input from "../../components/atoms/forms/Input";
import Button from "../../components/atoms/ui/Button";
import { useAuth } from "../../auth/AuthContext";
import { readUsers, writeUsers, User } from "./usersStorage";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<User>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Prefer the logged-in user; fallback to first stored user
    const users = readUsers();
    const found = users.find((u) => u.email === user?.email) || users[0];
    if (found) setProfile(found);
  }, [user]);

  function save() {
    if (!profile || !profile.id) return setMessage("No user selected to update.");
    const users = readUsers();
    const updated = users.map((u) => (u.id === profile.id ? { ...u, ...(profile as User) } : u));
    writeUsers(updated);
    setMessage("Profile updated.");

    if(updated){
      navigate("/users/dashboard")
    }
    setTimeout(() => setMessage(''), 2500);
  }

  return (
    <BaseLayout resourceName="Profile">
      <div className="w-full rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-4xl w-full px-4">
          <div className="rounded-2xl bg-white p-8 shadow-sm w-full">
            <h1 className="text-lg font-bold text-gray-900">User Profile</h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">View and edit user profile, roles and permissions.</p>

            <form onSubmit={(e) => { e.preventDefault(); save(); }} className="grid grid-cols-1 gap-4 md:grid-cols-2 w-full">
              <Input label="First name" value={profile.firstName || ''} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} required />
              <Input label="Last name" value={profile.lastName || ''} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} required />
              <Input label="Email" type="email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              <label className="text-sm font-medium text-gray-700">Role
                <select value={profile.role || ''} onChange={(e) => setProfile({ ...profile, role: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  {['SYS_ADMIN','MGR','DOC','NURSE','RECEP','PHARM','LAB_TECH','CASHIER','ACCT'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>

              <div className="md:col-span-2 flex flex-col md:flex-row items-center md:items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-sm text-green-600">{message}</div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={() => save()}>
                    Save profile
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
