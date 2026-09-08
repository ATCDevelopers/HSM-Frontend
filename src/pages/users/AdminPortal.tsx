import BaseLayout from "../../components/layouts/BaseLayout";
import Card from "../../components/atoms/ui/Card";
import Button from "../../components/atoms/ui/Button";

export default function AdminPortal() {
  return (
    <BaseLayout resourceName="Admin Portal">
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">Admin Portal</h1>
          <p className="text-sm text-gray-500 mb-4">System settings, user roles, and audits for administrators.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Roles</div>
              <div className="text-xl font-bold mt-2">Manage roles</div>
              <div className="mt-3"><Button>View roles</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">Permissions</div>
              <div className="text-xl font-bold mt-2">Edit permissions</div>
              <div className="mt-3"><Button variant="outline">Audit logs</Button></div>
            </Card>
            <Card padding="p-4">
              <div className="text-sm text-gray-500">System</div>
              <div className="text-xl font-bold mt-2">Configuration</div>
              <div className="mt-3"><Button variant="ghost">Settings</Button></div>
            </Card>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
