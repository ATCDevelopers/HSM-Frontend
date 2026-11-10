import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import { getErrorMessage } from "../../services/apiResponse";
import { statusAPI, statusLabel, MISSING_STATUSES_MESSAGE, type Status, type StatusGroup } from "../../services/statusAPI";

const GROUPS: StatusGroup[] = ["medicine", "prescription", "invoice"];

/**
 * Settings - reference data the other modules depend on.
 * Statuses are read-only here; they are created by the backend seed script.
 */
function Settings() {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<Record<string, Status[]>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all(GROUPS.map(async (g) => [g, await statusAPI.list(g)] as const))
      .then((entries) => setStatuses(Object.fromEntries(entries)))
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load statuses")));
  }, []);

  const missing = GROUPS.some((g) => statuses[g] && statuses[g].length === 0);

  return (
    <BaseLayout resourceName="Settings">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">System reference data</p>
        </div>

        <section className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Departments", detail: "Create and organise hospital departments", to: "/departments" },
            { label: "Staff accounts", detail: "Register staff and assign roles", to: "/users" },
          ].map((link) => (
            <button key={link.to} onClick={() => navigate(link.to)} className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-blue-300">
              <p className="font-semibold text-gray-900">{link.label}</p>
              <p className="text-sm text-gray-500">{link.detail}</p>
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-gray-900">Statuses</h2>
          <p className="text-sm text-gray-500">Used by medicines, prescriptions and invoices.</p>
          {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {missing && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{MISSING_STATUSES_MESSAGE}</p>}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {GROUPS.map((g) => (
              <div key={g}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{g}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {(statuses[g] ?? []).map((s) => <li key={s.id} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{statusLabel(s.name)}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}

export default Settings;
