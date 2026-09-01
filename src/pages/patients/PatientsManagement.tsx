import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import Dropdown from "../../components/atoms/ui/Dropdown";
import { Patient, readPatients, writePatients } from "./patientStorage";

const defaultPatients: Patient[] = [
  { id: "P-001", firstName: "Jane", lastName: "Adams", gender: "Female", dateOfBirth: "12.05.2003", phone: "0735368636", email: "", status: "ACTIVE", bloodGroup: "", nhifNumber: "", nationalId: "" },
  { id: "P-002", firstName: "John", lastName: "Doe", gender: "Male", dateOfBirth: "11.05.2003", phone: "0735368636", email: "", status: "ACTIVE", bloodGroup: "", nhifNumber: "", nationalId: "" },
  { id: "P-003", firstName: "Peter", lastName: "John", gender: "Male", dateOfBirth: "22.05.2003", phone: "0735368636", email: "", status: "ACTIVE", bloodGroup: "", nhifNumber: "", nationalId: "" },
  { id: "P-004", firstName: "Amina", lastName: "Said", gender: "Female", dateOfBirth: "01.05.2003", phone: "0735368636", email: "", status: "DEACTIVE", bloodGroup: "", nhifNumber: "", nationalId: "" },
];

export default function PatientManagement() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedPatients = readPatients();
    if (savedPatients.length) setPatients(savedPatients);
    else { writePatients(defaultPatients); setPatients(defaultPatients); }
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.trim().toLowerCase();
    return !search || [patient.id, patient.firstName, patient.middleName || "", patient.lastName, patient.phone, patient.email].some((value) => value.toLowerCase().includes(search));
  });
  const deletePatient = (patient: Patient) => {
    if (!window.confirm(`Delete ${patient.firstName} ${patient.lastName}?`)) return;
    const updated = patients.filter((item) => item.id !== patient.id);
    writePatients(updated); setPatients(updated);
  };
  const activePatients = patients.filter((patient) => patient.status === "ACTIVE").length;
  const deactivePatients = patients.filter((patient) => patient.status === "DEACTIVE").length;
  const getPatientActions = (patient: Patient) => [
    { label: "View", onClick: () => navigate(`/patients/${patient.id}`) },
    { label: "Edit", onClick: () => navigate(`/patients/${patient.id}/edit`) },
    { label: "Delete", onClick: () => deletePatient(patient), className: "text-red-600 hover:bg-red-50" },
  ];

  return <BaseLayout resourceName="Patients">
    <div className="rounded-2xl bg-blue-50 p-6"><div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold text-gray-900">Patient Management</h2><p className="mt-0.5 text-sm text-gray-500">Manage patient registration, records and information.</p></div><button onClick={() => navigate("/patients/register")} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Add Patient</button></div>
      <div className="relative mt-5"><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search patient name, ID or phone" aria-label="Search patients" className="w-full rounded-xl border border-gray-300 bg-white py-2.5 px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr>{["Patient", "Patient ID", "Gender", "Date of birth", "Phone", "Status", "Actions"].map((heading) => <th key={heading} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{heading}</th>)}</tr></thead><tbody>{filteredPatients.length ? filteredPatients.slice(0, 10).map((patient) => <tr key={patient.id} className="border-t border-gray-100 hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-gray-900">{patient.firstName} {patient.lastName}</td><td className="px-4 py-3 text-gray-700">{patient.id}</td><td className="px-4 py-3 text-gray-700">{patient.gender}</td><td className="px-4 py-3 text-gray-700">{patient.dateOfBirth}</td><td className="px-4 py-3 text-gray-700">{patient.phone}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${patient.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{patient.status}</span></td><td className="px-4 py-3"><Dropdown items={getPatientActions(patient)} trigger={<EllipsisVerticalIcon className="h-5 w-5" />} showChevron={false} triggerAriaLabel="Patient actions" position="bottom-right" triggerClassName="border-0 px-2 py-1 text-gray-500 hover:bg-gray-100" /></td></tr>) : <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No patients match your search.</td></tr>}</tbody></table></div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"><div className="rounded-xl bg-blue-100 p-3 text-center text-sm font-semibold text-blue-800">Total patients: {patients.length}</div><div className="rounded-xl bg-green-100 p-3 text-center text-sm font-semibold text-green-800">Active patients: {activePatients}</div><div className="rounded-xl bg-red-100 p-3 text-center text-sm font-semibold text-red-800">Deactive patients: {deactivePatients}</div></div>
      <p className="mt-3 text-xs text-gray-400">Showing {Math.min(filteredPatients.length, 10)} of {filteredPatients.length} patients</p>
    </div></div>
  </BaseLayout>;
}
