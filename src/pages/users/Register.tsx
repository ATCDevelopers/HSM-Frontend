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
};

export default function RegisterUser() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    secondName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const myswal = withReactContent(Swal);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    myswal.fire({
      title: <span className="text-lg font-semibold">Registering......!</span>,
      allowOutsideClick: false,
      didOpen: () => {
        myswal.showLoading();
      },
      timer: 2000,
    });

    try {
      await API.post("auth/register", form);

      myswal.fire({
        title: (
          <span className="text-xl font-bold text-green-500">
            Welcome, {form.firstName}
          </span>
        ),
        icon: "success",
        timer: 2000,
        buttonsStyling: false,
        customClass: {
          confirmButton:
            "bg-green-600 text-white font-semibold rounded-lg py-2 px-6 focus:outline-none",
        },
      });

      setForm({
        firstName: "",
        secondName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
      });
      navigate("/users");
    } catch (error: any) {
      const responseData = error?.response?.data;
      let errorMessage = "Server error. Please try again";

      if (typeof responseData?.error === "string") {
        errorMessage = responseData.error;
      } else if (typeof responseData?.message === "string") {
        errorMessage = responseData.message;
      } else if (Array.isArray(responseData?.errors)) {
        errorMessage = responseData.errors
          .map((item: unknown) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "msg" in item) {
              return String(item.msg);
            }
            return String(item);
          })
          .join("\n");
      } else if (responseData?.errors && typeof responseData.errors === "object") {
        errorMessage = Object.entries(responseData.errors)
          .flatMap(([field, messages]) => {
            const values = Array.isArray(messages) ? messages : [messages];
            return values.map((message) => `${field}: ${String(message)}`);
          })
          .join("\n");
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      myswal.fire({
        title: <span className="text-lg font-bold text-red-600">Registration Failed!</span>,
        text: errorMessage,
        icon: "error",
        timer: 2000,
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
          <button onClick={() => navigate('/users')} className="mb-4 text-sm font-semibold text-blue-600">← Back to Users</button>
          <div className="w-full rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-lg font-bold text-gray-900">Register New User</h1>
            <p className="mt-0.5 mb-6 text-sm text-gray-500">Create account and assign a role.</p>
            {error && <div className="mb-4 whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <form className="grid grid-cols-1 gap-5 md:grid-cols-2 w-full" onSubmit={handleSubmit}>
              <Input label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input label="Second name" value={form.secondName} onChange={(e) => setForm({ ...form, secondName: e.target.value })} />
              <Input label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              <Input label="Phone number" type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

              <div className="md:col-span-2 flex justify-end gap-3 border-t border-gray-200 pt-5">
                <Button onClick={handleSubmit} variant="outline" type="submit" loading={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}
