import { useEffect, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  BeakerIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { patientAPI } from "../../services/patientAPI";
import { userAPI } from "../../services/userAPI";
import { appointmentAPI, type Appointment, STATUS_LABELS, STATUS_STYLES, patientName, doctorName, toDateKey } from "../../services/appointmentAPI";
import { medicineAPI } from "../../services/pharmacyAPI";
import { invoiceAPI } from "../../services/billingAPI";
import { labTestAPI } from "../../services/labTestConfigAPI";
import PatientPicker from "../../components/sections/PatientPicker";
import PatientBalanceCard from "../../components/sections/PatientBalanceCard";
import type { Patient } from "../../services/patientAPI";
import { AVAILABILITY, availabilityInfo, departmentStaffAPI, type Availability, type StaffMember } from "../../services/departmentAPI";

interface Stat {
  label: string;
  value: number;
  detail?: string;
  route: string;
  icon: ComponentType<{ className?: string }>;
}

interface QuickAction {
  label: string;
  route: string;
}

/** Roles whose appointment report is not narrowed to themselves by the backend. */
const APPOINTMENT_BOARD_ROLES = ["Admin", "ClinicManager", "Receptionist", "Doctor", "Nurse"];
const LOW_STOCK_THRESHOLD = 10;

export default function Dashboard({ title }: { title?: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role ?? "";
  const [stats, setStats] = useState<Stat[]>([]);
  const [today, setToday] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [balancePatient, setBalancePatient] = useState<Patient | null>(null);
  const canCheckBalance = can("read", "PatientBalance", role);
  const [me, setMe] = useState<StaffMember | null>(null);

  useEffect(() => {
    departmentStaffAPI.me().then(setMe).catch(() => undefined);
  }, []);

  const setMyAvailability = (availability: Availability) =>
    departmentStaffAPI.setMyAvailability(availability).then((updated) => updated && setMe({ ...me!, ...updated })).catch(() => undefined);

  const showAppointments = APPOINTMENT_BOARD_ROLES.includes(role);

  useEffect(() => {
    const todayKey = toDateKey(new Date());
    // Each card loads independently so one forbidden or failing endpoint doesn't blank the dashboard.
    const loaders: Promise<Stat | null>[] = [];

    if (showAppointments) {
      loaders.push(
        appointmentAPI.list({ startDate: todayKey, endDate: todayKey }).then((rows) => {
          setToday(rows);
          const waiting = rows.filter((a) => a.status === "checked_in").length;
          return { label: "Appointments today", value: rows.length, detail: `${waiting} checked in`, route: "/appointments", icon: CalendarDaysIcon };
        }),
      );
    }
    if (can("read", "Patient", role)) {
      loaders.push(patientAPI.list().then((rows) => ({ label: "Registered patients", value: rows.length, route: "/patients", icon: UserGroupIcon })));
    }
    if (can("read", "Medicine", role)) {
      loaders.push(
        medicineAPI.list().then((rows) => ({
          label: "Medicines",
          value: rows.length,
          detail: `${rows.filter((m) => m.stock <= LOW_STOCK_THRESHOLD).length} low on stock`,
          route: "/pharmacy",
          icon: ClipboardDocumentListIcon,
        })),
      );
    }
    if (can("read", "Billing", role)) {
      loaders.push(
        invoiceAPI.list().then((rows) => ({
          label: "Invoices",
          value: rows.length,
          detail: `${rows.filter((i) => i.statusName === "unpaid" || i.statusName === "partially_paid").length} awaiting payment`,
          route: "/billing",
          icon: CurrencyDollarIcon,
        })),
      );
    }
    if (can("read", "Lab_test", role)) {
      loaders.push(labTestAPI.list().then((rows) => ({ label: "Lab test templates", value: rows.length, route: "/laboratory", icon: BeakerIcon })));
    }
    if (can("read", "User", role)) {
      loaders.push(userAPI.list().then((rows) => ({ label: "Staff accounts", value: rows.length, route: "/users", icon: UsersIcon })));
    }

    Promise.allSettled(loaders).then((results) => {
      setStats(results.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : [])));
      setLoading(false);
    });
  }, [role, showAppointments]);

  const actions: QuickAction[] = [
    can("create", "Appointment", role) && { label: "Book appointment", route: "/appointments/new" },
    can("create", "Patient", role) && { label: "Register patient", route: "/patients/register" },
    can("create", "Vitals", role) && { label: "Record vitals", route: "/medical-records" },
    can("write", "Consultation", role) && { label: "Start consultation", route: "/medical-records" },
    can("create", "Laboratory", role) && { label: "Enter lab results", route: "/laboratory/results/new" },
    role === "Doctor" && { label: "Lab results sent to me", route: "/laboratory/results" },
    can("update", "Medicine", role) && { label: "Manage medicines", route: "/pharmacy" },
    can("create", "Billing", role) && { label: "Create invoice", route: "/billing/new" },
    can("read", "Report", role) && { label: "View reports", route: "/reports" },
  ].filter((a): a is QuickAction => Boolean(a));

  return (
    <BaseLayout resourceName={title ?? "Dashboard"}>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title ?? "Dashboard"}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
              {me?.departmentName ? ` · ${me.departmentName}` : ""}. Here is what's happening today.
            </p>
          </div>
          {me && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100" role="group" aria-label="My availability">
              <span className="px-2 text-xs font-semibold text-gray-500">My status</span>
              {AVAILABILITY.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setMyAvailability(a.id)}
                  aria-pressed={me.availability === a.id}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                    me.availability === a.id ? `ring-1 ${availabilityInfo(a.id).badge}` : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${a.dot}`} /> {a.label}
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="text-sm text-gray-400">Loading overview...</p>}
          {!loading && stats.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500 sm:col-span-2 xl:col-span-3">
              No overview data is available for your role.
            </p>
          )}
          {stats.map(({ label, value, detail, route, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(route)}
              className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{label}</p>
                <span className="rounded-xl bg-blue-50 p-2 text-blue-600"><Icon className="h-5 w-5" /></span>
              </div>
              <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
              {detail && <p className="mt-1 text-xs text-gray-400">{detail}</p>}
            </button>
          ))}
        </div>

        {me?.headOf?.map((dept) => (
          <button
            key={dept.id}
            type="button"
            onClick={() => navigate(`/departments/${dept.id}`)}
            className="flex w-full items-center justify-between gap-3 rounded-2xl bg-linear-to-r from-amber-50 to-white p-4 text-left shadow-sm ring-1 ring-amber-200 hover:ring-amber-300"
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-amber-700">Head of department</span>
              <span className="block text-lg font-bold text-gray-900">{dept.name}</span>
              <span className="block text-sm text-gray-500">See your team, set availability and edit department details.</span>
            </span>
            <span className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white">Open my department</span>
          </button>
        ))}

        {canCheckBalance && (
          <section className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">What does a patient owe?</h2>
                <p className="text-sm text-gray-500">Search the patient at the desk to tell them their balance.</p>
              </div>
              {balancePatient && (
                <button type="button" onClick={() => navigate(`/patient-balance?patientId=${balancePatient.id}`)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Full breakdown
                </button>
              )}
            </div>
            <div className="mt-4 space-y-4">
              <PatientPicker value={balancePatient?.id ?? ""} onChange={setBalancePatient} />
              {balancePatient && <PatientBalanceCard patient={balancePatient} compact />}
            </div>
          </section>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          {showAppointments && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Today's appointments</h2>
                <button type="button" onClick={() => navigate("/appointments")} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {today.length === 0 && <p className="text-sm text-gray-400">No appointments booked for today.</p>}
                {today.slice(0, 8).map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => navigate(`/appointments/${a.id}/status`)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left hover:bg-blue-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{patientName(a)}</p>
                      <p className="truncate text-xs text-gray-500">Dr. {doctorName(a)} · {a.appointmentType}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">{a.appointmentTime}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {actions.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Quick actions</h2>
              <div className="mt-4 grid gap-2">
                {actions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => navigate(a.route)}
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </BaseLayout>
  );
}
