import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";
import { readUsers } from "./usersStorage";

export default function UsersDashboard() {
  const users = readUsers();
  const total = users.length;
  const active = users.filter(u => u.status === 'ACTIVE').length;
  const inactive = users.filter(u => u.status === 'INACTIVE').length;

  return (
    <BaseLayout resourceName="Users Dashboard">
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Users Dashboard</h1>
          <p className="text-sm text-gray-500 mb-6">Overview metrics, recent activity and quick actions for user management.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Total users</div>
              <div className="text-2xl font-bold mt-2">{total}</div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Active users</div>
              <div className="text-2xl font-bold mt-2 text-green-600">{active}</div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Inactive users</div>
              <div className="text-2xl font-bold mt-2 text-red-600">{inactive}</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="p-6">
              <h3 className="text-lg font-semibold">Quick actions</h3>
              <p className="text-sm text-gray-500 mt-2">Common tasks for user administration.</p>
              <div className="mt-4 flex flex-col gap-2">
                <Button onClick={() => window.location.assign('/users/register')}>Register user</Button>
                <Button variant="outline" onClick={() => window.location.assign('/users')}>View users</Button>
                <Button variant="ghost" onClick={() => window.location.assign('/users/notes')}>Open notes</Button>
              </div>
            </Card>

            <Card padding="p-6">
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

            <Card padding="p-6">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-gray-500 mt-2">System notices related to user accounts will appear here.</p>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
