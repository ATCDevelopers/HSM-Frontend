import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import { Patient, readPatients, writePatients } from "./patientStorage";

const inputFields = [
  ["firstName", "First name", "text"],
  ["middleName", "Middle name", "text"],
  ["lastName", "Last name", "text"],
  ["email", "Email", "email"],
  ["phone", "Phone number", "tel"],
  ["dateOfBirth", "Date of birth", "date"],
  ["nhifNumber", "NHIF number", "text"],
  ["nationalId", "National ID", "text"],
] as const;

export default function RegisterPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "", email: "", gender: "", dateOfBirth: "",
    bloodGroup: "", phone: "", nhifNumber: "", nationalId: "", photo: "",
  });
  const [error, setError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setError("");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((current) => ({ ...current, photo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.gender || !formData.dateOfBirth || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    const patients = readPatients();
    const newPatient: Patient = {
      ...formData,
      id: `P-${String(patients.length + 1).padStart(3, "0")}`,
      status: "ACTIVE",
    };
    writePatients([...patients, newPatient]);
    navigate("/patients");
  };

  return (
    <BaseLayout resourceName="Register Patient">
      <div className="rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          <button onClick={() => navigate("/patients")} className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700">
            ← Back to Patient Management
          </button>
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-lg font-bold text-gray-900">Register New Patient</h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">Complete the form below to register a new patient.</p>
            {error && <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {inputFields.map(([name, label, type]) => (
                <label key={name} className="text-sm font-medium text-gray-700">
                  {label}{["firstName", "lastName", "phone"].includes(name) && <span className="ml-1 text-red-500">*</span>}
                  <input type={type} name={name} value={formData[name]} onChange={handleChange} required={["firstName", "lastName", "phone"].includes(name)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                </label>
              ))}
              <label className="text-sm font-medium text-gray-700">Gender<span className="ml-1 text-red-500">*</span>
                <select required name="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select>
              </label>
              <label className="text-sm font-medium text-gray-700">Blood group
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="">Select blood group</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group}>{group}</option>)}</select>
              </label>
              <label className="text-sm font-medium text-gray-700 md:col-span-2">Patient photo
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
              </label>
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 md:col-span-2"><button type="button" onClick={() => navigate("/patients")} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button><button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Register Patient</button></div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
