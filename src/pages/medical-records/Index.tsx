import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import Table from "../../components/sections/Table";
import { patientAPI, type Patient } from "../../services/patientAPI";
import { getErrorMessage } from "../../services/apiResponse";

export default function MedicalRecordsIndex() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    patientAPI
      .list()
      .then(setPatients)
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load patients")))
      .finally(() => setLoading(false));
  }, []);

  const term = search.trim().toLowerCase();
  const rows = patients.filter(
    (p) => !term || [p.id, p.firstName, p.middleName ?? "", p.lastName, p.phoneNumber, p.nhifCard].some((v) => (v ?? "").toLowerCase().includes(term)),
  );

  const columns = [
    {
      key: "name",
      title: "Patient",
      render: (_: unknown, p: Patient) => (
        <div>
          <p className="font-semibold text-gray-900">{p.firstName} {p.lastName}</p>
          <p className="text-[11px] text-gray-400">{p.id}</p>
        </div>
      ),
    },
    { key: "gender", title: "Gender" },
    { key: "dateOfBirth", title: "Date of birth", render: (v: string) => (v ? new Date(v).toLocaleDateString() : "—") },
    { key: "bloodGroup", title: "Blood group" },
    { key: "phoneNumber", title: "Phone" },
    {
      key: "action",
      title: "",
      render: (_: unknown, p: Patient) => (
        <button onClick={() => navigate(`/medical-records/${p.id}`)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
          View record
        </button>
      ),
    },
  ];

  return (
    <BaseLayout resourceName="Medical Records">
      <div className="w-full space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">Medical Records</h1>
            <p className="mt-1 text-gray-500">Consultations, vitals, lab results and prescriptions per patient</p>
          </div>
          <span className="text-sm text-gray-500">Patients: <strong className="text-gray-900">{rows.length}</strong></span>
        </div>

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, NHIF card or ID..."
            className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-12 pr-6 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {error && <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}

        <Table columns={columns} data={rows} loading={loading} emptyMessage="No patients found." />
      </div>
    </BaseLayout>
  );
}
