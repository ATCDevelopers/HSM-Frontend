import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import { getErrorMessage } from "../../services/apiResponse";
import { labTestAPI, labTestResultAPI, type FormFieldSchema, type LabTest } from "../../services/labTestConfigAPI";
import { appointmentAPI, doctorLabel, type Doctor } from "../../services/appointmentAPI";
import { labResultAPI, type LabResultWithTemplate } from "../../services/emrAPI";
import PatientPicker from "../../components/sections/PatientPicker";
import TestPicker from "./TestPicker";

const fieldClass = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

/** Returns an error message for one field, or "" when the value is acceptable. */
const validateField = (field: FormFieldSchema, raw: string): string => {
  if (!raw) return field.required ? `${field.label} is required.` : "";
  if (field.type === "number") {
    const n = Number(raw);
    if (Number.isNaN(n)) return `${field.label} must be a number.`;
  }
  if (field.type === "select" && field.options && !field.options.includes(raw)) return `Choose a valid option for ${field.label}.`;
  return "";
};

/** Values outside the template's min/max are allowed (they are real readings) but flagged for the doctor. */
const isOutOfRange = (field: FormFieldSchema, raw: string) => {
  if (field.type !== "number" || raw === "" || Number.isNaN(Number(raw))) return false;
  const n = Number(raw);
  return (field.validation?.min !== undefined && n < field.validation.min) || (field.validation?.max !== undefined && n > field.validation.max);
};

/**
 * Lock a patient, pick the test and the doctor to send it to, then fill in that test's own fields.
 * The patient stays locked after saving so several tests can be entered for them in a row.
 */
