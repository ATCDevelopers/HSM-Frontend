import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function ReceptionPortal() {
  return (
    <BaseLayout resourceName="Reception Portal">
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Reception Portal</h1>
          <p className="text-sm text-gray-500 mb-4">Check-in, appointment queue and patient arrival handling.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Today arrivals</div>
              <div className="text-xl font-bold mt-2">18</div>
              <div className="mt-3"><Button>View arrivals</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Waiting time</div>
              <div className="text-xl font-bold mt-2">00:12</div>
              <div className="mt-3"><Button variant="outline">Manage queue</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Unpaid bills</div>
              <div className="text-xl font-bold mt-2 text-red-600">2</div>
              <div className="mt-3"><Button variant="ghost">Collect</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
