import BaseLayout from "../../components/layouts/BaseLayout";

export default function ClinicManagerPortal() {
  return (
    <BaseLayout resourceName="Clinic Manager Portal">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Clinic Manager Portal</h1>
        <p className="text-gray-600">Clinic KPIs, staff roster and resource allocation.</p>
      </div>
    </BaseLayout>
  );
}
