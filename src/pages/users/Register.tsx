import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import Input from "../../components/atoms/forms/Input";
import Button from "../../components/atoms/ui/Button";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import API from "../../services/api";

type RegisterForm = {
  firstName: string;
  secondName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  imagePath?: string;
};

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

export default function RegisterUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    secondName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "Doctor",
    imagePath: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const myswal = withReactContent(Swal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName || !form.email || !form.phoneNumber || !form.password || !form.role) {
      setError("Please fill in all mandatory fields (First Name, Last Name, Email, Phone, Password, and Role).");
      return;
    }

    setLoading(true);
    setError("");

    myswal.fire({
      title: <span className="text-lg font-semibold">Registering user...</span>,
      allowOutsideClick: false,
      didOpen: () => {
        myswal.showLoading();
      },
    });

    try {
      const payload = {
        firstName: form.firstName,
        secondName: form.secondName || undefined,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        role: form.role,
        imagePath: form.imagePath || undefined,
      };

      await API.post("auth/register", payload);

      myswal.fire({
        title: (
          <span className="text-xl font-bold text-green-500">
            User Registered Successfully!
          </span>
        ),
        text: `${form.firstName} ${form.lastName} has been created as ${form.role}.`,
        icon: "success",
        timer: 2000,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            "bg-green-600 text-white font-semibold rounded-lg py-2 px-6 focus:outline-none",
        },
      });

      navigate("/users");
    } catch (err: any) {
      const responseData = err?.response?.data;
      let errorMessage = "Registration failed. Please try again.";

      if (typeof responseData?.error === "string") {
        errorMessage = responseData.error;
      } else if (typeof responseData?.message === "string") {
        errorMessage = responseData.message;
      } else if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      myswal.fire({
        title: <span className="text-lg font-bold text-red-600">Registration Failed!</span>,
        text: errorMessage,
        icon: "error",
        timer: 2500,
        buttonsStyling: false,
        allowOutsideClick: false,
        customClass: {
          confirmButton:
            "bg-red-600 text-white font-semibold rounded-lg py-2 px-6 focus:outline-none",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout resourceName="Register User">
      <div className="w-full rounded-2xl bg-blue-50 p-6">
        <div className="mx-auto w-full max-w-6xl px-4">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Users
          </button>
          <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">Register New User</h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">
              Create a system account with exact database schema fields.
            </p>

            {error && (
              <div className="mb-5 whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form className="grid grid-cols-1 gap-5 md:grid-cols-2 w-full" onSubmit={handleSubmit}>
              <Input
                label="First Name *"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
                placeholder="Enter first name"
              />

              <Input
                label="Second Name"
                value={form.secondName}
                onChange={(e) => setForm({ ...form, secondName: e.target.value })}
                placeholder="Enter middle / second name (optional)"
              />

              <Input
                label="Last Name *"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
                placeholder="Enter last name"
              />

              <Input
                label="Phone Number *"
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                required
                placeholder="e.g. 0712345678"
              />

              <Input
                label="Email Address *"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="user@hospital.com"
              />

              <Input
                label="Password *"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="At least 6 characters"
              />

              <label className="text-sm font-medium text-gray-700">
                System Role *
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
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

              <Input
                label="Profile Image Path / URL"
                value={form.imagePath || ""}
                onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
                placeholder="URL or path to profile photo (optional)"
              />

              <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading}>
                  {loading ? "Registering..." : "Register User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
