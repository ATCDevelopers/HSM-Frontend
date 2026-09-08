import BaseLayout from "../../components/layouts/BaseLayout";

export default function NursePortal() {
  return (
    <BaseLayout resourceName="Nurse Portal">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Nurse Portal</h1>
        <p className="text-gray-600">Patient queues, vitals, and assigned tasks for nursing staff.</p>
      </div>
    </BaseLayout>
  );
}
