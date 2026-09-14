import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import { patientAPI, type Patient } from "../../services/patientAPI";
import Swal from "sweetalert2";

const inputFields = [
  ["firstName", "First name", "text"], ["middleName", "Middle name", "text"], ["lastName", "Last name", "text"],
  ["email", "Email", "email"], ["phone", "Phone number", "tel"],
  ["dateOfBirth", "Date of birth", "date"], ["nhifNumber", "NHIF number", "text"],
  ["nationalId", "National ID", "text"],
] as const;

export default function EditPatients() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Patient | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) patientAPI.get(id).then(setFormData).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Patient not found"));
  }, [id]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (formData) setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData) return;
    try {
      await patientAPI.update(formData.id, formData);
      await Swal.fire({
        title: "Patient Updated!",
        text: "Patient details updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate(`/patients/${formData.id}`);
    } catch (requestError: unknown) {
      const msg = requestError instanceof Error ? requestError.message : "Patient update failed";
      setError(msg);
      Swal.fire("Update Failed", msg, "error");
    }
  };

  if (!formData) return <BaseLayout resourceName="Edit Patient"><div className="rounded-2xl bg-blue-50 p-6 text-sm">{error || "Loading patient record..."}</div></BaseLayout>;

  return (
    <BaseLayout resourceName="Edit Patient">
      <div className="w-full rounded-2xl bg-blue-50 p-6"><div className="mx-auto w-full max-w-6xl">
        <button onClick={() => navigate(`/patients/${formData.id}`)} className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to Patient Details</button>
        <div className="w-full rounded-2xl bg-white p-8 shadow-sm">{error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}<h1 className="text-lg font-bold text-gray-900">Edit Patient</h1><p className="mt-0.5 mb-6 text-sm text-gray-500">Update the registered patient information.</p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {inputFields.map(([name, label, type]) => <label key={name} className="text-sm font-medium text-gray-700">{label}<input required={["firstName", "lastName", "phone"].includes(name)} type={type} name={name} value={formData[name as keyof Patient] as string} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /></label>)}
            <label className="text-sm font-medium text-gray-700">Gender<select required name="gender" value={formData.gender} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></label>
            <label className="text-sm font-medium text-gray-700">Blood group<select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="">Select blood group</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group}>{group}</option>)}</select></label>
            <label className="text-sm font-medium text-gray-700">Status<select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"><option value="ACTIVE">Active</option><option value="DEACTIVE">Deactive</option></select></label>
            <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 md:col-span-2"><button type="button" onClick={() => navigate(`/patients/${formData.id}`)} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700">Cancel</button><button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Save Updates</button></div>
          </form>
        </div>
      </div></div>
    </BaseLayout>
  );
}
