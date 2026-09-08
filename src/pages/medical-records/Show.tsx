import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import ConsultationDetailModal from "./ConsultationDetailModal";
import { exportPatientRecordPdf } from "./exportPatientPdf";
import type {
  PatientHeader,
  ConsultationRow,
  VitalsRow,
  LabTestRow,
  PrescriptionRow,
  DiagnosisRow,
} from "./types";

type TabKey = "consultation" | "vitals" | "lab" | "rx" | "dx";

const TABS: { key: TabKey; label: string }[] = [
  { key: "consultation", label: "Consultation" },
  { key: "vitals", label: "Vitals" },
  { key: "lab", label: "Lab test" },
  { key: "rx", label: "Prescription" },
  { key: "dx", label: "Diagnosis" },
];

// Patient database
const PATIENT_DATABASE: Record<
  string,
  {
    name: string;
    gender: string;
    age: number;
    phone: string;
    diagnosis: string;
    bp: string;
  }
> = {
  "PT-00125": {
    name: "Jane Adams",
    gender: "Female",
    age: 24,
    phone: "+255 717 890 123",
    diagnosis: "Malaria",
    bp: "120/80",
  },
  "PT-00124": {
    name: "John Doe",
    gender: "Male",
    age: 45,
    phone: "+255 654 321 098",
    diagnosis: "Hypertension",
    bp: "185/122",
  },
  "PT-00123": {
    name: "Peter John",
    gender: "Male",
    age: 38,
    phone: "+255 712 345 678",
    diagnosis: "Pending",
    bp: "125/82",
  },
  "PT-00122": {
    name: "Amina Said",
    gender: "Female",
    age: 31,
    phone: "+255 789 012 345",
    diagnosis: "Migraine",
    bp: "119/79",
  },
  "PT-00121": {
    name: "David Paul",
    gender: "Male",
    age: 55,
    phone: "+255 723 456 789",
    diagnosis: "Diabetes",
    bp: "130/85",
  },
  "PT-00120": {
    name: "Grace Mushi",
    gender: "Female",
    age: 28,
    phone: "+255 701 234 567",
    diagnosis: "Asthma",
    bp: "118/76",
  },
  "PT-00119": {
    name: "Emmanuel Kessy",
    gender: "Male",
    age: 52,
    phone: "+255 715 678 901",
    diagnosis: "Pneumonia",
    bp: "190/128",
  },
  "PT-00118": {
    name: "Fatuma Rashid",
    gender: "Female",
    age: 42,
    phone: "+255 738 901 234",
    diagnosis: "Anemia",
    bp: "112/74",
  },
  "PT-00117": {
    name: "Baraka Mollel",
    gender: "Male",
    age: 35,
    phone: "+255 722 567 890",
    diagnosis: "Typhoid",
    bp: "121/80",
  },
  "PT-00116": {
    name: "Neema Shirima",
    gender: "Female",
    age: 29,
    phone: "+255 714 890 123",
    diagnosis: "Pending",
    bp: "117/78",
  },
  "PT-00115": {
    name: "Hassan Juma",
    gender: "Male",
    age: 60,
    phone: "+255 704 567 890",
    diagnosis: "Cardiac Arrhythmia",
    bp: "88/56",
  },
  "PT-00114": {
    name: "Zawadi Mkumbo",
    gender: "Female",
    age: 33,
    phone: "+255 719 234 567",
    diagnosis: "UTI",
    bp: "115/75",
  },
  "PT-00113": {
    name: "Godfrey Massawe",
    gender: "Male",
    age: 48,
    phone: "+255 706 789 012",
    diagnosis: "Gastritis",
    bp: "122/81",
  },
  "PT-00112": {
    name: "Salma Iddi",
    gender: "Female",
    age: 26,
    phone: "+255 710 345 678",
    diagnosis: "Severe Dehydration",
    bp: "82/54",
  },
  "PT-00111": {
    name: "Erick Mwakalinga",
    gender: "Male",
    age: 34,
    phone: "+255 725 678 901",
    diagnosis: "Sprained Ankle",
    bp: "120/78",
  },
  "PT-00110": {
    name: "Rehema Chacha",
    gender: "Female",
    age: 41,
    phone: "+255 708 901 234",
    diagnosis: "Pending",
    bp: "116/77",
  },
  "PT-00109": {
    name: "Isaya Mrema",
    gender: "Male",
    age: 51,
    phone: "+255 713 567 890",
    diagnosis: "Diabetic Ketoacidosis",
    bp: "95/60",
  },
  "PT-00108": {
    name: "Consolata Lyimo",
    gender: "Female",
    age: 27,
    phone: "+255 732 456 789",
    diagnosis: "Common Cold",
    bp: "118/79",
  },
};

