import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import { patientAPI, type Patient } from "../../services/patientAPI";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import Swal from "sweetalert2";

export default function PatientsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState("");

  const canCreate = can("create", "Patient", user?.role) || can("manage", "Patient", user?.role);
  const canUpdate = can("update", "Patient", user?.role) || can("manage", "Patient", user?.role);
  const canDelete = can("delete", "Patient", user?.role) || can("manage", "Patient", user?.role);

  useEffect(() => {
    if (!id) return;
    patientAPI
      .get(id)
      .then(setPatient)
      .catch((requestError: unknown) =>
        setError(requestError instanceof Error ? requestError.message : "Patient not found")
      );
  }, [id]);

  const deletePatient = async () => {
    if (!patient) return;
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${patient.firstName} ${patient.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });
    if (!result.isConfirmed) return;

    try {
      await patientAPI.remove(patient.id);
      await Swal.fire({
        title: "Deleted!",
        text: "Patient record has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/patients");
    } catch (requestError: unknown) {
      const msg = requestError instanceof Error ? requestError.message : "Failed to delete patient";
      setError(msg);
      Swal.fire("Error!", msg, "error");
    }
  };

  if (!patient)
    return (
      <BaseLayout resourceName="Patient Details">
        <div className="rounded-2xl bg-blue-50 p-6 text-sm">
          {error || "Loading patient record..."}
        </div>
      </BaseLayout>
    );

  const formattedDob = patient.dateOfBirth
    ? new Date(patient.dateOfBirth).toLocaleDateString()
    : "Not provided";

  const personalDetails = [
    ["Patient ID", patient.id],
    ["First Name", patient.firstName],
    ["Middle Name", patient.middleName || "Not provided"],
    ["Last Name", patient.lastName],
    ["Gender", patient.gender],
    ["Date of Birth", formattedDob],
    ["Blood Group", patient.bloodGroup || "Not provided"],
  ];

  const contactDetails = [
    ["Phone Number", patient.phoneNumber || patient.phone || "Not provided"],
    ["Email Address", patient.email || "Not provided"],
    ["NHIF Card", patient.nhifCard || patient.nhifNumber || "Not provided"],
    ["National ID", patient.nationalId || "Not provided"],
    ["Status", patient.status || "ACTIVE"],
  ];

  const address = patient.address;
  const addressDetails = address
    ? [
      ["Country", address.country],
      ["State / Region", `${address.state} / ${address.region}`],
      ["City / District", `${address.city} / ${address.district || "N/A"}`],
      ["Postal Code", address.postalCode || "N/A"],
    ]
    : null;

  return (
    <BaseLayout resourceName="Patient Details">
      <div className="rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            onClick={() => navigate("/patients")}
            className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Patients
          </button>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            {/* Header / Avatar */}
            <div className="flex items-center gap-5 border-b border-gray-200 pb-6">
              {patient.photoUrl || patient.photo ? (
                <img
                  src={(patient.photoUrl || patient.photo) as string}
                  alt={`${patient.firstName} ${patient.lastName}`}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                  {patient.firstName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {patient.firstName} {patient.middleName ? `${patient.middleName} ` : ""}{patient.lastName}
                </h1>

              </div>
            </div>

            {/* Section 1: Personal Details */}
            <div className="py-5 border-b border-gray-100">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
                Personal Details
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {personalDetails.map(([label, value]) => (
                  <div key={label}>
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Contact & Identification */}
            <div className="py-5 border-b border-gray-100">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
                Contact & Medical Identification
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                {contactDetails.map(([label, value]) => (
                  <div key={label}>
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Residential Address */}
            <div className="py-5">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
                Residential Address Details
              </h2>
              {addressDetails ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                  {addressDetails.map(([label, value]) => (
                    <div key={label}>
                      <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-normal italic text-amber-600">
                  No residential address recorded for this patient.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
              {canUpdate && (
                <button
                  onClick={() => navigate(`/patients/${patient.id}/edit`)}
                  className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
                >
                  Edit / Update
                </button>
              )}
              {canCreate && (
                <button
                  onClick={() => navigate("/patients/register")}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Add Patient
                </button>
              )}
              {canDelete && (
                <button
                  onClick={deletePatient}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete Patient
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
