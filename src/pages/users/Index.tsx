import BaseLayout from "../../components/layouts/BaseLayout";

export default function UsersIndex() {
  return (
    <BaseLayout resourceName="Users">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Users</h1>
        <p className="text-gray-600">Manage users, roles, and quick links to role-specific portals.</p>
      </div>
    </BaseLayout>
  );
}
