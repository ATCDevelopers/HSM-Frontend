import { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import { patientAPI, type RegisterPatientPayload } from "../../services/patientAPI";
import Swal from "sweetalert2";

export default function RegisterPatient() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterPatientPayload>({
    patient: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dateOfBirth: "",
      bloodGroup: "",
      phoneNumber: "",
      email: "",
      nhifCard: "",
      nationalId: "",
      photoUrl: "",
    },
    address: {
      region: "",
      district: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Tanzania",
    },
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePatientChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      patient: { ...prev.patient, [name]: value },
    }));
    setError("");
  };

  const handleAddressChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
    setError("");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((prev) => ({
        ...prev,
        patient: { ...prev.patient, photoUrl: reader.result as string },
      }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { patient, address } = formData;

    if (
      !patient.firstName ||
      !patient.lastName ||
      !patient.gender ||
      !patient.dateOfBirth ||
      !patient.bloodGroup ||
      !patient.phoneNumber ||
      !patient.email ||
      !patient.nhifCard
    ) {
      setError("Please fill in all mandatory personal details (Name, Gender, DOB, Blood Group, Phone, Email, NHIF Card).");
      Swal.fire("Missing Information", "Please complete all mandatory personal fields.", "warning");
      return;
    }

    if (!address.region || !address.city || !address.state || !address.country) {
      setError("Please fill in all mandatory address details (Region, City, State, Country).");
      Swal.fire("Missing Information", "Please complete all mandatory address fields.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await patientAPI.create(formData);
      await Swal.fire({
        title: "Patient Registered!",
        text: `${patient.firstName} ${patient.lastName} has been registered successfully.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/patients");
    } catch (requestError: unknown) {
      const msg =
        requestError instanceof Error
          ? requestError.message
          : "Patient registration failed";
      setError(msg);
      Swal.fire("Registration Failed", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseLayout resourceName="Register Patient">
      <div className="w-full rounded-2xl bg-blue-50 p-3.5 sm:p-6">
        <div className="mx-auto w-full max-w-6xl">
          <button
            onClick={() => navigate("/patients")}
            className="mb-4 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Patient Management
          </button>

          <div className="w-full rounded-2xl bg-white p-4 sm:p-8 shadow-xs border border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">
              Register New Patient
            </h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">
              Complete the form below with the required database fields.
            </p>

            {error && (
              <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* SECTION 1: Personal Details */}
              <div>
                <h2 className="mb-4 text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  1. Personal Information
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <label className="text-sm font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.patient.firstName}
                      onChange={handlePatientChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Middle Name
                    <input
                      type="text"
                      name="middleName"
                      value={formData.patient.middleName}
                      onChange={handlePatientChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.patient.lastName}
                      onChange={handlePatientChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Gender <span className="text-red-500">*</span>
                    <select
                      name="gender"
                      value={formData.patient.gender}
                      onChange={handlePatientChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.patient.dateOfBirth}
                      onChange={handlePatientChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Blood Group <span className="text-red-500">*</span>
                    <select
                      name="bloodGroup"
                      value={formData.patient.bloodGroup}
                      onChange={handlePatientChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select blood group</option>
                      {["O+", "A+", "AB+", "B+", "O-", "A-", "AB-", "B-"].map(
                        (group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>
              </div>

              {/* SECTION 2: Contact & Identification */}
              <div>
                <h2 className="mb-4 text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  2. Contact & Medical Identification
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.patient.phoneNumber}
                      onChange={handlePatientChange}
                      required
                      placeholder="e.g. 0712345678"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.patient.email}
                      onChange={handlePatientChange}
                      required
                      placeholder="patient@example.com"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    NHIF Card Number <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="nhifCard"
                      value={formData.patient.nhifCard}
                      onChange={handlePatientChange}
                      required
                      placeholder="NHIF Card Number"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    National ID
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.patient.nationalId}
                      onChange={handlePatientChange}
                      placeholder="NIDA / National ID"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700 md:col-span-2">
                    Patient Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </label>
                </div>
              </div>

              {/* SECTION 3: Residential Address */}
              <div>
                <h2 className="mb-4 text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  3. Residential Address Details
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <label className="text-sm font-medium text-gray-700">
                    Region <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="region"
                      value={formData.address.region}
                      onChange={handleAddressChange}
                      required
                      placeholder="e.g. Dar es Salaam"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    City <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="city"
                      value={formData.address.city}
                      onChange={handleAddressChange}
                      required
                      placeholder="e.g. Dar es Salaam"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    State <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="state"
                      value={formData.address.state}
                      onChange={handleAddressChange}
                      required
                      placeholder="e.g. Tanzania"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Country <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="country"
                      value={formData.address.country}
                      onChange={handleAddressChange}
                      required
                      placeholder="e.g. Tanzania"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    District
                    <input
                      type="text"
                      name="district"
                      value={formData.address.district}
                      onChange={handleAddressChange}
                      placeholder="e.g. Kinondoni"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Postal Code
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.address.postalCode}
                      onChange={handleAddressChange}
                      placeholder="e.g. 14100"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={() => navigate("/patients")}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Registering..." : "Register Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
