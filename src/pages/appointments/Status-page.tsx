import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import BaseLayout from '../../components/layouts/BaseLayout';
import Select from '../../components/atoms/forms/Select';
import Input from '../../components/atoms/forms/Input';
import Button from '../../components/atoms/ui/Button';
import Badge from '../../components/atoms/ui/Badge';
import {
  getAppointmentReports,
  updateAppointmentStatus,
  cancelAppointment,
  type Appointment,
  type AppointmentStatus,
} from '../../services/appointmentAPI';
import Swal from 'sweetalert2';

// ─── Status lifecycle ─────────────────────────────────────────────────────────
const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled:  ['confirmed', 'checked_in', 'cancelled', 'no_show'],
  confirmed:  ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['completed', 'cancelled'],
  completed:  [],
  cancelled:  [],
  no_show:    [],
};

const STATUS_BADGE: Record<string, { variant: any; label: string }> = {
  scheduled:  { variant: 'info',    label: 'Scheduled'  },
  confirmed:  { variant: 'primary', label: 'Confirmed'  },
  checked_in: { variant: 'warning', label: 'Checked In' },
  completed:  { variant: 'success', label: 'Completed'  },
  cancelled:  { variant: 'danger',  label: 'Cancelled'  },
  no_show:    { variant: 'default', label: 'No Show'    },
};

const STATUS_ICON: Record<string, React.FC<any>> = {
  scheduled:  CalendarDaysIcon,
  confirmed:  CheckCircleIcon,
  checked_in: ArrowPathIcon,
  completed:  CheckCircleIcon,
  cancelled:  XCircleIcon,
  no_show:    XCircleIcon,
};

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

