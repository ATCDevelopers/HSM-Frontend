import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import { userAPI, type User } from "../../services/userAPI";
import Swal from "sweetalert2";

const ROLES = [
  { value: "Admin", label: "Admin" },
  { value: "Doctor", label: "Doctor" },
  { value: "Nurse", label: "Nurse" },
  { value: "Receptionist", label: "Receptionist" },
  { value: "Pharmacist", label: "Pharmacist" },
  { value: "LabTechnician", label: "Lab Technician" },
  { value: "Cashier", label: "Cashier" },
  { value: "ClinicManager", label: "Clinic Manager" },
  { value: "Accountant", label: "Accountant" },
  { value: "Patient", label: "Patient" },
];

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<{
    firstName: string;
    secondName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    status: "ACTIVE" | "INACTIVE";
    imagePath: string;
    password?: string;
  }>({
    firstName: "",
    secondName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    role: "Doctor",
    status: "ACTIVE",
    imagePath: "",
    password: "",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    userAPI
      .get(id)
      .then((u: User) => {
        setFormData({
          firstName: u.firstName || "",
          secondName: u.secondName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          phoneNumber: u.phoneNumber || "",
          role: u.role || "Doctor",
          status: (u.status as "ACTIVE" | "INACTIVE") || "ACTIVE",
          imagePath: u.imagePath || u.photo || "",
          password: "",
        });
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "User record not found");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imagePath: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.role
    ) {
      setError("Please fill in all mandatory personal details.");
      Swal.fire("Missing Information", "Please complete all mandatory fields.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<User> = {
        firstName: formData.firstName,
        secondName: formData.secondName || null,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        status: formData.status,
        imagePath: formData.imagePath || null,
      };

      if (formData.password?.trim()) {
        payload.password = formData.password.trim();
      }

      await userAPI.update(id, payload);

      await Swal.fire({
        title: "User Updated!",
        text: `${formData.firstName} ${formData.lastName} has been updated successfully.`,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate(`/users/${id}`);
    } catch (requestError: unknown) {
      const msg = requestError instanceof Error ? requestError.message : "User update failed";
      setError(msg);
      Swal.fire("Update Failed", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <BaseLayout resourceName="Edit User">
        <div className="w-full rounded-2xl bg-blue-50 p-6 min-h-[calc(100vh-6rem)]">
          <div className="mx-auto max-w-4xl text-sm text-gray-600">
            Loading user record...
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout resourceName="Edit User">
      <div className="w-full rounded-2xl bg-blue-50 p-6 min-h-[calc(100vh-6rem)]">
        <div className="mx-auto w-full max-w-6xl">
          <button
            onClick={() => navigate(id ? `/users/${id}` : "/users")}
            className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to User Details
          </button>

          <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">
              Update system user account details, role and status.
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
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. John"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Second / Middle Name
                    <input
                      type="text"
                      name="secondName"
                      value={formData.secondName}
                      onChange={handleChange}
                      placeholder="e.g. Robert"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Doe"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 0712345678"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="text-sm font-medium text-gray-700 md:col-span-2">
                    Email Address <span className="text-red-500">*</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="user@hospital.com"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>
                </div>
              </div>

              {/* SECTION 2: Role, Status and Access */}
              <div>
                <h2 className="mb-4 text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  2. Role & System Settings
                </h2>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <label className="text-sm font-medium text-gray-700">
                    System Role <span className="text-red-500">*</span>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Account Status <span className="text-red-500">*</span>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </label>

                  <label className="text-sm font-medium text-gray-700">
                    Reset Password
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep unchanged"
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <div className="text-sm font-medium text-gray-700 md:col-span-3">
                    <span>Profile Photo</span>
                    <div className="mt-2 flex items-center gap-4">
                      {formData.imagePath ? (
                        <img
                          src={formData.imagePath}
                          alt="User Preview"
                          className="h-14 w-14 rounded-full object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                          {formData.firstName ? formData.firstName.charAt(0) : "U"}
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <input
                          type="text"
                          name="imagePath"
                          value={formData.imagePath}
                          onChange={handleChange}
                          placeholder="Or enter image URL directly"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                <button
                  type="button"
                  onClick={() => navigate(id ? `/users/${id}` : "/users")}
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
