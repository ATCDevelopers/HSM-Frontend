import { useEffect, useState } from "react";
import BaseLayout from "../../components/layouts/BaseLayout";
import API from "../../services/api";

interface DashboardSummary {
  data?: Record<string, unknown>;
}

function Home() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get<DashboardSummary>("dashboard/summary")
      .then((response) => setSummary(response.data.data ?? null))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Dashboard API is not available yet"));
  }, []);

  return (
    <BaseLayout resourceName="Home">
      <div className="w-full space-y-8">
        <header>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-500">Hospital system overview</p>
        </header>
        {error && <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}
        {summary ? <pre className="overflow-auto rounded-xl bg-white p-6 text-xs text-gray-700 shadow-sm">{JSON.stringify(summary, null, 2)}</pre> : <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">Dashboard data will appear here when the summary API is connected.</div>}
      </div>
    </BaseLayout>
  );
}

export default Home;
