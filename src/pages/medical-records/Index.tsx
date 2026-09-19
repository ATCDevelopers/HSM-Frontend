import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import API from "../../services/api";
import type { PatientListRow } from "./types";

interface PatientListResponse {
  data?: PatientListRow[];
}

export default function MedicalRecordsIndex() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<PatientListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await API.get<PatientListResponse>("emr/patients", {
          params: { search },
        });
        setRows(response.data.data ?? []);
      } catch (requestError: unknown) {
        setRows([]);
        setError(requestError instanceof Error ? requestError.message : "Medical records API is not available yet");
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [search]);

  return (
    <BaseLayout resourceName="Medical Records">
      <div className="w-full space-y-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Medical Records</h1>
            <p className="mt-1 text-gray-500">Access and manage patient electronic medical records</p>
          </div>
          <span className="text-sm text-gray-500">Total Patients: <strong className="text-gray-900">{rows.length}</strong></span>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by patient name or ID..." className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-6 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>

        {error && <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}

        <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs scrollbar-thin">
          <table className="w-full min-w-full text-xs sm:text-sm">
            <thead className="bg-gray-50/90 text-left border-b border-gray-200">
              <tr>{["Patient", "Visit ID", "Diagnosis", "Vitals", "Lab Tests", "Rx", "Status", "Action"].map((heading) => <th key={heading} className="px-3 sm:px-6 py-2.5 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap">{heading}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={8} className="px-4 py-8 text-center text-xs sm:text-sm text-gray-400">Loading medical records...</td></tr> : rows.length ? rows.map((row) => <tr key={row.patient_id} className="hover:bg-blue-50/60 transition-colors">
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap"><p className="font-semibold text-gray-900">{row.patient_name}</p><p className="text-[11px] text-gray-400">{row.patient_id}</p></td>
                <td className="px-3 sm:px-6 py-3 text-gray-700 whitespace-nowrap">{row.visit_id}</td><td className="px-3 sm:px-6 py-3 text-gray-700 whitespace-nowrap">{row.diagnosis}</td><td className="px-3 sm:px-6 py-3 text-gray-700 whitespace-nowrap">{row.bp}</td><td className="px-3 sm:px-6 py-3 text-gray-700 whitespace-nowrap">{row.lab_test_count}</td><td className="px-3 sm:px-6 py-3 text-gray-700 whitespace-nowrap">{row.prescription_count}</td><td className="px-3 sm:px-6 py-3 whitespace-nowrap"><span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/50">{row.status}</span></td>
                <td className="px-3 sm:px-6 py-3 whitespace-nowrap"><button onClick={() => navigate(`/medical-records/${row.patient_id}`)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors">View Record</button></td>
              </tr>) : <tr><td colSpan={8} className="px-4 py-8 text-center text-xs sm:text-sm text-gray-400">No medical records available.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </BaseLayout>
  );
}
