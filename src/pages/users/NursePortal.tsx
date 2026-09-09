import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function NursePortal() {
  return (
    <BaseLayout resourceName="Nurse Portal">
      <div className="w-full py-6">
        <div className="w-full max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Nurse Portal</h1>
          <p className="text-sm text-gray-500 mb-4 text-center">Patient queues, vitals, and assigned tasks for nursing staff.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Today's queue</div>
              <div className="text-xl font-bold mt-2">12 patients</div>
              <div className="mt-3 flex justify-center"><Button onClick={() => { window.location.assign('/appointments') }}>View queue</Button></div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Vitals pending</div>
              <div className="text-xl font-bold mt-2 text-yellow-600">4</div>
              <div className="mt-3 flex justify-center"><Button variant="outline" onClick={() => {}}>Start rounds</Button></div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Assigned tasks</div>
              <div className="text-xl font-bold mt-2">7</div>
              <div className="mt-3 flex justify-center"><Button variant="ghost" onClick={() => {}}>Manage tasks</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
