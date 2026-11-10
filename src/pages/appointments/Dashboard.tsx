import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BaseLayout from '../../components/layouts/BaseLayout.tsx';
import { useAuth } from '../../auth/AuthContext';
import { can } from '../../config/ability';
import { getErrorMessage } from '../../services/apiResponse';
import {
  appointmentAPI,
  type Appointment,
  STATUS_LABELS,
  STATUS_STYLES,
  doctorName,
  patientName,
  toDateKey,
} from '../../services/appointmentAPI';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [date, setDate] = useState(toDateKey(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canBook = can('create', 'Appointment', user?.role);
  const canManage = can('manage', 'Appointment', user?.role);

  useEffect(() => {
    setLoading(true);
    setError('');
    appointmentAPI
      .list({ startDate: date, endDate: date })
      .then(setAppointments)
      .catch((e: unknown) => setError(getErrorMessage(e, 'Failed to load appointments')))
      .finally(() => setLoading(false));
  }, [date]);

  const stats = useMemo(() => {
    const count = (statuses: string[]) => appointments.filter((a) => statuses.includes(a.status)).length;
    return [
      { title: 'Booked', value: appointments.length, detail: 'All appointments this day', tone: 'bg-blue-100 text-blue-700', icon: CalendarDaysIcon },
      { title: 'Waiting', value: count(['checked_in']), detail: 'Checked in, not yet seen', tone: 'bg-yellow-100 text-yellow-700', icon: ClockIcon },
      { title: 'Completed', value: count(['completed']), detail: 'Consultation finished', tone: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
      { title: 'Cancelled / no-show', value: count(['cancelled', 'no_show']), detail: 'Did not take place', tone: 'bg-red-100 text-red-700', icon: XCircleIcon },
    ];
  }, [appointments]);

  const sendReminders = async () => {
    try {
      const queued = await appointmentAPI.sendReminders();
      Swal.fire('Reminders queued', `${queued.length} upcoming appointment reminder(s) queued.`, 'success');
    } catch (e: unknown) {
      Swal.fire('Error', getErrorMessage(e, 'Failed to send reminders'), 'error');
    }
  };

  return (
    <BaseLayout resourceName="Appointments">
      <div className="w-full rounded-3xl bg-linear-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-sm ring-1 ring-blue-100 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Overview</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Appointments Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">Track bookings and patient flow for the selected day.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
            {canManage && (
              <button
                onClick={sendReminders}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <BellAlertIcon className="h-4 w-4" />
                Send reminders
              </button>
            )}
            {canBook && (
              <button
                onClick={() => navigate('/appointments/new')}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                New Booking
              </button>
            )}
          </div>
        </div>

        {error && <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ title, value, detail, tone, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`inline-flex rounded-xl p-2 ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-gray-500">{title}</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">{loading ? '—' : value}</p>
              <p className="mt-2 text-xs text-gray-400">{detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Schedule</h3>
              <p className="text-sm text-gray-500">Click an appointment to check in, complete, reschedule or cancel it.</p>
            </div>
            <button type="button" onClick={() => navigate('/appointments/history')} className="text-sm font-medium text-blue-600 hover:text-blue-700">
              All appointments
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {loading && <p className="text-sm text-slate-400">Loading appointments...</p>}
            {!loading && appointments.length === 0 && <p className="text-sm text-slate-400">No appointments booked for this day.</p>}
            {appointments.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/appointments/${item.id}/status`)}
                className="group flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-900">{patientName(item)}</p>
                  <p className="text-sm text-gray-500">Dr. {doctorName(item)} · {item.appointmentType} · {item.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">{item.appointmentTime}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                  <ArrowRightIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};