// ─── Component ────────────────────────────────────────────────────────────────
export const AppointmentStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const [newStatus, setNewStatus]   = useState<AppointmentStatus | ''>('');
  const [reason, setReason]         = useState('');
  const [updating, setUpdating]     = useState(false);

  // ── Load appointment ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    // Reports endpoint supports filtering by id via a report look-up
    // We get all then find by id (no dedicated GET /appointments/:id on frontend routes)
    getAppointmentReports()
      .then(all => {
        const found = all.find(a => a.id === id) ?? null;
        setAppointment(found);
        if (!found) setError('Appointment not found.');
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load appointment')
      )
      .finally(() => setLoading(false));
  }, [id]);

  const currentStatus = appointment?.status as AppointmentStatus | undefined;
  const allowedTransitions = currentStatus ? TRANSITIONS[currentStatus] : [];
  const isTerminal = currentStatus && allowedTransitions.length === 0;

  const statusOptions = allowedTransitions.map(s => ({
    value: s,
    label: STATUS_BADGE[s]?.label ?? s,
  }));

  // ── Submit status update ──────────────────────────────────────────────────
  async function handleUpdate() {
    if (!appointment || !newStatus) return;
    const requiresReason = newStatus === 'cancelled';
    if (requiresReason && !reason.trim()) {
      return Swal.fire('Reason Required', 'A reason is required to cancel an appointment.', 'warning');
    }

    setUpdating(true);
    try {
      let updated: Appointment;
      if (newStatus === 'cancelled') {
        updated = await cancelAppointment(appointment.id, reason.trim());
      } else {
        updated = await updateAppointmentStatus(appointment.id, newStatus, reason.trim() || undefined);
      }
      setAppointment(prev => prev ? { ...prev, status: updated.status } : prev);
      setNewStatus('');
      setReason('');
      await Swal.fire({
        title: 'Status Updated',
        text: `Appointment is now "${STATUS_BADGE[updated.status]?.label ?? updated.status}".`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  }

  // ── Lifecycle stepper data ────────────────────────────────────────────────
  const steps: AppointmentStatus[] = ['scheduled', 'confirmed', 'checked_in', 'completed'];
  const stepIdx = currentStatus ? steps.indexOf(currentStatus) : -1;

  return (
    <BaseLayout resourceName="Appointments">
      <div className="w-full min-h-[calc(100vh-6rem)] rounded-2xl bg-blue-50 p-4 sm:p-6 flex flex-col gap-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Status Update</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Appointment Details</h2>
            <p className="mt-0.5 text-sm text-gray-500">Review and update the appointment lifecycle status.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/appointments/history')}>
            ← Back to History
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-8 text-center text-sm text-red-600">
            {error}
          </div>
        ) : appointment && (
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">

            {/* ── Left — Appointment info ──────────────────────────────── */}
            <div className="flex flex-col gap-4">

              {/* Status badge */}
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                {(() => {
                  const Icon = STATUS_ICON[appointment.status] ?? ClockIcon;
                  const b = STATUS_BADGE[appointment.status] ?? { variant: 'default', label: appointment.status };
                  return (
                    <>
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                        appointment.status === 'completed' ? 'bg-green-100 text-green-700'
                        : appointment.status === 'cancelled' ? 'bg-red-100 text-red-700'
                        : appointment.status === 'checked_in' ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Current Status</p>
                        <Badge variant={b.variant} size="lg" className="mt-1">{b.label}</Badge>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Lifecycle stepper */}
              {!['cancelled', 'no_show'].includes(appointment.status) && (
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Lifecycle</p>
                  <div className="flex items-center gap-0">
                    {steps.map((step, i) => {
                      const done = stepIdx > i;
                      const active = stepIdx === i;
                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center gap-1.5 flex-1">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                              done   ? 'border-green-500 bg-green-500 text-white'
                              : active ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-gray-200 bg-white text-gray-400'
                            }`}>
                              {done ? '✓' : i + 1}
                            </div>
                            <p className={`text-[10px] font-semibold capitalize text-center ${
                              active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {STATUS_BADGE[step]?.label ?? step}
                            </p>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`h-0.5 flex-1 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Appointment details card */}
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Appointment Details</p>
                {[
                  { label: 'Patient',   value: `${appointment.patientFirstName ?? ''} ${appointment.patientLastName ?? ''}` },
                  { label: 'Doctor',    value: appointment.doctorFirstName ? `Dr. ${appointment.doctorFirstName} ${appointment.doctorLastName}` : 'Not assigned' },
                  { label: 'Type',      value: appointment.appointmentType },
                  { label: 'Date',      value: fmtDate(appointment.appointmentDate) },
                  { label: 'Time',      value: appointment.appointmentTime },
                  { label: 'Priority',  value: appointment.priority },
                  { label: 'Reason',    value: appointment.reason },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-3 border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <span className="text-xs font-medium text-gray-400 shrink-0">{label}</span>
                    <span className="text-sm text-gray-800 text-right capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right — Status update form ───────────────────────────── */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-4 h-fit">
              <div>
                <h3 className="font-bold text-gray-900">Update Status</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isTerminal
                    ? `Status "${STATUS_BADGE[currentStatus!]?.label}" is a terminal state — no further transitions are allowed.`
                    : 'Select the next status from the allowed transitions.'}
                </p>
              </div>

              {isTerminal ? (
                <div className="rounded-xl bg-gray-50 border border-dashed border-gray-200 py-8 text-center">
                  <XCircleIcon className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-400">This appointment is in a terminal state.</p>
                </div>
              ) : (
                <>
                  <Select
                    label="New Status"
                    required
                    options={statusOptions}
                    value={newStatus}
                    onChange={v => setNewStatus(v as AppointmentStatus)}
                    placeholder="Select next status…"
                  />

                  {(newStatus === 'cancelled' || newStatus) && (
                    <Input
                      label={newStatus === 'cancelled' ? 'Cancellation Reason (required)' : 'Reason (optional)'}
                      required={newStatus === 'cancelled'}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder={newStatus === 'cancelled' ? 'Explain why this appointment is being cancelled…' : 'Optional notes…'}
                    />
                  )}

                  <div className="pt-1">
                    <Button
                      variant="primary"
                      loading={updating}
                      disabled={!newStatus}
                      onClick={handleUpdate}
                      className="w-full justify-center"
                    >
                      Update Status
                    </Button>
                  </div>

                  {/* Quick action tiles */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Quick Transitions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {allowedTransitions.map(s => {
                        const b = STATUS_BADGE[s];
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewStatus(s)}
                            className={`rounded-xl border px-3 py-2.5 text-xs font-semibold text-left transition ${
                              newStatus === s
                                ? 'border-blue-400 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            {b?.label ?? s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </BaseLayout>
  );
};