export default function EnterLabResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tests, setTests] = useState<LabTest[]>([]);
  const [recent, setRecent] = useState<LabResultWithTemplate[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [testId, setTestId] = useState(searchParams.get("testId") ?? "");
  const [patientId, setPatientId] = useState(searchParams.get("patientId") ?? "");
  const [doctorId, setDoctorId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    labTestAPI.list().then(setTests).catch((e: unknown) => setLoadError(getErrorMessage(e, "Failed to load tests")));
    appointmentAPI.doctors().then(setDoctors).catch(() => undefined);
  }, []);

  const loadRecent = (id: string) => {
    if (!id) return setRecent([]);
    labResultAPI
      .listByPatient(id)
      .then((rows) => setRecent([...rows].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")).slice(0, 5)))
      .catch(() => setRecent([]));
  };

  useEffect(() => loadRecent(patientId), [patientId]);

  const test = tests.find((t) => t.id === testId);

  const selectTest = (id: string) => {
    setTestId(id);
    setValues({});
    setErrors({});
  };

  const setValue = (field: FormFieldSchema, raw: string) => {
    setValues((prev) => ({ ...prev, [field.id]: raw }));
    if (errors[field.id]) setErrors((prev) => ({ ...prev, [field.id]: "" }));
  };

  /** Clears the filled-in test; `keepPatient` leaves the patient and doctor locked for the next test. */
  const reset = (keepPatient: boolean) => {
    setValues({});
    setNotes("");
    setErrors({});
    setTestId("");
    if (!keepPatient) {
      setPatientId("");
      setDoctorId("");
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!testId) nextErrors.test = "Choose a test.";
    if (!patientId) nextErrors.patient = "Choose a patient.";
    if (!doctorId) nextErrors.doctor = "Choose the doctor to send this result to.";
    test?.formSchema.forEach((field) => {
      const message = validateField(field, values[field.id]?.trim() ?? "");
      if (message) nextErrors[field.id] = message;
    });
    setErrors(nextErrors);
    if (!test || Object.values(nextErrors).some(Boolean)) return;

    const payload: Record<string, string | number> = {};
    test.formSchema.forEach((field) => {
      const raw = values[field.id]?.trim() ?? "";
      if (raw) payload[field.id] = field.type === "number" ? Number(raw) : raw;
    });

    setSaving(true);
    try {
      await labTestResultAPI.create({ labTestTemplateId: test.id, patientId, doctorId, values: payload, notes: notes.trim() || undefined });
      const doctor = doctors.find((d) => d.id === doctorId);
      const next = await Swal.fire({
        title: "Result sent",
        text: `${test.name} was saved and sent to Dr. ${doctor?.firstName ?? ""} ${doctor?.lastName ?? ""}.`,
        icon: "success",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Another test, same patient",
        denyButtonText: "New patient",
        denyButtonColor: "#475569",
        cancelButtonText: "View results",
      });
      if (next.isConfirmed) {
        reset(true);
        loadRecent(patientId);
      } else if (next.isDenied) reset(false);
      else navigate("/laboratory/results");
    } catch (err: unknown) {
      Swal.fire("Could not save result", getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const errorText = (key: string) => errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>;

  return (
    <BaseLayout resourceName="Enter Lab Results">
      <form onSubmit={submit} className="mx-auto w-full max-w-4xl space-y-6">
        <Link to="/laboratory" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to test catalog</Link>

        <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enter lab results</h1>
            <p className="text-sm text-gray-500">The result is saved to the patient's record and sent to the chosen doctor.</p>
          </div>

          {loadError && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{loadError}</div>}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">1. Patient *</p>
            <PatientPicker value={patientId} onChange={(p) => setPatientId(p?.id ?? "")} error={errors.patient} />
            {patientId && (
              <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                {recent.length === 0 ? (
                  "No lab results recorded for this patient yet."
                ) : (
                  <>
                    <span className="font-semibold text-gray-700">Recent results: </span>
                    {recent.map((r) => `${r.template?.name ?? "Test"} (${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"})`).join(" · ")}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">2. Test *</p>
            <TestPicker tests={tests} value={testId} onChange={selectTest} error={errors.test} />
          </div>

          <div className="sm:max-w-sm">
            <label className="text-sm font-medium text-gray-700">
              3. Send to doctor *
              <select className={`${fieldClass} mt-1`} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{doctorLabel(d)}</option>)}
              </select>
              {errorText("doctor")}
            </label>
          </div>
        </section>

        {test && (
          <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900">4. {test.name}</h2>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{test.category}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {test.formSchema.map((field) => {
                const raw = values[field.id] ?? "";
                const range =
                  field.validation && (field.validation.min !== undefined || field.validation.max !== undefined)
                    ? `Normal range: ${field.validation.min ?? "–"} to ${field.validation.max ?? "–"}`
                    : "";
                return (
                  <label key={field.id} className="text-sm font-medium text-gray-700">
                    {field.label} {field.required && "*"}
                    {field.type === "select" ? (
                      <select className={`${fieldClass} mt-1`} value={raw} onChange={(e) => setValue(field, e.target.value)}>
                        <option value="">Select an option</option>
                        {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        step="any"
                        className={`${fieldClass} mt-1 ${isOutOfRange(field, raw) ? "border-amber-400 bg-amber-50" : ""}`}
                        value={raw}
                        onChange={(e) => setValue(field, e.target.value)}
                      />
                    )}
                    {range && <span className={`mt-1 block text-xs ${isOutOfRange(field, raw) ? "font-semibold text-amber-700" : "text-gray-400"}`}>{isOutOfRange(field, raw) ? `Outside normal range (${range.replace("Normal range: ", "")})` : range}</span>}
                    {errorText(field.id)}
                  </label>
                );
              })}
            </div>

            <label className="block text-sm font-medium text-gray-700">
              Notes for the doctor
              <textarea rows={3} className={`${fieldClass} mt-1`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional observations, sample quality, etc." />
            </label>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate("/laboratory")} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                <PaperAirplaneIcon className="h-4 w-4" /> {saving ? "Sending..." : "Save & send to doctor"}
              </button>
            </div>
          </section>
        )}
      </form>
    </BaseLayout>
  );
}
