import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function ClinicManagerPortal() {
  return (
    <BaseLayout resourceName="Clinic Manager Portal">
      <div className="w-full py-6">
        <div className="w-full max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Clinic Manager Portal</h1>
          <p className="text-sm text-gray-500 mb-4 text-center">Clinic KPIs, staff roster and resource allocation.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Open shifts</div>
              <div className="text-xl font-bold mt-2">4</div>
              <div className="mt-3 flex justify-center"><Button onClick={() => {}}>Manage roster</Button></div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Clinic occupancy</div>
              <div className="text-xl font-bold mt-2">72%</div>
              <div className="mt-3 flex justify-center"><Button variant="outline" onClick={() => {}}>View beds</Button></div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Staff alerts</div>
              <div className="text-xl font-bold mt-2">1</div>
              <div className="mt-3 flex justify-center"><Button variant="ghost" onClick={() => {}}>Respond</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
