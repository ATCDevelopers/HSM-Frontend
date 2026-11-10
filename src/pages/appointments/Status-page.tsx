import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import BaseLayout from '../../components/layouts/BaseLayout';
import { useAuth } from '../../auth/AuthContext';
import { can } from '../../config/ability';
import { getErrorMessage } from '../../services/apiResponse';
import {
  appointmentAPI,
  type Appointment,
  type AppointmentStatus,
  STATUS_LABELS,
  STATUS_STYLES,
  STATUS_TRANSITIONS,
  doctorName,
  patientName,
  toDateKey,
} from '../../services/appointmentAPI';
import SlotPicker from './SlotPicker';

const ACTION_LABELS: Partial<Record<AppointmentStatus, string>> = {
  confirmed: 'Confirm',
  checked_in: 'Check in',
  completed: 'Mark completed',
  no_show: 'Mark no-show',
};

export const AppointmentStatusPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canUpdate = can('update', 'Appointment', user?.role);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(toDateKey(new Date()));
  const [newTime, setNewTime] = useState('');

  const load = useCallback(() => {
    appointmentAPI
      .get(id)
      .then(setAppointment)
      .catch((e: unknown) => setError(getErrorMessage(e, 'Failed to load appointment')));
  }, [id]);

  useEffect(load, [load]);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError('');
    try {
      await action();
      Swal.fire({ title: success, icon: 'success', timer: 1200, showConfirmButton: false });
      load();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Action failed'));
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Cancel appointment',
      input: 'text',
      inputLabel: 'Reason (kept in the audit log)',
      showCancelButton: true,
      confirmButtonText: 'Cancel appointment',
      confirmButtonColor: '#d33',
      inputValidator: (v) => (!v?.trim() ? 'A reason is required' : undefined),
    });
    if (reason) run(() => appointmentAPI.cancel(id, reason.trim()), 'Appointment cancelled');
  };

  const reschedule = () => {
    if (!newTime) {
      setError('Pick a new time slot.');
      return;
    }
    run(async () => {
      await appointmentAPI.reschedule(id, { appointmentDate: newDate, appointmentTime: newTime });
      setRescheduling(false);
      setNewTime('');
    }, 'Appointment rescheduled');
  };

  if (!appointment) {
    return (
      <BaseLayout resourceName="Appointment Status">
        <div className="rounded-2xl bg-white p-8 text-sm text-gray-500 shadow-sm">{error || 'Loading appointment...'}</div>
      </BaseLayout>
    );
  }

  const next = STATUS_TRANSITIONS[appointment.status].filter((s) => s !== 'cancelled');
  const isOpen = STATUS_TRANSITIONS[appointment.status].length > 0;

  return (
    <BaseLayout resourceName="Appointment Status">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Link to="/appointments" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to appointments</Link>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Appointment</p>
              <h1 className="text-2xl font-bold text-gray-900">{patientName(appointment)}</h1>
              <p className="mt-1 text-sm text-gray-500">with Dr. {doctorName(appointment)}</p>
            </div>
            <span className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLES[appointment.status]}`}>{STATUS_LABELS[appointment.status]}</span>
          </div>

          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            {[
              ['Date', toDateKey(new Date(appointment.appointmentDate))],
              ['Time', appointment.appointmentTime],
              ['Type', appointment.appointmentType],
              ['Priority', appointment.priority],
              ['Reason', appointment.reason],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-gray-50 p-3">
                <dt className="text-xs uppercase tracking-wider text-gray-400">{label}</dt>
                <dd className="mt-1 font-medium capitalize text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>

          {error && <div className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {canUpdate && isOpen && (
            <div className="mt-6 flex flex-wrap gap-2">
              {next.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => appointmentAPI.updateStatus(id, status), `Marked ${STATUS_LABELS[status].toLowerCase()}`)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {ACTION_LABELS[status] ?? STATUS_LABELS[status]}
                </button>
              ))}
              {appointment.status !== 'checked_in' && (
                <button type="button" disabled={busy} onClick={() => setRescheduling((v) => !v)} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Reschedule
                </button>
              )}
              <button type="button" disabled={busy} onClick={cancel} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                Cancel appointment
              </button>
            </div>
          )}

          {appointment.status === 'checked_in' && can('write', 'Consultation', user?.role) && (
            <button
              type="button"
              onClick={() => navigate(`/medical-records/consultations/new?patientId=${appointment.patientId}`)}
              className="mt-4 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Start consultation
            </button>
          )}
        </section>

        {rescheduling && appointment.doctorId && (
          <section className="space-y-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">Reschedule</h2>
            <input
              type="date"
              min={toDateKey(new Date())}
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value);
                setNewTime('');
              }}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
            <SlotPicker doctorId={appointment.doctorId} date={newDate} value={newTime} onChange={setNewTime} />
            <button type="button" disabled={busy} onClick={reschedule} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              Confirm new time
            </button>
          </section>
        )}
      </div>
    </BaseLayout>
  );
};
