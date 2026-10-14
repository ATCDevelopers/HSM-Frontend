import React, { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  UserGroupIcon,
  ArrowRightIcon,
  PlusIcon,
  BellAlertIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import Badge from '../../components/atoms/ui/Badge';
import Button from '../../components/atoms/ui/Button';
import { getAppointmentReports, sendReminders, type Appointment } from '../../services/appointmentAPI';
import Swal from 'sweetalert2';

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, { variant: any; label: string }> = {
  scheduled:  { variant: 'info',    label: 'Scheduled'  },
  confirmed:  { variant: 'primary', label: 'Confirmed'  },
  checked_in: { variant: 'warning', label: 'Checked In' },
  completed:  { variant: 'success', label: 'Completed'  },
  cancelled:  { variant: 'danger',  label: 'Cancelled'  },
  no_show:    { variant: 'default', label: 'No Show'    },
};

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Component ────────────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reminding, setReminding] = useState(false);

  useEffect(() => {
    getAppointmentReports()
      .then(setAppointments)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load appointments')
      )
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────
  const total      = appointments.length;
  const scheduled  = appointments.filter(a => a.status === 'scheduled').length;
  const confirmed  = appointments.filter(a => a.status === 'confirmed').length;
  const completed  = appointments.filter(a => a.status === 'completed').length;
  const cancelled  = appointments.filter(a => a.status === 'cancelled').length;
  const noShow     = appointments.filter(a => a.status === 'no_show').length;
  const checkedIn  = appointments.filter(a => a.status === 'checked_in').length;

  // Today's appointments (local date comparison)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments
    .filter(a => a.appointmentDate?.slice(0, 10) === todayStr && a.status !== 'cancelled')
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
    .slice(0, 8);

  const statCards = [
    { title: 'Total',      value: total,     icon: CalendarDaysIcon,     tone: 'blue'   },
    { title: 'Scheduled',  value: scheduled, icon: ClockIcon,            tone: 'indigo' },
    { title: 'Completed',  value: completed, icon: CheckCircleIcon,      tone: 'green'  },
    { title: 'Cancelled',  value: cancelled, icon: XCircleIcon,          tone: 'red'    },
    { title: 'No-Show',    value: noShow,    icon: ExclamationCircleIcon, tone: 'amber' },
    { title: 'Confirmed',  value: confirmed, icon: UserGroupIcon,        tone: 'purple' },
    { title: 'Checked In', value: checkedIn, icon: ChartBarIcon,         tone: 'teal'   },
  ];

  const toneClasses: Record<string, string> = {
    blue:   'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    green:  'bg-green-100 text-green-700',
    red:    'bg-red-100 text-red-700',
    amber:  'bg-amber-100 text-amber-700',
    purple: 'bg-purple-100 text-purple-700',
    teal:   'bg-teal-100 text-teal-700',
  };

  async function handleSendReminders() {
    setReminding(true);
    try {
      const result = await sendReminders();
      await Swal.fire({
        title: 'Reminders Queued',
        text: `${result.processedCount} reminder(s) have been queued for dispatch.`,
        icon: 'success',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to send reminders', 'error');
    } finally {
      setReminding(false);
    }
  }

  return (
    <BaseLayout resourceName="Appointments">
      <div className="w-full min-h-[calc(100vh-6rem)] rounded-2xl bg-blue-50 p-4 sm:p-6 flex flex-col gap-6">

        {/* ── Page Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Overview</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Appointments Dashboard</h2>
            <p className="mt-0.5 text-sm text-gray-500">Track bookings, doctor availability and patient activity.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              loading={reminding}
              onClick={handleSendReminders}
              className="gap-1.5"
            >
              <BellAlertIcon className="h-4 w-4" />
              Send Reminders
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/appointments/new')}
              className="gap-1.5"
            >
              <PlusIcon className="h-4 w-4" />
              New Booking
            </Button>
          </div>
        </div>

        {/* ── Error Banner ─────────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Stat Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3">
          {statCards.map(({ title, value, icon: Icon, tone }) => (
            <div
              key={title}
              className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex flex-col gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
                <p className="mt-0.5 text-2xl font-bold text-gray-900">
                  {loading ? <span className="text-gray-300">—</span> : value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Two-Column Area ─────────────────────────────────────────── */}
        <div className="grid gap-5 xl:grid-cols-[1.6fr_0.9fr]">

          {/* Today's Schedule */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Today's Schedule</h3>
                <p className="text-xs text-gray-500">Upcoming consultations &amp; check-ins</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/appointments/schedule')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRightIcon className="h-3.5 w-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : todayAppts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                <CalendarDaysIcon className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-400">No appointments scheduled for today.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {todayAppts.map(appt => {
                  const badge = STATUS_BADGE[appt.status] ?? { variant: 'default', label: appt.status };
                  return (
                    <div key={appt.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {(appt.patientFirstName ?? 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {appt.patientFirstName} {appt.patientLastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            Dr. {appt.doctorFirstName ?? '—'} {appt.doctorLastName ?? ''}
                            &nbsp;·&nbsp;{appt.appointmentType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium text-gray-600">{appt.appointmentTime}</span>
                        <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                        <button
                          type="button"
                          onClick={() => navigate(`/appointments/${appt.id}/status`)}
                          className="text-gray-400 hover:text-blue-600 transition"
                          title="Update Status"
                        >
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-5 text-white shadow-lg shadow-blue-600/20 flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-blue-100 font-semibold">Quick Actions</p>
                <h3 className="mt-1 text-lg font-bold">Manage Appointments</h3>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Book New Appointment', path: '/appointments/new' },
                  { label: 'Doctor Schedule',       path: '/appointments/schedule' },
                  { label: 'Patient History',        path: '/appointments/history' },
                  { label: 'Reports',                path: '/appointments/reports' },
                ].map(({ label, path }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(path)}
                    className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition"
                  >
                    {label}
                    <ArrowRightIcon className="h-4 w-4 text-blue-200" />
                  </button>
                ))}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Status Breakdown</p>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-6 rounded bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Scheduled',  val: scheduled,  color: 'bg-blue-500'   },
                    { label: 'Confirmed',  val: confirmed,  color: 'bg-indigo-500' },
                    { label: 'Checked In', val: checkedIn,  color: 'bg-amber-500'  },
                    { label: 'Completed',  val: completed,  color: 'bg-green-500'  },
                    { label: 'Cancelled',  val: cancelled,  color: 'bg-red-500'    },
                    { label: 'No Show',    val: noShow,     color: 'bg-gray-400'   },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${color} shrink-0`} />
                      <p className="text-xs text-gray-600 flex-1">{label}</p>
                      <p className="text-xs font-bold text-gray-900">{val}</p>
                      <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all`}
                          style={{ width: total > 0 ? `${Math.round((val / total) * 100)}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── All Appointments Table (recent) ──────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">All Appointments</h3>
            <button
              type="button"
              onClick={() => navigate('/appointments/history')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Full History <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Patient', 'Doctor', 'Type', 'Date', 'Time', 'Priority', 'Status', ''].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(8)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-gray-100 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                      No appointment records found.
                    </td>
                  </tr>
                ) : (
                  appointments.slice(0, 20).map(appt => {
                    const badge = STATUS_BADGE[appt.status] ?? { variant: 'default', label: appt.status };
                    return (
                      <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {appt.patientFirstName} {appt.patientLastName}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {appt.doctorFirstName ? `Dr. ${appt.doctorFirstName} ${appt.doctorLastName}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{appt.appointmentType}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(appt.appointmentDate)}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{appt.appointmentTime}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            appt.priority === 'emergency' ? 'bg-red-100 text-red-700'
                            : appt.priority === 'high'      ? 'bg-orange-100 text-orange-700'
                            : appt.priority === 'medium'    ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {appt.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant={badge.variant} size="sm">{badge.label}</Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => navigate(`/appointments/${appt.id}/status`)}
                            className="text-xs font-medium text-blue-600 hover:underline"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </BaseLayout>
  );
};