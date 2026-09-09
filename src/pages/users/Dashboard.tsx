import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";
import { readUsers } from "./usersStorage";
import { useAuth } from "../../auth/AuthContext";

export default function UsersDashboard() {
  const users = readUsers();
  const total = users.length;
  const active = users.filter(u => u.status === 'ACTIVE').length;
  const inactive = users.filter(u => u.status === 'INACTIVE').length;
  const newThisWeek = Math.max(0, Math.floor(total * 0.12));

  const { user } = useAuth();

  return (
    <BaseLayout resourceName="Users Dashboard">
      <div className="w-full py-6">
        <div className="w-full max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Users Dashboard</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">Overview metrics, recent activity and quick actions for user management.</p>

          {/* 2x2 Grid for KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full" style={{ overflow: 'visible' }}>
            <Card padding="p-4" className="text-center overflow-visible">
              <div className="text-sm text-gray-500">Total users</div>
              <div className="text-2xl font-bold mt-2">{total}</div>
            </Card>
            <Card padding="p-4" className="text-center overflow-visible">
              <div className="text-sm text-gray-500">Active users</div>
              <div className="text-2xl font-bold mt-2 text-green-600">{active}</div>
            </Card>
            <Card padding="p-4" className="text-center overflow-visible">
              <div className="text-sm text-gray-500">Inactive users</div>
              <div className="text-2xl font-bold mt-2 text-red-600">{inactive}</div>
            </Card>
            <Card padding="p-4" className="text-center overflow-visible">
              <div className="text-sm text-gray-500">New this week</div>
              <div className="text-2xl font-bold mt-2 text-blue-400">{newThisWeek}</div>
            </Card>
          </div>

          {/* User info - reflect currently active/logged-in user */}
          <div className="w-full mb-6">
            <Card padding="p-6" className="overflow-visible">
              <h3 className="text-lg font-semibold">Current user</h3>
              <div className="mt-3 flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{(user?.firstName || user?.username || 'U').charAt(0)}</div>
                <div className="text-center md:text-left">
                  <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
                <div className="md:ml-auto">
                  <Button onClick={() => window.location.assign('/users/profile')}>View profile</Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Remaining quick actions and recent users */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Card padding="p-6" className="overflow-visible">
              <h3 className="text-lg font-semibold">Quick actions</h3>
              <p className="text-sm text-gray-500 mt-2">Common tasks for user administration.</p>
              <div className="mt-4 flex flex-col gap-2 items-center">
                <Button onClick={() => window.location.assign('/users/register')}>Register user</Button>
                <Button variant="outline" onClick={() => window.location.assign('/users/index')}>View users</Button>
                <Button variant="ghost" onClick={() => window.location.assign('/users/notes')}>Open notes</Button>
              </div>
            </Card>

            <Card padding="p-6" className="overflow-visible">
              <h3 className="text-lg font-semibold">Recent users</h3>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                {users.slice(0,5).map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-gray-400">{u.role} • {u.email}</div>
                    </div>
                    <div className="text-xs text-gray-500">{u.id}</div>
                  </div>
                ))}
                {!users.length && <div className="text-gray-400">No users yet.</div>}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
