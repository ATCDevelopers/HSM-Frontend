import { Link } from "react-router-dom";

const MODULES = [
  { key: "patients", icon: "🧑‍🤝‍🧑", title: "Patients", desc: "View records, admissions, and patient history." },
  { key: "laboratory", icon: "🧪", title: "Laboratory", desc: "Track tests, results, and pending reports." },
  { key: "pharmacy", icon: "💊", title: "Pharmacy", desc: "Manage medication stock and prescriptions." },
  { key: "doctors", icon: "🩺", title: "Doctors", desc: "View staff schedules, specialties, and duty status." },
  { key: "vitals", icon: "❤️", title: "Vital Signs", desc: "Monitor heart rate, blood pressure, and more." },
  { key: "billing", icon: "🧾", title: "Billing", desc: "Invoices, payments, and insurance claims." },
];

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      {/* Top nav — consistent with Landing page header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-5 bg-white shadow-sm">
        <h1 className="text-xl font-serif tracking-widest text-[#173A5E]">HMS</h1>
        <Link
          to="/"
          className="text-sm font-semibold text-[#173A5E] hover:text-blue-700"
        >
          ← Back to Home
        </Link>
      </header>

      <main className="flex-1 px-6 sm:px-10 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-sm text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Select a module to get started
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Manage patients, laboratory results, pharmacy inventory, doctors, and vital
              signs — all from one place.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map((m) => (
              <Link
                key={m.key}
                to={`/login?module=${m.key}`}
                className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all min-h-[150px]"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    {m.icon}
                  </div>
                  <h3 className="mt-3 font-bold text-gray-900 text-sm">{m.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <span className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all text-lg">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}