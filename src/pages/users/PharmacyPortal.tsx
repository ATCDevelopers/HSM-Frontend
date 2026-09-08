import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function PharmacyPortal() {
  return (
    <BaseLayout resourceName="Pharmacy Portal">
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Pharmacy Portal</h1>
          <p className="text-sm text-gray-500 mb-4">Medicines, prescriptions, and dispensing workflow.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Pending prescriptions</div>
              <div className="text-xl font-bold mt-2">8</div>
              <div className="mt-3"><Button>Process</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Low stock items</div>
              <div className="text-xl font-bold mt-2 text-red-600">5</div>
              <div className="mt-3"><Button variant="outline">View stock</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Dispensing today</div>
              <div className="text-xl font-bold mt-2">23</div>
              <div className="mt-3"><Button variant="ghost">Reports</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
