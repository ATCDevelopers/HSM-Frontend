import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { patientAPI, type Patient } from "../../services/patientAPI";
import { getErrorMessage } from "../../services/apiResponse";
import { consultationAPI, vitalsAPI, labResultAPI, type Consultation, type Vitals, type LabResultWithTemplate } from "../../services/emrAPI";
import { prescriptionAPI, prescriptionItemAPI, medicineAPI, type Prescription, type PrescriptionItem, type Medicine } from "../../services/pharmacyAPI";
import { statusLabel } from "../../services/statusAPI";
import LabHistoryPanel from "./LabHistoryPanel";
import PatientDocuments from "../../components/sections/PatientDocuments";

type Tab = "consultations" | "vitals" | "prescriptions" | "documents";

/** Tab data loaded once; `error` holds a per-tab message so one forbidden section doesn't hide the others. */
interface Section<T> {
  rows: T[];
  error: string;
}

const empty = <T,>(): Section<T> => ({ rows: [], error: "" });
const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "—");

const settle = async <T,>(promise: Promise<T[]>): Promise<Section<T>> => {
  try {
    return { rows: await promise, error: "" };
  } catch (e: unknown) {
    return { rows: [], error: getErrorMessage(e, "Could not load this section") };
  }
};

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">{children}</p>;
}

