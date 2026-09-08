import BaseLayout from "../../components/layouts/BaseLayout";

export default function LabPortal() {
  return (
    <BaseLayout resourceName="Lab Portal">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Laboratory Portal</h1>
        <p className="text-gray-600">Sample tracking, test requests and results management.</p>
      </div>
    </BaseLayout>
  );
}
