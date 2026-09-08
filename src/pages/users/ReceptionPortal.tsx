import BaseLayout from "../../components/layouts/BaseLayout";

export default function ReceptionPortal() {
  return (
    <BaseLayout resourceName="Reception Portal">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Reception Portal</h1>
        <p className="text-gray-600">Check-in, appointment queue and patient arrival handling.</p>
      </div>
    </BaseLayout>
  );
}
