import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import API from "../../services/api";

interface MedicalRecordResponse {
  data?: Record<string, unknown>;
  message?: string;
}

export default function MedicalRecordsShow() {
  const { patientId = "" } = useParams();
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) return;
    API.get<MedicalRecordResponse>(`emr/patients/${patientId}`)
      .then((response) => setRecord(response.data.data ?? null))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Medical record API is not available yet"))
      .finally(() => setLoading(false));
  }, [patientId]);

  return (
    <BaseLayout resourceName="Medical Records">
      <div className="w-full rounded-2xl bg-blue-50 p-6">
        <Link to="/medical-records" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to Medical Records</Link>
        <div className="mt-4 rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Patient Medical Record</h1>
          <p className="mt-1 text-sm text-gray-500">Patient ID: {patientId || "Not selected"}</p>
          {loading && <p className="mt-8 text-sm text-gray-500">Loading medical record...</p>}
          {error && <p className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}
          {!loading && !error && !record && <p className="mt-8 rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">No medical record data available.</p>}
          {record && <pre className="mt-8 overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700">{JSON.stringify(record, null, 2)}</pre>}
        </div>
      </div>
    </BaseLayout>
  );
}
