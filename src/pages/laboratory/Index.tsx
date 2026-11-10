import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BeakerIcon, PlusIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import { labTestAPI, type LabTest } from "../../services/labTestConfigAPI";

/** Test catalog: every lab test template, with shortcuts to edit it or record a result with it. */
export default function LaboratoryIndex() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreate = can("create", "Lab_test", user?.role);
  const canUpdate = can("update", "Lab_test", user?.role);
  const canDelete = can("delete", "Lab_test", user?.role);
  const canEnterResults = can("create", "Laboratory", user?.role);

  const [tests, setTests] = useState<LabTest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    labTestAPI
      .list()
      .then(setTests)
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load lab tests")))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (test: LabTest) => {
    const confirm = await Swal.fire({
      title: `Archive ${test.name}?`,
      text: "Existing results keep their data; the test can no longer be used for new results.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Archive",
    });
    if (!confirm.isConfirmed) return;
    try {
      await labTestAPI.remove(test.id);
      setTests((prev) => prev.filter((t) => t.id !== test.id));
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e, "Failed to archive test"), "error");
    }
  };

  const term = search.trim().toLowerCase();
  const visible = tests.filter((t) => !term || [t.name, t.category, t.description ?? ""].some((v) => v.toLowerCase().includes(term)));

  return (
    <BaseLayout resourceName="Laboratory">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test catalog</h1>
            <p className="text-sm text-gray-500">{tests.length} lab test{tests.length === 1 ? "" : "s"} available</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canEnterResults && (
              <button onClick={() => navigate("/laboratory/results/new")} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Enter results
              </button>
            )}
            {canCreate && (
              <button onClick={() => navigate("/laboratory/new")} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" /> Create test
              </button>
            )}
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tests by name or category..."
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />

        {error && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}
        {loading && <p className="text-sm text-gray-400">Loading tests...</p>}
        {!loading && visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
            {tests.length === 0 ? "No lab tests yet. Create one to start recording results." : "No tests match your search."}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((test) => (
            <article key={test.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-blue-50 p-2 text-blue-600"><BeakerIcon className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900">{test.name}</h2>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{test.category}</p>
                </div>
              </div>
              {test.description && <p className="mt-3 line-clamp-2 text-sm text-gray-500">{test.description}</p>}
              <p className="mt-3 text-xs text-gray-500">
                {test.formSchema.length} field{test.formSchema.length === 1 ? "" : "s"}: {test.formSchema.slice(0, 4).map((f) => f.label).join(", ")}
                {test.formSchema.length > 4 && "…"}
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-4 text-sm font-medium">
                {canEnterResults && (
                  <button onClick={() => navigate(`/laboratory/results/new?testId=${test.id}`)} className="text-blue-600 hover:underline">Enter result</button>
                )}
                {canUpdate && <button onClick={() => navigate(`/laboratory/${test.id}/edit`)} className="text-gray-600 hover:underline">Edit</button>}
                {canDelete && <button onClick={() => remove(test)} className="text-red-600 hover:underline">Archive</button>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </BaseLayout>
  );
}