export default function MedicalRecordsShow() {
  const { patientId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("consultations");
  const [consultations, setConsultations] = useState(empty<Consultation>());
  const [vitals, setVitals] = useState(empty<Vitals>());
  const [labResults, setLabResults] = useState(empty<LabResultWithTemplate>());
  const [labLoading, setLabLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState(empty<Prescription>());
  const [items, setItems] = useState<Record<string, PrescriptionItem[]>>({});
  const [medicines, setMedicines] = useState<Record<string, Medicine>>({});

  useEffect(() => {
    if (!patientId) return;
    patientAPI.get(patientId).then(setPatient).catch((e: unknown) => setError(getErrorMessage(e, "Patient not found")));
    settle(consultationAPI.listByPatient(patientId)).then(setConsultations);
    settle(vitalsAPI.listByPatient(patientId)).then(setVitals);
    settle(labResultAPI.listByPatient(patientId)).then((section) => {
      setLabResults(section);
      setLabLoading(false);
    });
    settle(prescriptionAPI.listByPatient(patientId)).then(async (section) => {
      setPrescriptions(section);
      const entries = await Promise.all(
        section.rows.map(async (p) => [p.id, await prescriptionItemAPI.listByPrescription(p.id).catch(() => [])] as const),
      );
      setItems(Object.fromEntries(entries));
    });
    medicineAPI
      .list()
      .then((list) => setMedicines(Object.fromEntries(list.map((m) => [m.id, m]))))
      .catch(() => undefined);
  }, [patientId]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "consultations", label: "Consultations", count: consultations.rows.length },
    { id: "vitals", label: "Vitals", count: vitals.rows.length },
    { id: "prescriptions", label: "Prescriptions", count: prescriptions.rows.length },
    { id: "documents", label: "Outside documents", count: -1 },
  ];

  const actions = [
    can("write", "Consultation", role) && { label: "New consultation", to: `/medical-records/consultations/new?patientId=${patientId}` },
    can("create", "Vitals", role) && { label: "Record vitals", to: `/medical-records/vitals/new?patientId=${patientId}` },
    can("write", "Prescription", role) && { label: "Prescribe", to: `/medical-records/prescriptions/new?patientId=${patientId}` },
    can("create", "Laboratory", role) && { label: "Enter lab result", to: `/laboratory/results/new?patientId=${patientId}` },
    can("create", "Appointment", role) && { label: "Book appointment", to: `/appointments/new?patientId=${patientId}` },
  ].filter((a): a is { label: string; to: string } => Boolean(a));

  const age = patient?.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / 31_557_600_000) : null;

  return (
    <BaseLayout resourceName="Medical Records">
      <div className="w-full space-y-6">
        <Link to="/medical-records" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to Medical Records</Link>

        {error && <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient ? `${patient.firstName} ${patient.lastName}` : "Loading patient..."}</h1>
              {patient && (
                <p className="mt-1 text-sm text-gray-500">
                  {patient.gender} · {age !== null ? `${age} yrs` : "age unknown"} · Blood group {patient.bloodGroup || "—"} · {patient.phoneNumber}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map((a) => (
                <button key={a.label} type="button" onClick={() => navigate(a.to)} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${tab === t.id ? "bg-blue-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"}`}
            >
              {t.label}{t.count >= 0 && ` (${t.count})`}
            </button>
          ))}
        </div>

        <section className="space-y-3">
          {tab === "consultations" && (
            consultations.error ? <Empty>{consultations.error}</Empty> : consultations.rows.length === 0 ? <Empty>No consultations recorded.</Empty> :
            consultations.rows.map((c) => (
              <article key={c.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{c.chiefComplaint}</h3>
                  <span className="text-xs text-gray-500">{formatDate(c.createdAt)}{c.doctorName && ` · Dr. ${c.doctorName}`}</span>
                </div>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ["History of present illness", c.historyOfPresentIllness],
                    ["Medical history", c.medicalHistory],
                    ["Physical examination", c.physicalExamination],
                    ["Preliminary diagnosis", c.preliminaryDiagnosis],
                    ["Investigations requested", c.investigationRequirements],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs uppercase tracking-wider text-gray-400">{label}</dt>
                      <dd className="mt-0.5 whitespace-pre-line text-gray-800">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))
          )}

          {tab === "vitals" && (
            vitals.error ? <Empty>{vitals.error}</Empty> : vitals.rows.length === 0 ? <Empty>No vitals recorded.</Empty> : (
              <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                    <tr>{["Date", "BP", "Temp °C", "HR", "RR", "SpO₂ %", "Weight kg", "Height cm"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {vitals.rows.map((v) => (
                      <tr key={v.id}>
                        <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(v.createdAt)}</td>
                        <td className="px-4 py-2.5">{v.bloodPressureSystolic ?? "—"}/{v.bloodPressureDiastolic ?? "—"}</td>
                        <td className="px-4 py-2.5">{v.temperature ?? "—"}</td>
                        <td className="px-4 py-2.5">{v.heartRate ?? "—"}</td>
                        <td className="px-4 py-2.5">{v.respiratoryRate ?? "—"}</td>
                        <td className="px-4 py-2.5">{v.oxygenSaturation ?? "—"}</td>
                        <td className="px-4 py-2.5">{v.weight ?? "—"}</td>
                        <td className="px-4 py-2.5">{v.height ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {tab === "documents" && patientId && <PatientDocuments patientId={patientId} />}

          {tab === "prescriptions" && (
            prescriptions.error ? <Empty>{prescriptions.error}</Empty> : prescriptions.rows.length === 0 ? <Empty>No prescriptions recorded.</Empty> :
            prescriptions.rows.map((p) => (
              <article key={p.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">Prescription · {formatDate(p.createdAt)}</h3>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{statusLabel(p.statusName)}</span>
                </div>
                {p.doctorName && <p className="text-xs text-gray-500">Dr. {p.doctorName}</p>}
                <ul className="mt-3 space-y-1 text-sm text-gray-800">
                  {(items[p.id] ?? []).map((item) => {
                    const med = medicines[item.medicineId];
                    return (
                      <li key={item.id}>
                        <strong>{med ? `${med.genericName} ${med.strength}` : "Medicine"}</strong> — {item.dosage}, {item.frequency}× daily for {item.durationOfTime} (qty {item.quantity})
                        {item.instruction && <span className="text-gray-500"> · {item.instruction}</span>}
                      </li>
                    );
                  })}
                </ul>
                {p.notes && <p className="mt-2 text-sm text-gray-500">{p.notes}</p>}
              </article>
            ))
          )}
        </section>
        </div>

        <LabHistoryPanel patient={patient} results={labResults.rows} error={labResults.error} loading={labLoading} />
        </div>
      </div>
    </BaseLayout>
  );
}
