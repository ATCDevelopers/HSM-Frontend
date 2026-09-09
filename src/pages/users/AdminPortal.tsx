import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function AdminPortal() {
  return (
    <BaseLayout resourceName="Admin Portal">
      <div className="w-full py-6">
        <div className="w-full max-w-6xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4 text-center">Admin Portal</h1>
          <p className="text-sm text-gray-500 mb-4 text-center">System settings, user roles, and audits for administrators.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Roles</div>
              <div className="text-xl font-bold mt-2">Manage roles</div>
              <div className="mt-3"><Button onClick={() => {}}>View roles</Button></div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">Permissions</div>
              <div className="text-xl font-bold mt-2">Edit permissions</div>
              <div className="mt-3"><Button variant="outline" onClick={() => {}}>Audit logs</Button></div>
            </Card>
            <Card padding="p-4" className="text-center">
              <div className="text-sm text-gray-500">System</div>
              <div className="text-xl font-bold mt-2">Configuration</div>
              <div className="mt-3"><Button variant="ghost" onClick={() => {}}>Settings</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
