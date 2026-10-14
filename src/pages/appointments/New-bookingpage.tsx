import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import BaseLayout from '../../components/layouts/BaseLayout';
import FieldSet from '../../components/atoms/forms/FieldSet';
import Input from '../../components/atoms/forms/Input';
import Select from '../../components/atoms/forms/Select';
import Button from '../../components/atoms/ui/Button';
import {
  bookAppointment,
  getDoctorAvailability,
  type ComputedSlot,
  type BookAppointmentPayload,
} from '../../services/appointmentAPI';
import { userAPI } from '../../services/userAPI';
import { patientAPI } from '../../services/patientAPI';
import Swal from 'sweetalert2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Doctor { id: string; firstName: string; lastName: string; role: string; }
interface Patient { id: string; firstName: string; lastName: string; }

const APPOINTMENT_TYPES = [
  'General Checkup', 'Follow-up', 'Consultation', 'Specialist Referral',
  'Surgery', 'Emergency', 'Vaccination', 'Lab Test', 'Physical Therapy', 'Other',
].map(v => ({ value: v, label: v }));

const PRIORITIES = [
  { value: 'low',       label: 'Low'       },
  { value: 'medium',    label: 'Medium'    },
  { value: 'high',      label: 'High'      },
  { value: 'emergency', label: 'Emergency' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const NewBookingPage: React.FC = () => {
  const navigate = useNavigate();

  // ── Form state ───────────────────────────────────────────────────────────
  const [form, setForm] = useState<Omit<BookAppointmentPayload, 'appointmentDate' | 'appointmentTime'> & {
    appointmentDate: string;
    appointmentTime: string;
  }>({
    patientId: '',
    doctorId: '',
    appointmentType: '',
    priority: 'medium',
    reason: '',
    appointmentDate: '',
    appointmentTime: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Lists ────────────────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // ── Availability ─────────────────────────────────────────────────────────
  const [slots, setSlots] = useState<ComputedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    userAPI.list().then((users: any[]) =>
      setDoctors(users.filter((u: any) => u.role === 'Doctor'))
    ).catch(() => {});

    patientAPI.list().then(setPatients).catch(() => {});
  }, []);

  // Fetch slots whenever doctorId + date change
  useEffect(() => {
    if (!form.doctorId || !form.appointmentDate) { setSlots([]); return; }
    setLoadingSlots(true);
    getDoctorAvailability(form.doctorId, form.appointmentDate, form.appointmentDate)
      .then(data => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.doctorId, form.appointmentDate]);

  const availableSlots = slots.filter(s => s.status === 'available');

  // ── Validation ───────────────────────────────────────────────────────────
  function validate() {
    const e: typeof errors = {};
    if (!form.patientId)        e.patientId        = 'Patient is required.';
    if (!form.appointmentType)  e.appointmentType  = 'Appointment type is required.';
    if (!form.reason.trim())    e.reason           = 'Reason is required.';
    if (!form.appointmentDate)  e.appointmentDate  = 'Date is required.';
    if (!form.appointmentTime)  e.appointmentTime  = 'Time slot is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: BookAppointmentPayload = {
        patientId: form.patientId,
        doctorId: form.doctorId || undefined,
        appointmentType: form.appointmentType,
        priority: form.priority as any,
        reason: form.reason,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
      };
      await bookAppointment(payload);
      await Swal.fire({
        title: 'Appointment Booked!',
        text: 'The appointment has been successfully scheduled.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
      navigate('/appointments/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to book appointment';
      Swal.fire('Booking Failed', msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const set = (key: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const doctorOptions = [
    { value: '', label: 'No doctor assigned (walk-in)' },
    ...doctors.map(d => ({ value: d.id, label: `Dr. ${d.firstName} ${d.lastName}` })),
  ];
  const patientOptions = patients.map(p => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
  }));

  return (
    <BaseLayout resourceName="Appointments">
      <div className="w-full min-h-[calc(100vh-6rem)] rounded-2xl bg-blue-50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Booking</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">New Appointment Booking</h2>
              <p className="mt-0.5 text-sm text-gray-500">Schedule a visit with a healthcare professional.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/appointments/dashboard')}>
              ← Back to Dashboard
            </Button>
          </div>

          {/* ── Two-column layout ───────────────────────────────────────────── */}
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.35fr]">

            {/* Left — Info panel */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-blue-600/20 flex flex-col gap-5">
              <div>
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-100">
                  Fast care
                </span>
                <h3 className="mt-4 text-2xl font-bold">Consultation made easy</h3>
                <p className="mt-1.5 text-sm text-blue-100">
                  Book in minutes and receive a quick confirmation from the clinic team.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: UserCircleIcon,  title: 'Patient Selection',  desc: 'Choose from registered patients' },
                  { icon: CalendarDaysIcon, title: 'Date & Doctor',      desc: 'Pick a date then view live slots' },
                  { icon: ClockIcon,       title: 'Time Slot',           desc: 'Select an available time slot'   },
                  { icon: CheckCircleIcon, title: 'Confirm Booking',     desc: 'Review & submit for scheduling'  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 rounded-xl bg-white/10 p-3">
                    <Icon className="h-6 w-6 text-cyan-200 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs text-blue-100">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Form */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                {/* Patient & Doctor */}
                <FieldSet legend="Patient & Doctor">
                  <Select
                    label="Patient"
                    required
                    options={patientOptions}
                    value={form.patientId}
                    onChange={v => set('patientId', String(v))}
                    placeholder="Search patient…"
                    error={errors.patientId}
                  />
                  <Select
                    label="Doctor"
                    options={doctorOptions}
                    value={form.doctorId}
                    onChange={v => set('doctorId', String(v))}
                    placeholder="No doctor assigned (walk-in)"
                  />
                </FieldSet>

                {/* Appointment Details */}
                <FieldSet legend="Appointment Details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      label="Appointment Type"
                      required
                      options={APPOINTMENT_TYPES}
                      value={form.appointmentType}
                      onChange={v => set('appointmentType', String(v))}
                      placeholder="Select type…"
                      error={errors.appointmentType}
                    />
                    <Select
                      label="Priority"
                      options={PRIORITIES}
                      value={form.priority}
                      onChange={v => set('priority', String(v))}
                    />
                  </div>
                  <Input
                    label="Reason for Visit"
                    required
                    value={form.reason}
                    onChange={e => set('reason', e.target.value)}
                    placeholder="Describe the reason for this appointment"
                    error={errors.reason}
                  />
                </FieldSet>

                {/* Scheduling */}
                <FieldSet legend="Schedule">
                  <Input
                    label="Appointment Date"
                    type="date"
                    required
                    value={form.appointmentDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => {
                      set('appointmentDate', e.target.value);
                      set('appointmentTime', '');
                    }}
                    error={errors.appointmentDate}
                  />

                  {/* Time slot picker */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Time Slot <span className="text-red-500">*</span>
                    </label>

                    {/* Case 1: Doctor + date selected → load live slots */}
                    {form.doctorId && form.appointmentDate ? (
                      loadingSlots ? (
                        <div className="flex flex-wrap gap-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-8 w-16 rounded-lg bg-gray-100 animate-pulse" />
                          ))}
                        </div>
                      ) : availableSlots.length > 0 ? (
                        /* Slot grid */
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map(slot => (
                            <button
                              key={`${slot.date}_${slot.time}`}
                              type="button"
                              onClick={() => set('appointmentTime', slot.time)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                form.appointmentTime === slot.time
                                  ? 'border-blue-600 bg-blue-600 text-white shadow'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700'
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      ) : (
                        /* No slots returned → manual fallback */
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs text-amber-600 font-medium">
                            No available slots for this date. Enter a time manually or choose another date / doctor.
                          </p>
                          <Input
                            type="time"
                            value={form.appointmentTime}
                            onChange={e => set('appointmentTime', e.target.value)}
                            error={errors.appointmentTime}
                          />
                        </div>
                      )
                    ) : (
                      /* Case 2: No doctor selected (walk-in) or no date → always show time input */
                      <div className="flex flex-col gap-1.5">
                        <Input
                          type="time"
                          value={form.appointmentTime}
                          onChange={e => set('appointmentTime', e.target.value)}
                          error={errors.appointmentTime}
                        />
                        <p className="text-xs text-slate-400">
                          {!form.doctorId
                            ? 'Select a doctor and date to view live available slots, or enter the time manually above.'
                            : 'Select a date to view available slots, or enter the time manually above.'}
                        </p>
                      </div>
                    )}

                    {/* Inline error for the slot-grid case (no inner Input to show it) */}
                    {errors.appointmentTime && form.doctorId && form.appointmentDate && availableSlots.length > 0 && (
                      <p className="mt-1 text-xs text-red-600">{errors.appointmentTime}</p>
                    )}
                  </div>
                </FieldSet>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="flex-1 justify-center"
                  >
                    Confirm Booking
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/appointments/dashboard')}
                    className="flex-1 justify-center"
                  >
                    Cancel
                  </Button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};