import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import { Patient, readPatients, writePatients } from "./patientStorage";

export default function PatientsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  useEffect(() => setPatient(readPatients().find((item) => item.id === id) || null), [id]);

  const deletePatient = () => {
    if (!patient || !window.confirm(`Delete ${patient.firstName} ${patient.lastName}?`)) return;
    writePatients(readPatients().filter((item) => item.id !== patient.id));
    navigate("/patients");
  };
  if (!patient) return <BaseLayout resourceName="Patient Details"><div className="rounded-2xl bg-blue-50 p-6 text-sm">Patient record not found.</div></BaseLayout>;

  const details = [["Patient ID", patient.id], ["First name", patient.firstName], ["Middle name", patient.middleName || "Not provided"], ["Last name", patient.lastName], ["Gender", patient.gender], ["Date of birth", patient.dateOfBirth], ["Phone number", patient.phone], ["Email", patient.email || "Not provided"], ["Blood group", patient.bloodGroup || "Not provided"], ["NHIF number", patient.nhifNumber || "Not provided"], ["National ID", patient.nationalId || "Not provided"], ["Status", patient.status]];
  return <BaseLayout resourceName="Patient Details">
    <div className="rounded-2xl bg-blue-50 p-6"><div className="mx-auto max-w-4xl"><button onClick={() => navigate("/patients")} className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to Patient Management</button><div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="flex items-center gap-5 border-b border-gray-200 pb-6">{patient.photo ? <img src={patient.photo} alt={`${patient.firstName} ${patient.lastName}`} className="h-20 w-20 rounded-full object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">{patient.firstName.charAt(0)}</div>}<div><h1 className="text-xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1><p className="text-sm text-gray-500">Registered patient record</p></div></div>
      <div className="grid grid-cols-1 gap-5 py-7 sm:grid-cols-2 md:grid-cols-3">{details.map(([label, value]) => <div key={label}><p className="mb-1 text-xs uppercase tracking-wide text-gray-400">{label}</p><p className="text-sm font-semibold text-gray-800">{value}</p></div>)}</div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5"><button onClick={() => navigate(`/patients/${patient.id}/edit`)} className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">Edit / Update</button><button onClick={() => navigate("/patients/register")} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Add Patient</button><button onClick={deletePatient} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete Patient</button></div>
    </div></div></div>
  </BaseLayout>;
}
