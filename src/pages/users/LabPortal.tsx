import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function LabPortal() {
  return (
    <BaseLayout resourceName="Lab Portal">
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Laboratory Portal</h1>
          <p className="text-sm text-gray-500 mb-4">Sample tracking, test requests and results management.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Pending tests</div>
              <div className="text-xl font-bold mt-2">14</div>
              <div className="mt-3"><Button>Start analysis</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Samples awaiting pickup</div>
              <div className="text-xl font-bold mt-2 text-yellow-600">6</div>
              <div className="mt-3"><Button variant="outline">Manage samples</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Results ready</div>
              <div className="text-xl font-bold mt-2">9</div>
              <div className="mt-3"><Button variant="ghost">Publish</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
