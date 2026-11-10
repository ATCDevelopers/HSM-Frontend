import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import Table from '../../components/sections/Table';
import { patientAPI, type Patient } from '../../services/patientAPI';
import { getErrorMessage } from '../../services/apiResponse';
import {
  appointmentAPI,
  type Appointment,
  type AppointmentStatus,
  type Doctor,
  STATUS_LABELS,
  STATUS_STYLES,
  doctorName,
  patientName,
  toDateKey,
} from '../../services/appointmentAPI';

const filterClass = 'rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none';

const daysFromToday = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateKey(d);
};

/** All appointments, filterable by patient, doctor, status and date range. */
export const PatientHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    patientId: searchParams.get('patientId') ?? '',
    doctorId: '',
    status: '' as AppointmentStatus | '',
    startDate: daysFromToday(-30),
    endDate: daysFromToday(30),
  });

  useEffect(() => {
    // Lookups are optional filters; a role without access to one just loses that dropdown.
    patientAPI.list().then(setPatients).catch(() => undefined);
    appointmentAPI.doctors().then(setDoctors).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    appointmentAPI
      .list({
        patientId: filters.patientId || undefined,
        doctorId: filters.doctorId || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      })
      .then((list) => setRows(list.reverse()))
      .catch((e: unknown) => setError(getErrorMessage(e, 'Failed to load appointments')))
      .finally(() => setLoading(false));
  }, [filters]);

  const set = (key: keyof typeof filters, value: string) => setFilters((prev) => ({ ...prev, [key]: value }));

  const columns = [
    { key: 'appointmentDate', title: 'Date', render: (_: unknown, a: Appointment) => <span className="whitespace-nowrap">{toDateKey(new Date(a.appointmentDate))} {a.appointmentTime}</span> },
    { key: 'patient', title: 'Patient', render: (_: unknown, a: Appointment) => <span className="font-semibold text-gray-900">{patientName(a)}</span> },
    { key: 'doctor', title: 'Doctor', render: (_: unknown, a: Appointment) => `Dr. ${doctorName(a)}` },
    { key: 'appointmentType', title: 'Type' },
    { key: 'reason', title: 'Reason' },
    {
      key: 'status',
      title: 'Status',
      render: (value: AppointmentStatus) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[value]}`}>{STATUS_LABELS[value]}</span>,
    },
  ];

  return (
    <BaseLayout resourceName="Appointment History">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500">Search past and upcoming appointments. Click a row to manage it.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select className={filterClass} value={filters.patientId} onChange={(e) => set('patientId', e.target.value)}>
            <option value="">All patients</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
          </select>
          <select className={filterClass} value={filters.doctorId} onChange={(e) => set('doctorId', e.target.value)}>
            <option value="">All doctors</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
          </select>
          <select className={filterClass} value={filters.status} onChange={(e) => set('status', e.target.value)}>
            <option value="">Any status</option>
            {(Object.keys(STATUS_LABELS) as AppointmentStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <input type="date" className={filterClass} value={filters.startDate} onChange={(e) => set('startDate', e.target.value)} />
          <input type="date" className={filterClass} value={filters.endDate} onChange={(e) => set('endDate', e.target.value)} />
        </div>

        {error && <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

        <Table
          columns={columns}
          data={rows}
          loading={loading}
          emptyMessage="No appointments match these filters."
          onRowClick={(a: Appointment) => navigate(`/appointments/${a.id}/status`)}
        />
      </div>
    </BaseLayout>
  );
};
