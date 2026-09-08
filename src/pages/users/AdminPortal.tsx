import BaseLayout from "../../components/layouts/BaseLayout";

export default function AdminPortal() {
  return (
    <BaseLayout resourceName="Admin Portal">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
        <p className="text-gray-600">System settings, user roles, and audits for administrators.</p>
      </div>
    </BaseLayout>
  );
}
