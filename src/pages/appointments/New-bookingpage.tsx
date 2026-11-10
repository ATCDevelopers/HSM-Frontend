import React, { useEffect, useState } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import BaseLayout from '../../components/layouts/BaseLayout';
import { useAuth } from '../../auth/AuthContext';
import { patientAPI, type Patient } from '../../services/patientAPI';
import { getErrorMessage } from '../../services/apiResponse';
import { appointmentAPI, doctorLabel, type AppointmentPriority, type Doctor, toDateKey } from '../../services/appointmentAPI';
import SlotPicker from './SlotPicker';

const APPOINTMENT_TYPES = ['Consultation', 'Follow-up', 'Check-up', 'Procedure', 'Emergency'];
const PRIORITIES: AppointmentPriority[] = ['low', 'medium', 'high', 'emergency'];

const fieldClass =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

export const NewBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const isDoctor = user?.role === 'Doctor';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    patientId: searchParams.get('patientId') ?? '',
    doctorId: isDoctor ? user?.id ?? '' : '',
    appointmentDate: toDateKey(new Date()),
    appointmentTime: '',
    appointmentType: APPOINTMENT_TYPES[0],
    priority: 'medium' as AppointmentPriority,
    reason: '',
  });

  useEffect(() => {
    Promise.all([patientAPI.list(), appointmentAPI.doctors()])
      .then(([p, d]) => {
        setPatients(p);
        setDoctors(d);
      })
      .catch((e: unknown) => setError(getErrorMessage(e, 'Failed to load patients and doctors')));
  }, []);

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
      // A slot only means something for the doctor/day it was picked on.
      ...(key === 'doctorId' || key === 'appointmentDate' ? { appointmentTime: '' } : {}),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.appointmentTime || !form.reason.trim()) {
      setError('Choose a patient, doctor and time slot, and enter the reason for the visit.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const appointment = await appointmentAPI.book({ ...form, reason: form.reason.trim() });
      await Swal.fire({ title: 'Booking confirmed', icon: 'success', timer: 1500, showConfirmButton: false });
      navigate(appointment?.id ? `/appointments/${appointment.id}/status` : '/appointments');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to book appointment'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseLayout resourceName="New Booking">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl space-y-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-blue-100 p-2 text-blue-700"><CalendarDaysIcon className="h-6 w-6" /></span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book an appointment</h1>
            <p className="text-sm text-gray-500">Pick the patient and doctor, then an open slot.</p>
          </div>
        </div>

        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Patient *
            <select className={fieldClass} value={form.patientId} onChange={(e) => update('patientId', e.target.value)}>
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName} · {p.phoneNumber}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Doctor *
            <select className={fieldClass} value={form.doctorId} disabled={isDoctor} onChange={(e) => update('doctorId', e.target.value)}>
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{doctorLabel(d)}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Date *
            <input type="date" className={fieldClass} min={toDateKey(new Date())} value={form.appointmentDate} onChange={(e) => update('appointmentDate', e.target.value)} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Type
              <select className={fieldClass} value={form.appointmentType} onChange={(e) => update('appointmentType', e.target.value)}>
                {APPOINTMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium text-gray-700">
              Priority
              <select className={fieldClass} value={form.priority} onChange={(e) => update('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Time slot *</p>
          <SlotPicker doctorId={form.doctorId} date={form.appointmentDate} value={form.appointmentTime} onChange={(t) => update('appointmentTime', t)} />
        </div>

        <label className="block space-y-1 text-sm font-medium text-gray-700">
          Reason for visit *
          <textarea rows={3} className={fieldClass} value={form.reason} onChange={(e) => update('reason', e.target.value)} placeholder="e.g. Persistent headache for 3 days" />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate('/appointments')} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {submitting ? 'Booking...' : 'Confirm booking'}
          </button>
        </div>
      </form>
    </BaseLayout>
  );
};
