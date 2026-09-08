import BaseLayout from "../../components/layouts/BaseLayout";

export default function PharmacyPortal() {
  return (
    <BaseLayout resourceName="Pharmacy Portal">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Pharmacy Portal</h1>
        <p className="text-gray-600">Medicines, prescriptions, and dispensing workflow.</p>
      </div>
    </BaseLayout>
  );
}