async function mockFetchPatientHeader(
  patientId: string,
): Promise<PatientHeader> {
  await new Promise((res) => setTimeout(res, 200));
  const patient = PATIENT_DATABASE[patientId];

  if (!patient) {
    return {
      patient_id: patientId,
      name: "Unknown Patient",
      gender: "Unknown",
      age: 0,
      phone: "N/A",
    };
  }

  return {
    patient_id: patientId,
    name: patient.name,
    gender: patient.gender,
    age: patient.age,
    phone: patient.phone,
  };
}
async function mockFetchConsultations(
  patientId: string,
): Promise<ConsultationRow[]> {
  const patient = PATIENT_DATABASE[patientId];
  const diagnosis = patient?.diagnosis || "Unknown";

  return [
    {
      consultation_id: "c1",
      date: "19 Aug 2026",
      doctor_name: "Dr. Smith",
      chief_complaint: "Medical consultation",
      diagnosis: diagnosis,
      history_of_present_illness: "Patient presented for consultation.",
      physical_examination:
        "Patient alert; examination findings recorded by doctor.",
      investigation_requirement:
        diagnosis !== "Pending"
          ? `${diagnosis} test requested`
          : "Pending investigation",
      visit_id: "VIS-00231",
    },
    {
      consultation_id: "c2",
      date: "05 Aug 2026",
      doctor_name: "Dr. Adams",
      chief_complaint: "Routine follow-up",
      diagnosis: diagnosis,
      history_of_present_illness: "Patient managing current condition.",
      physical_examination: "Patient stable on current treatment.",
      investigation_requirement: "No further tests required",
      visit_id: "VIS-00220",
    },
  ];
}
async function mockFetchVitals(patientId: string): Promise<VitalsRow[]> {
  const patient = PATIENT_DATABASE[patientId];
  const bp = patient?.bp || "120/80";

  return [
    {
      date: "19 Aug 2026",
      bp: bp,
      temp: "37.2°C",
      hr: "75",
      rr: "18",
      spo2: "98%",
      weight: "70kg",
    },
    {
      date: "05 Aug 2026",
      bp: bp,
      temp: "36.9°C",
      hr: "72",
      rr: "17",
      spo2: "99%",
      weight: "70kg",
    },
  ];
}
async function mockFetchLabTests(patientId: string): Promise<LabTestRow[]> {
  const patient = PATIENT_DATABASE[patientId];
  const testName = patient?.diagnosis || "General Test";

  return [
    {
      date: "19 Aug 2026",
      test: `${testName} Test`,
      status: "Completed",
      result: "Results Available",
    },
    { date: "05 Aug 2026", test: "CBC", status: "Completed", result: "Normal" },
  ];
}
async function mockFetchPrescriptions(
  patientId: string,
): Promise<PrescriptionRow[]> {
  return [
    {
      date: "19 Aug 2026",
      medication: "Artemether",
      dose: "80 mg",
      frequency: "BD",
      status: "Active",
    },
    {
      date: "05 Aug 2026",
      medication: "Paracetamol",
      dose: "500 mg",
      frequency: "TDS",
      status: "Active",
    },
  ];
}
async function mockFetchDiagnoses(patientId: string): Promise<DiagnosisRow[]> {
  const patient = PATIENT_DATABASE[patientId];
  const diagnosis = patient?.diagnosis || "Unknown";

  return [
    {
      date: "19 Aug 2026",
      diagnosis: diagnosis,
      icd10: "B54",
      status: "Active",
    },
    {
      date: "05 Aug 2026",
      diagnosis: diagnosis,
      icd10: "I10",
      status: "Active",
    },
  ];
}

const STATUS_BADGE: Record<string, string> = {
  Completed: "text-blue-600 font-semibold",
  Active: "text-blue-600 font-semibold",
  Pending: "text-gray-500",
  Resolved: "text-gray-500",
};

