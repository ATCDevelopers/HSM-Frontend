import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { getRoleDashboard } from "../../auth/authAPI";
import Swal from "sweetalert2";

// ─── Helpers ────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // After login, go back to the page the user originally tried to visit
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ?? null;

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    try {
      await login(email, password);

      // login() stores the user in sessionStorage; read role for redirect
      const stored = sessionStorage.getItem("authUser");
      const user = stored ? JSON.parse(stored) : null;

      await Swal.fire({
        title: `Welcome, ${user?.firstName || "User"}!`,
        text: "You have successfully logged in.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      const destination = from ?? getRoleDashboard(user?.role ?? "");
      navigate(destination, { replace: true });
    } catch (err: any) {
      const backendMessage = err.response?.data?.error;
      const message =
        backendMessage ||
        (err instanceof Error
          ? err.message
          : "Login failed. Please try again.");

      setError(
        message.toLowerCase().includes("invalid email or password")
          ? "Invalid email or password."
          : message,
      );
    }
  }

  return (
    // Full-screen light background, with the actual card centered inside it
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      {/* Main login card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[560px]">
        {/* ────────────────────────────────────────────────────────────────
            LEFT PANEL — Hospital image and branding
            Hidden on small screens
        ──────────────────────────────────────────────────────────────── */}

        <div className="hidden lg:flex lg:w-1/2 relative">
          {/* Hospital background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/login/doc2.jpg')",
            }}
          />

          {/* Blue overlay */}
          <div className="absolute inset-0 bg-[#173A5E]/70" />

          {/* Branding and welcome text */}
          <div className="relative z-10 flex flex-col justify-between p-10 w-full">
            {/* HMS Logo */}
            <Link
              to="/"
              className="text-2xl font-serif tracking-widest text-white"
            >
              HMS
            </Link>

            {/* Healthcare message */}
            <div>
              <h2 className="text-2xl font-bold text-white leading-snug">
                Empowering Healthcare,
                <br />
                One Click at a Time.
              </h2>

              <p className="mt-2 text-blue-100 text-sm">
                Your patients, your records, your control.
              </p>
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────
            RIGHT PANEL — Login form
            Logic remains unchanged
        ──────────────────────────────────────────────────────────────── */}

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-10">
          <div className="w-full max-w-sm">
            {/* Top navigation */}
            <div className="flex items-center justify-between lg:justify-end mb-8">
              {/* HMS logo on mobile */}
              <Link
                to="/"
                className="lg:hidden text-lg font-serif tracking-widest text-[#173A5E]"
              >
                HMS
              </Link>

              {/* Back to home */}
              <Link
                to="/"
                className="text-sm font-semibold text-gray-500 hover:text-[#173A5E] transition-colors"
              >
                ← Back to Home
              </Link>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>

            <p className="mt-1 text-sm text-gray-500">
              Welcome back to your application
            </p>

            {/* Global error banner */}
            {error && (
              <div
                id="login-error-banner"
                className="mt-4 flex items-start gap-3 rounded-lg px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700"
                role="alert"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>

                {error}
              </div>
            )}

            {/* ────────────────────────────────────────────────────────────
                FORM
            ──────────────────────────────────────────────────────────── */}

            <form
              id="login-form"
              onSubmit={handleSubmit}
              noValidate
              className="mt-6 space-y-4"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email address
                </label>

                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (fieldErrors.email) {
                      setFieldErrors((p) => ({
                        ...p,
                        email: undefined,
                      }));
                    }
                  }}
                  placeholder="you@hospital.com"
                  className={`w-full rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white outline-none transition-all duration-200 border ${
                    fieldErrors.email
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-[#173A5E] focus:ring-2 focus:ring-blue-100"
                  }`}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  aria-invalid={!!fieldErrors.email}
                />

                {fieldErrors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);

                      if (fieldErrors.password) {
                        setFieldErrors((p) => ({
                          ...p,
                          password: undefined,
                        }));
                      }
                    }}
                    placeholder="Enter your password"
                    className={`w-full rounded-lg px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 bg-white outline-none transition-all duration-200 border ${
                      fieldErrors.password
                        ? "border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-gray-200 focus:border-[#173A5E] focus:ring-2 focus:ring-blue-100"
                    }`}
                    aria-describedby={
                      fieldErrors.password ? "password-error" : undefined
                    }
                    aria-invalid={!!fieldErrors.password}
                  />

                  {/* Show / hide password */}
                  <button
                    type="button"
                    id="toggle-password-visibility"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#173A5E] transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {fieldErrors.password && (
                  <p
                    id="password-error"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white bg-[#173A5E] hover:bg-[#102D49] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
