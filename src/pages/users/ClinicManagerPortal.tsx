import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function ClinicManagerPortal() {
  return (
    <BaseLayout resourceName="Clinic Manager Portal">
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Clinic Manager Portal</h1>
          <p className="text-sm text-gray-500 mb-4">Clinic KPIs, staff roster and resource allocation.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Open shifts</div>
              <div className="text-xl font-bold mt-2">4</div>
              <div className="mt-3"><Button>Manage roster</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Clinic occupancy</div>
              <div className="text-xl font-bold mt-2">72%</div>
              <div className="mt-3"><Button variant="outline">View beds</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Staff alerts</div>
              <div className="text-xl font-bold mt-2">1</div>
              <div className="mt-3"><Button variant="ghost">Respond</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
