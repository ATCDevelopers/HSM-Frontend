import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import { patientAPI, type Patient, type Address } from "../../services/patientAPI";
import Swal from "sweetalert2";

export default function EditPatients() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [patientData, setPatientData] = useState<{
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    bloodGroup: string;
    phoneNumber: string;
    email: string;
    nhifCard: string;
    nationalId: string;
    photoUrl: string;
    status: "ACTIVE" | "DEACTIVE";
  }>({
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
    status: "ACTIVE",
  });

  const [addressData, setAddressData] = useState<Address>({
    region: "",
    district: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Tanzania",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    patientAPI
      .get(id)
      .then((p: Patient) => {
        let formattedDob = "";
        if (p.dateOfBirth) {
          try {
            formattedDob = new Date(p.dateOfBirth).toISOString().slice(0, 10);
          } catch {
            formattedDob = p.dateOfBirth;
          }
        }

        setPatientData({
          firstName: p.firstName || "",
          middleName: p.middleName || "",
          lastName: p.lastName || "",
          gender: p.gender || "",
          dateOfBirth: formattedDob,
          bloodGroup: p.bloodGroup || "",
          phoneNumber: p.phoneNumber || p.phone || "",
          email: p.email || "",
          nhifCard: p.nhifCard || p.nhifNumber || "",
          nationalId: p.nationalId || "",
          photoUrl: p.photoUrl || p.photo || "",
          status: p.status || "ACTIVE",
        });

        if (p.address) {
          setAddressData({
            region: p.address.region || "",
            district: p.address.district || "",
            city: p.address.city || "",
            state: p.address.state || "",
            postalCode: p.address.postalCode || "",
            country: p.address.country || "Tanzania",
          });
        }
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Patient not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePatientChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleAddressChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPatientData((prev) => ({
        ...prev,
        photoUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    if (
      !patientData.firstName ||
      !patientData.lastName ||
      !patientData.gender ||
      !patientData.dateOfBirth ||
      !patientData.bloodGroup ||
      !patientData.phoneNumber ||
      !patientData.email ||
      !patientData.nhifCard
    ) {
      setError("Please complete all mandatory personal details.");
      Swal.fire("Missing Information", "Please complete all mandatory personal fields.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await patientAPI.update(id, {
        ...patientData,
        address: addressData,
      });

      await Swal.fire({
        title: "Patient Updated!",
        text: `${patientData.firstName} ${patientData.lastName} has been updated successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate(`/patients/${id}`);
    } catch (requestError: unknown) {
      const msg = requestError instanceof Error ? requestError.message : "Patient update failed";
      setError(msg);
      Swal.fire("Update Failed", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout resourceName="Edit Patient">
        <div className="rounded-2xl bg-blue-50 p-6 text-sm">
          Loading patient record...
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout resourceName="Edit Patient">
      <div className="w-full rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto w-full max-w-6xl">
          <button
            onClick={() => navigate(`/patients/${id}`)}
            className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Patient Details
          </button>

          <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">Edit Patient</h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">
              Update registered information and address records.
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
                      value={patientData.firstName}
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
                      value={patientData.middleName}
                      onChange={handlePatientChange}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="lastName"
                      value={patientData.lastName}
                      onChange={handlePatientChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Gender <span className="text-red-500">*</span>
                    <select
                      name="gender"
                      value={patientData.gender}
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
                      value={patientData.dateOfBirth}
                      onChange={handlePatientChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Blood Group <span className="text-red-500">*</span>
                    <select
                      name="bloodGroup"
                      value={patientData.bloodGroup}
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
                      value={patientData.phoneNumber}
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
                      value={patientData.email}
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
                      value={patientData.nhifCard}
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
                      value={patientData.nationalId}
                      onChange={handlePatientChange}
                      placeholder="NIDA / National ID"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <div className="text-sm font-medium text-gray-700 md:col-span-2">
                    <span>Patient Photo</span>
                    <div className="mt-1 flex items-center gap-4">
                      {patientData.photoUrl && (
                        <img
                          src={patientData.photoUrl}
                          alt="Patient Preview"
                          className="h-12 w-12 rounded-full object-cover border border-gray-300"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
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
                      value={addressData.region}
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
                      value={addressData.city}
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
                      value={addressData.state}
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
                      value={addressData.country}
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
                      value={addressData.district || ""}
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
                      value={addressData.postalCode || ""}
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
                  onClick={() => navigate(`/patients/${id}`)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
