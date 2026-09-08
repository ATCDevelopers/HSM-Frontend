import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function AccountantPortal() {
  return (
    <BaseLayout resourceName="Accountant Portal">
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Accountant Portal</h1>
          <p className="text-sm text-gray-500 mb-4">Billing, invoices and financial reports.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Open invoices</div>
              <div className="text-xl font-bold mt-2">12</div>
              <div className="mt-3"><Button>Review</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Outstanding payments</div>
              <div className="text-xl font-bold mt-2 text-red-600">3</div>
              <div className="mt-3"><Button variant="outline">Collections</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Financial reports</div>
              <div className="text-xl font-bold mt-2">Monthly</div>
              <div className="mt-3"><Button variant="ghost">Export</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
