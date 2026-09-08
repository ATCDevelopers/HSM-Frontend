import BaseLayout from "../../components/layouts/BaseLayout";

export default function Profile() {
  return (
    <BaseLayout resourceName="Profile">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <p className="text-gray-600">View and edit user profile, roles and permissions.</p>
      </div>
    </BaseLayout>
  );
}
