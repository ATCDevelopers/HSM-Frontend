import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function LabPortal() {
  return (
    <BaseLayout resourceName="Lab Portal">
      <div className="w-full py-6">
        <div className="w-full max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Laboratory Portal</h1>
          <p className="text-sm text-gray-500 mb-4 text-center">Sample tracking, test requests and results management.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Pending tests</div>
              <div className="text-xl font-bold mt-2">14</div>
              <div className="mt-3 flex justify-center"><Button onClick={() => {}}>Start analysis</Button></div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Samples awaiting pickup</div>
              <div className="text-xl font-bold mt-2 text-yellow-600">6</div>
              <div className="mt-3 flex justify-center"><Button variant="outline" onClick={() => {}}>Manage samples</Button></div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Results ready</div>
              <div className="text-xl font-bold mt-2">9</div>
              <div className="mt-3 flex justify-center"><Button variant="ghost" onClick={() => {}}>Publish</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
