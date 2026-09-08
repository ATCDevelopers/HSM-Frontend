import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function NursePortal() {
  return (
    <BaseLayout resourceName="Nurse Portal">
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Nurse Portal</h1>
          <p className="text-sm text-gray-500 mb-4">Patient queues, vitals, and assigned tasks for nursing staff.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Today's queue</div>
              <div className="text-xl font-bold mt-2">12 patients</div>
              <div className="mt-3"><Button>View queue</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Vitals pending</div>
              <div className="text-xl font-bold mt-2 text-yellow-600">4</div>
              <div className="mt-3"><Button variant="outline">Start rounds</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Assigned tasks</div>
              <div className="text-xl font-bold mt-2">7</div>
              <div className="mt-3"><Button variant="ghost">Manage tasks</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
