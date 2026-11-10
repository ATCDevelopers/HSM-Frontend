import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import Modal from "../../components/atoms/ui/Modal";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import { labTestResultAPI, type FormFieldSchema, type LabResultListItem } from "../../services/labTestConfigAPI";
import { appointmentAPI, type Doctor } from "../../services/appointmentAPI";

const fullName = (first: string | null, last: string | null, fallback: string) => [first, last].filter(Boolean).join(" ") || fallback;

const isAbnormal = (field: FormFieldSchema | undefined, value: string | number) => {
  if (!field || field.type !== "number" || typeof value !== "number") return false;
  return (field.validation?.min !== undefined && value < field.validation.min) || (field.validation?.max !== undefined && value > field.validation.max);
};

const abnormalCount = (r: LabResultListItem) =>
  Object.entries(r.values ?? {}).filter(([key, value]) => isAbnormal(r.formSchema?.find((f) => f.id === key), value)).length;

/** Lab results inbox. Doctors see the results sent to them; lab and admin staff see everything. */
export default function LabResults() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctor = user?.role === "Doctor";

  const [results, setResults] = useState<LabResultListItem[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorFilter, setDoctorFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LabResultListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isDoctor) appointmentAPI.doctors().then(setDoctors).catch(() => undefined);
  }, [isDoctor]);

  useEffect(() => {
    setLoading(true);
    labTestResultAPI
      .list(doctorFilter || undefined)
      .then(setResults)
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load results")))
      .finally(() => setLoading(false));
  }, [doctorFilter]);

  const term = search.trim().toLowerCase();
  const visible = results.filter(
    (r) => !term || [r.testName ?? "", fullName(r.patientFirstName, r.patientLastName, "")].some((v) => v.toLowerCase().includes(term)),
  );

  return (
    <BaseLayout resourceName="Lab Results">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isDoctor ? "Lab results sent to you" : "Lab results"}</h1>
            <p className="text-sm text-gray-500">{results.length} result{results.length === 1 ? "" : "s"} · out-of-range values are flagged</p>
          </div>
          {can("create", "Laboratory", user?.role) && (
            <button onClick={() => navigate("/laboratory/results/new")} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Enter results
            </button>
          )}
        </div>

        <div className={`grid gap-3 ${isDoctor ? "" : "sm:grid-cols-[2fr_1fr]"}`}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by patient or test..." className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
          {!isDoctor && (
            <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
              <option value="">All doctors</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
            </select>
          )}
        </div>

        {error && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Test</th><th className="px-4 py-3">Sent to</th><th className="px-4 py-3">Flags</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading results...</td></tr>}
              {!loading && visible.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No lab results yet.</td></tr>}
              {visible.map((r) => {
                const flags = abnormalCount(r);
                return (
                  <tr key={r.id} onClick={() => setSelected(r)} className="cursor-pointer hover:bg-blue-50/60">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{fullName(r.patientFirstName, r.patientLastName, "Unknown patient")}</td>
                    <td className="px-4 py-3">{r.testName ?? "Archived test"}</td>
                    <td className="px-4 py-3 text-gray-600">{r.doctorId ? `Dr. ${fullName(r.doctorFirstName, r.doctorLastName, "")}` : "—"}</td>
                    <td className="px-4 py-3">
                      {flags > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5" /> {flags} abnormal
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Normal</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.testName ?? "Lab result"} size="lg">
          {selected && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                {fullName(selected.patientFirstName, selected.patientLastName, "Unknown patient")} · {new Date(selected.createdAt).toLocaleString()}
                {selected.doctorId && ` · sent to Dr. ${fullName(selected.doctorFirstName, selected.doctorLastName, "")}`}
              </p>
              <dl className="grid gap-2 sm:grid-cols-2">
                {Object.entries(selected.values ?? {}).map(([key, value]) => {
                  const field = selected.formSchema?.find((f) => f.id === key);
                  const abnormal = isAbnormal(field, value);
                  return (
                    <div key={key} className={`rounded-lg p-3 ${abnormal ? "bg-amber-50 ring-1 ring-amber-200" : "bg-gray-50"}`}>
                      <dt className="text-xs text-gray-500">{field?.label ?? key}</dt>
                      <dd className={`font-semibold ${abnormal ? "text-amber-800" : "text-gray-900"}`}>
                        {String(value)}
                        {field?.validation && (field.validation.min !== undefined || field.validation.max !== undefined) && (
                          <span className="ml-2 text-xs font-normal text-gray-400">(normal {field.validation.min ?? "–"}–{field.validation.max ?? "–"})</span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
              {selected.notes && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900"><strong>Lab notes:</strong> {selected.notes}</p>}
              <div className="flex justify-end">
                <button onClick={() => navigate(`/medical-records/${selected.patientId}`)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Open patient record
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </BaseLayout>
  );
}
