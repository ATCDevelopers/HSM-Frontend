import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import type { PatientListRow } from "./types";

const PAGE_SIZE = 5;

// TODO: replace with real apiClient.get('/emr/patients?search=...&page=...')
async function mockFetchPatientList(search: string): Promise<PatientListRow[]> {
  await new Promise((res) => setTimeout(res, 300));
  const all: PatientListRow[] = [
    { patient_id: "PT-00125", patient_name: "Jane Adams", visit_id: "VIS-00231", diagnosis: "Malaria", bp: "120/80", lab_test_count: 1, prescription_count: 2, status: "normal" },
    { patient_id: "PT-00124", patient_name: "John Doe", visit_id: "VIS-00230", diagnosis: "Hypertension", bp: "185/122", lab_test_count: 2, prescription_count: 3, status: "critical" },
    { patient_id: "PT-00123", patient_name: "Peter John", visit_id: "VIS-00229", diagnosis: "Pending", bp: "125/82", lab_test_count: 3, prescription_count: 0, status: "normal" },
    { patient_id: "PT-00122", patient_name: "Amina Said", visit_id: "VIS-00228", diagnosis: "Migraine", bp: "119/79", lab_test_count: 1, prescription_count: 0, status: "normal" },
    { patient_id: "PT-00121", patient_name: "David Paul", visit_id: "VIS-00227", diagnosis: "Diabetes", bp: "130/85", lab_test_count: 2, prescription_count: 2, status: "critical" },
    { patient_id: "PT-00120", patient_name: "Grace Mushi", visit_id: "VIS-00226", diagnosis: "Asthma", bp: "118/76", lab_test_count: 1, prescription_count: 1, status: "normal" },
    { patient_id: "PT-00119", patient_name: "Emmanuel Kessy", visit_id: "VIS-00225", diagnosis: "Pneumonia", bp: "190/128", lab_test_count: 4, prescription_count: 3, status: "critical" },
    { patient_id: "PT-00118", patient_name: "Fatuma Rashid", visit_id: "VIS-00224", diagnosis: "Anemia", bp: "112/74", lab_test_count: 2, prescription_count: 1, status: "normal" },
    { patient_id: "PT-00117", patient_name: "Baraka Mollel", visit_id: "VIS-00223", diagnosis: "Typhoid", bp: "121/80", lab_test_count: 3, prescription_count: 2, status: "normal" },
    { patient_id: "PT-00116", patient_name: "Neema Shirima", visit_id: "VIS-00222", diagnosis: "Pending", bp: "117/78", lab_test_count: 1, prescription_count: 0, status: "normal" },
    { patient_id: "PT-00115", patient_name: "Hassan Juma", visit_id: "VIS-00221", diagnosis: "Cardiac Arrhythmia", bp: "88/56", lab_test_count: 3, prescription_count: 2, status: "critical" },
    { patient_id: "PT-00114", patient_name: "Zawadi Mkumbo", visit_id: "VIS-00220", diagnosis: "UTI", bp: "115/75", lab_test_count: 1, prescription_count: 1, status: "normal" },
    { patient_id: "PT-00113", patient_name: "Godfrey Massawe", visit_id: "VIS-00219", diagnosis: "Gastritis", bp: "122/81", lab_test_count: 1, prescription_count: 1, status: "normal" },
    { patient_id: "PT-00112", patient_name: "Salma Iddi", visit_id: "VIS-00218", diagnosis: "Severe Dehydration", bp: "82/54", lab_test_count: 2, prescription_count: 2, status: "critical" },
    { patient_id: "PT-00111", patient_name: "Erick Mwakalinga", visit_id: "VIS-00217", diagnosis: "Sprained Ankle", bp: "120/78", lab_test_count: 0, prescription_count: 1, status: "normal" },
    { patient_id: "PT-00110", patient_name: "Rehema Chacha", visit_id: "VIS-00216", diagnosis: "Pending", bp: "116/77", lab_test_count: 2, prescription_count: 0, status: "normal" },
    { patient_id: "PT-00109", patient_name: "Isaya Mrema", visit_id: "VIS-00215", diagnosis: "Diabetic Ketoacidosis", bp: "95/60", lab_test_count: 4, prescription_count: 3, status: "critical" },
    { patient_id: "PT-00108", patient_name: "Consolata Lyimo", visit_id: "VIS-00214", diagnosis: "Common Cold", bp: "118/79", lab_test_count: 0, prescription_count: 1, status: "normal" },
  ];

  return search
    ? all.filter(
        (p) =>
          p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          p.patient_id.toLowerCase().includes(search.toLowerCase())
      )
    : all;
}

const DIAGNOSIS_BADGE: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
};
const DEFAULT_BADGE = "bg-blue-100 text-blue-800";

export default function MedicalRecordsIndex() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [allRows, setAllRows] = useState<PatientListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    mockFetchPatientList(search).then((rows) => {
      // Critical patients surface first, per requested priority ordering.
      const sorted = [...rows].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === "critical" ? -1 : 1;
      });
      setAllRows(sorted);
      setLoading(false);
    });
  }, [search]);

  // Reset to page 1 whenever the search term changes, so a filtered result
  // never lands on a page that no longer has any rows.
  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = allRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  return (
    <BaseLayout resourceName="Medical Records">
      <div className="rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-lg font-bold text-gray-900">Medical Records</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Search and select a patient to view their complete EMR.
          </p>

          <div className="relative mt-4">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Patient Name, ID......."
              className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Patients</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Visits</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Diagnosis</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Vitals</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Lab Tests</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Prx</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-400">
                      Loading patients...
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-400">
                      No patients match your search.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr
                      key={row.patient_id}
                      onClick={() => navigate(`/medical-records/${row.patient_id}`)}
                      className={`cursor-pointer border-b border-gray-50 last:border-0 hover:bg-gray-50 ${
                        row.status === "critical" ? "bg-red-50/40" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{row.patient_name}</p>
                        <p className="text-xs text-gray-400">{row.patient_id}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{row.visit_id}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            DIAGNOSIS_BADGE[row.diagnosis] ?? DEFAULT_BADGE
                          }`}
                        >
                          {row.diagnosis}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{row.bp}</td>
                      <td className="px-4 py-3 text-gray-700">{row.lab_test_count} Test</td>
                      <td className="px-4 py-3 text-gray-700">{row.prescription_count}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            row.status === "critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              row.status === "critical" ? "bg-red-500" : "bg-green-500"
                            }`}
                          />
                          {row.status === "critical" ? "Critical" : "Normal"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-blue-600">View</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {allRows.length === 0
                ? "No patients found"
                : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                    currentPage * PAGE_SIZE,
                    allRows.length
                  )} of ${allRows.length} patients`}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`h-7 w-7 rounded-md text-xs font-semibold ${
                      p === currentPage ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}