export default function MedicalRecordsShow() {
  const { patientId = "" } = useParams();
  const [activeTab, setActiveTab] = useState<TabKey>("consultation");

  const [header, setHeader] = useState<PatientHeader | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [vitals, setVitals] = useState<VitalsRow[]>([]);
  const [labTests, setLabTests] = useState<LabTestRow[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([]);
  const [diagnoses, setDiagnoses] = useState<DiagnosisRow[]>([]);
  const [selectedConsultation, setSelectedConsultation] =
    useState<ConsultationRow | null>(null);

  useEffect(() => {
    mockFetchPatientHeader(patientId).then(setHeader);
    mockFetchConsultations(patientId).then(setConsultations);
    mockFetchVitals(patientId).then(setVitals);
    mockFetchLabTests(patientId).then(setLabTests);
    mockFetchPrescriptions(patientId).then(setPrescriptions);
    mockFetchDiagnoses(patientId).then(setDiagnoses);
  }, [patientId]);

  const handleExportPdf = () => {
    if (!header) return;
    exportPatientRecordPdf({
      header,
      consultations,
      vitals,
      labTests,
      prescriptions,
      diagnoses,
    });
  };

  return (
    <BaseLayout resourceName="Medical Records">
      <div className="rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/medical-records"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Medical Records
          </Link>

          {header && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {header.name}
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  {header.patient_id} · {header.gender} · {header.age} years ·{" "}
                  {header.phone}
                </p>
              </div>
              <button
                onClick={handleExportPdf}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H8a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v11a2 2 0 01-2 2z"
                  />
                </svg>
                Export as PDF
              </button>
            </div>
          )}

          <div className="mt-3 flex gap-1.5 rounded-xl border border-gray-200 bg-white p-1.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
            {activeTab === "consultation" && (
              <>
                <h4 className="mb-3 font-bold text-gray-900">Consultations</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Doctor</th>
                      <th className="pb-2">Complaints</th>
                      <th className="pb-2">Diagnosis</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map((c) => (
                      <tr
                        key={c.consultation_id}
                        className="border-t border-gray-100"
                      >
                        <td className="py-2.5">{c.date}</td>
                        <td className="py-2.5">{c.doctor_name}</td>
                        <td className="py-2.5">{c.chief_complaint}</td>
                        <td className="py-2.5">{c.diagnosis}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => setSelectedConsultation(c)}
                            className="font-semibold text-blue-600 hover:text-blue-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === "vitals" && (
              <>
                <h4 className="mb-3 font-bold text-gray-900">Vitals</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Bp</th>
                      <th className="pb-2">Temp</th>
                      <th className="pb-2">HR</th>
                      <th className="pb-2">RR</th>
                      <th className="pb-2">SpO</th>
                      <th className="pb-2">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitals.map((v, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2.5">{v.date}</td>
                        <td className="py-2.5">{v.bp}</td>
                        <td className="py-2.5">{v.temp}</td>
                        <td className="py-2.5">{v.hr}</td>
                        <td className="py-2.5">{v.rr}</td>
                        <td className="py-2.5">{v.spo2}</td>
                        <td className="py-2.5">{v.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === "lab" && (
              <>
                <h4 className="mb-3 font-bold text-gray-900">Lab Test</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Test</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Result</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {labTests.map((l, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2.5">{l.date}</td>
                        <td className="py-2.5">{l.test}</td>
                        <td className={`py-2.5 ${STATUS_BADGE[l.status]}`}>
                          {l.status}
                        </td>
                        <td className="py-2.5">{l.result}</td>
                        <td className="py-2.5 text-right">
                          <span className="font-semibold text-blue-600">
                            View
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === "rx" && (
              <>
                <h4 className="mb-3 font-bold text-gray-900">Prescriptions</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Medication</th>
                      <th className="pb-2">Dose</th>
                      <th className="pb-2">Frequency</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((p, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2.5">{p.date}</td>
                        <td className="py-2.5">{p.medication}</td>
                        <td className="py-2.5">{p.dose}</td>
                        <td className="py-2.5">{p.frequency}</td>
                        <td className={`py-2.5 ${STATUS_BADGE[p.status]}`}>
                          {p.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {activeTab === "dx" && (
              <>
                <h4 className="mb-3 font-bold text-gray-900">Diagnosis</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Diagnosis</th>
                      <th className="pb-2">ICD-10</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnoses.map((d, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="py-2.5">{d.date}</td>
                        <td className="py-2.5">{d.diagnosis}</td>
                        <td className="py-2.5">{d.icd10}</td>
                        <td className={`py-2.5 ${STATUS_BADGE[d.status]}`}>
                          {d.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedConsultation && (
        <ConsultationDetailModal
          consultation={selectedConsultation}
          onClose={() => setSelectedConsultation(null)}
        />
      )}
    </BaseLayout>
  );
}
