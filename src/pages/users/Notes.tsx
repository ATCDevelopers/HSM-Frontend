import BaseLayout from "../../components/layouts/BaseLayout";

export default function Notes() {
  return (
    <BaseLayout resourceName="User Notes">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Notes</h1>
        <p className="text-gray-600">Create and view user-specific notes and audit comments.</p>
      </div>
    </BaseLayout>
  );
}
