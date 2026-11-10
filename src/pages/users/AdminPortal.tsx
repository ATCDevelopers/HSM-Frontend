import Dashboard from "../dashboard/Index";

// Role landing page: the shared dashboard picks its cards and actions from the signed-in role.
export default function AdminPortal() {
  return <Dashboard title="Admin Portal" />;
}
