import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import type { PatientListRow } from "./types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const PAGE_SIZE = 5;

// TODO: replace with real apiClient.get('/emr/patients?search=...&page=...')
async function mockFetchPatientList(search: string): Promise<PatientListRow[]> {
  await new Promise((res) => setTimeout(res, 300));
  const all: PatientListRow[] = [
    {
      patient_id: "PT-00125",
      patient_name: "Jane Adams",
      visit_id: "VIS-00231",
      diagnosis: "Malaria",
      bp: "120/80",
      lab_test_count: 1,
      prescription_count: 2,
      status: "normal",
    },
    {
      patient_id: "PT-00124",
      patient_name: "John Doe",
      visit_id: "VIS-00230",
      diagnosis: "Hypertension",
      bp: "185/122",
      lab_test_count: 2,
      prescription_count: 3,
      status: "critical",
    },
    {
      patient_id: "PT-00123",
      patient_name: "Peter John",
      visit_id: "VIS-00229",
      diagnosis: "Pending",
      bp: "125/82",
      lab_test_count: 3,
      prescription_count: 0,
      status: "normal",
    },
    {
      patient_id: "PT-00122",
      patient_name: "Amina Said",
      visit_id: "VIS-00228",
      diagnosis: "Migraine",
      bp: "119/79",
      lab_test_count: 1,
      prescription_count: 0,
      status: "normal",
    },
    {
      patient_id: "PT-00121",
      patient_name: "David Paul",
      visit_id: "VIS-00227",
      diagnosis: "Diabetes",
      bp: "130/85",
      lab_test_count: 2,
      prescription_count: 2,
      status: "critical",
    },
    {
      patient_id: "PT-00120",
      patient_name: "Grace Mushi",
      visit_id: "VIS-00226",
      diagnosis: "Asthma",
      bp: "118/76",
      lab_test_count: 1,
      prescription_count: 1,
      status: "normal",
    },
    {
      patient_id: "PT-00119",
      patient_name: "Emmanuel Kessy",
      visit_id: "VIS-00225",
      diagnosis: "Pneumonia",
      bp: "190/128",
      lab_test_count: 4,
      prescription_count: 3,
      status: "critical",
    },
    {
      patient_id: "PT-00118",
      patient_name: "Fatuma Rashid",
      visit_id: "VIS-00224",
      diagnosis: "Anemia",
      bp: "112/74",
      lab_test_count: 2,
      prescription_count: 1,
      status: "normal",
    },
    {
      patient_id: "PT-00117",
      patient_name: "Baraka Mollel",
      visit_id: "VIS-00223",
      diagnosis: "Typhoid",
      bp: "121/80",
      lab_test_count: 3,
      prescription_count: 2,
      status: "normal",
    },
    {
      patient_id: "PT-00116",
      patient_name: "Neema Shirima",
      visit_id: "VIS-00222",
      diagnosis: "Pending",
      bp: "117/78",
      lab_test_count: 1,
      prescription_count: 0,
      status: "normal",
    },
    {
      patient_id: "PT-00115",
      patient_name: "Hassan Juma",
      visit_id: "VIS-00221",
      diagnosis: "Cardiac Arrhythmia",
      bp: "88/56",
      lab_test_count: 3,
      prescription_count: 2,
      status: "critical",
    },
    {
      patient_id: "PT-00114",
      patient_name: "Zawadi Mkumbo",
      visit_id: "VIS-00220",
      diagnosis: "UTI",
      bp: "115/75",
      lab_test_count: 1,
      prescription_count: 1,
      status: "normal",
    },
    {
      patient_id: "PT-00113",
      patient_name: "Godfrey Massawe",
      visit_id: "VIS-00219",
      diagnosis: "Gastritis",
      bp: "122/81",
      lab_test_count: 1,
      prescription_count: 1,
      status: "normal",
    },
    {
      patient_id: "PT-00112",
      patient_name: "Salma Iddi",
      visit_id: "VIS-00218",
      diagnosis: "Severe Dehydration",
      bp: "82/54",
      lab_test_count: 2,
      prescription_count: 2,
      status: "critical",
    },
    {
      patient_id: "PT-00111",
      patient_name: "Erick Mwakalinga",
      visit_id: "VIS-00217",
      diagnosis: "Sprained Ankle",
      bp: "120/78",
      lab_test_count: 0,
      prescription_count: 1,
      status: "normal",
    },
    {
      patient_id: "PT-00110",
      patient_name: "Rehema Chacha",
      visit_id: "VIS-00216",
      diagnosis: "Pending",
      bp: "116/77",
      lab_test_count: 2,
      prescription_count: 0,
      status: "normal",
    },
    {
      patient_id: "PT-00109",
      patient_name: "Isaya Mrema",
      visit_id: "VIS-00215",
      diagnosis: "Diabetic Ketoacidosis",
      bp: "95/60",
      lab_test_count: 4,
      prescription_count: 3,
      status: "critical",
    },
    {
      patient_id: "PT-00108",
      patient_name: "Consolata Lyimo",
      visit_id: "VIS-00214",
      diagnosis: "Common Cold",
      bp: "118/79",
      lab_test_count: 0,
      prescription_count: 1,
      status: "normal",
    },
  ];

  return search
    ? all.filter(
        (p) =>
          p.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          p.patient_id.toLowerCase().includes(search.toLowerCase()),
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
  const pageRows = allRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  return (
    <BaseLayout resourceName="Medical Records">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Medical Records
            </h1>
            <p className="text-gray-500 mt-1">
              Access and manage patient electronic medical records
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Total Patients:{" "}
            <span className="font-bold text-gray-900">{allRows.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name or ID..."
            className="w-full pl-12 pr-6 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Records
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {allRows.length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Critical Cases
            </p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {allRows.filter((r) => r.status === "critical").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Normal Status
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {allRows.filter((r) => r.status === "normal").length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Page
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {currentPage} / {totalPages}
            </p>
          </div>
        </div>

        {/* Patient Records Table */}
        <div>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Visit ID
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Diagnosis
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Vitals (BP)
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Lab Tests
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Rx
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading patient records...
                    </td>
                  </tr>
                ) : pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No patients match your search.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr
                      key={row.patient_id}
                      className={`hover:bg-gray-50 transition-colors ${
                        row.status === "critical" ? "bg-red-50/50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {row.patient_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {row.patient_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {row.visit_id}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            DIAGNOSIS_BADGE[row.diagnosis] ?? DEFAULT_BADGE
                          }`}
                        >
                          {row.diagnosis}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {row.bp}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {row.lab_test_count}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {row.prescription_count}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            row.status === "critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              row.status === "critical"
                                ? "bg-red-600"
                                : "bg-green-600"
                            }`}
                          />
                          {row.status === "critical" ? "Critical" : "Normal"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/medical-records/${row.patient_id}`)
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          View Record
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                  p === currentPage
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
