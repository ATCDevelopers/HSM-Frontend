import BaseLayout from "../../components/layouts/BaseLayout";

export default function AccountantPortal() {
  return (
    <BaseLayout resourceName="Accountant Portal">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Accountant Portal</h1>
        <p className="text-gray-600">Billing, invoices and financial reports.</p>
      </div>
    </BaseLayout>
  );
}
