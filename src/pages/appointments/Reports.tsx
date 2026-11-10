import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import BaseLayout from '../../components/layouts/BaseLayout';
import Input from '../../components/atoms/forms/Input';
import Select from '../../components/atoms/forms/Select';
import Button from '../../components/atoms/ui/Button';
import Badge from '../../components/atoms/ui/Badge';
import Table from '../../components/sections/Table';
import {
  getAppointmentReports,
  type Appointment,
  type AppointmentStatus,
  type AppointmentReportFilters,
} from '../../services/appointmentAPI';
import { userAPI } from '../../services/userAPI';
import { patientAPI } from '../../services/patientAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<string, { variant: any; label: string }> = {
  scheduled:  { variant: 'info',    label: 'Scheduled'  },
  confirmed:  { variant: 'primary', label: 'Confirmed'  },
  checked_in: { variant: 'warning', label: 'Checked In' },
  completed:  { variant: 'success', label: 'Completed'  },
  cancelled:  { variant: 'danger',  label: 'Cancelled'  },
  no_show:    { variant: 'default', label: 'No Show'    },
};

const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

interface Doctor  { id: string; firstName: string; lastName: string; role: string; }
interface Patient { id: string; firstName: string; lastName: string; }

// ─── Component ────────────────────────────────────────────────────────────────
export const AppointmentReportsPage: React.FC = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // ── Filter state ─────────────────────────────────────────────────────────
  const [doctors,  setDoctors]  = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [filters, setFilters] = useState<AppointmentReportFilters>({
    doctorId:  undefined,
    patientId: undefined,
    status:    undefined,
    startDate: undefined,
    endDate:   undefined,
  });

  // ── Pagination ───────────────────────────────────────────────────────────
  const [page, setPage]     = useState(1);
  const PER_PAGE            = 15;

  // ── Load lookup lists ─────────────────────────────────────────────────────
  useEffect(() => {
    userAPI.list().then((users: any[]) =>
      setDoctors(users.filter((u: any) => u.role === 'Doctor'))
    ).catch(() => {});
    patientAPI.list().then(setPatients).catch(() => {});
  }, []);

  // ── Load report on mount ──────────────────────────────────────────────────
  useEffect(() => { fetchReport(); }, []);

  function fetchReport() {
    setLoading(true);
    setError('');
    const clean: AppointmentReportFilters = {};
    if (filters.doctorId)  clean.doctorId  = filters.doctorId;
    if (filters.patientId) clean.patientId = filters.patientId;
    if (filters.status)    clean.status    = filters.status;
    if (filters.startDate) clean.startDate = filters.startDate;
    if (filters.endDate)   clean.endDate   = filters.endDate;

    getAppointmentReports(clean)
      .then(data => { setAppointments(data); setPage(1); })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load report')
      )
      .finally(() => setLoading(false));
  }

  function clearFilters() {
    setFilters({ doctorId: undefined, patientId: undefined, status: undefined, startDate: undefined, endDate: undefined });
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const total     = appointments.length;
  const byStatus  = (s: string) => appointments.filter(a => a.status === s).length;

  // ── Export CSV ────────────────────────────────────────────────────────────
  function exportCsv() {
    const header = ['Patient','Doctor','Type','Date','Time','Priority','Status','Reason'];
    const rows = appointments.map(a => [
      `${a.patientFirstName ?? ''} ${a.patientLastName ?? ''}`.trim(),
      a.doctorFirstName ? `Dr. ${a.doctorFirstName} ${a.doctorLastName}` : '—',
      a.appointmentType,
      fmtDate(a.appointmentDate),
      a.appointmentTime,
      a.priority,
      a.status,
      `"${(a.reason ?? '').replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `appointments-report-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'patient',
      title: 'Patient',
      render: (_: any, a: Appointment) => (
        <span className="font-semibold text-gray-900">
          {a.patientFirstName} {a.patientLastName}
        </span>
      ),
    },
    {
      key: 'doctor',
      title: 'Doctor',
      render: (_: any, a: Appointment) => (
        <span className="text-gray-600">
          {a.doctorFirstName ? `Dr. ${a.doctorFirstName} ${a.doctorLastName}` : '—'}
        </span>
      ),
    },
    {
      key: 'appointmentType',
      title: 'Type',
      render: (val: string) => <span className="text-gray-600">{val}</span>,
    },
    {
      key: 'appointmentDate',
      title: 'Date',
      render: (val: string) => <span className="text-gray-600 whitespace-nowrap">{fmtDate(val)}</span>,
    },
    {
      key: 'appointmentTime',
      title: 'Time',
      render: (val: string) => <span className="text-gray-600">{val}</span>,
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (val: string) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
          val === 'emergency' ? 'bg-red-100 text-red-700'
          : val === 'high'    ? 'bg-orange-100 text-orange-700'
          : val === 'medium'  ? 'bg-yellow-100 text-yellow-700'
          : 'bg-gray-100 text-gray-600'
        }`}>
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (val: string) => {
        const b = STATUS_BADGE[val] ?? { variant: 'default', label: val };
        return <Badge variant={b.variant} size="sm">{b.label}</Badge>;
      },
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (val: string) => (
        <span className="text-gray-500 text-xs max-w-[180px] truncate block" title={val}>{val}</span>
      ),
    },
    {
      key: 'id',
      title: '',
      render: (_: any, a: Appointment) => (
        <button
          type="button"
          onClick={() => navigate(`/appointments/${a.id}/status`)}
          className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
        >
          View
        </button>
      ),
    },
  ];

  const totalPages = Math.max(1, Math.ceil(appointments.length / PER_PAGE));
  const paginated  = appointments.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <BaseLayout resourceName="Appointments">
      <div className="w-full min-h-[calc(100vh-6rem)] rounded-2xl bg-blue-50 p-4 sm:p-6 flex flex-col gap-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Analytics</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Appointment Reports</h2>
            <p className="mt-0.5 text-sm text-gray-500">Filter, analyse, and export appointment data.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCsv}
              disabled={appointments.length === 0}
              className="gap-1.5"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/appointments/new')} className="gap-1.5">
              <CalendarDaysIcon className="h-4 w-4" />
              New Booking
            </Button>
          </div>
        </div>

        {/* ── Summary stat cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { label: 'Total',      val: total,               color: 'text-gray-700',   bg: 'bg-white'        },
            { label: 'Scheduled',  val: byStatus('scheduled'), color: 'text-blue-700',  bg: 'bg-blue-50'      },
            { label: 'Confirmed',  val: byStatus('confirmed'), color: 'text-indigo-700',bg: 'bg-indigo-50'    },
            { label: 'Completed',  val: byStatus('completed'), color: 'text-green-700', bg: 'bg-green-50'     },
            { label: 'Cancelled',  val: byStatus('cancelled'), color: 'text-red-700',   bg: 'bg-red-50'       },
            { label: 'No Show',    val: byStatus('no_show'),   color: 'text-gray-600',  bg: 'bg-gray-100'     },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`rounded-2xl ${bg} border border-gray-100 shadow-sm p-4`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>
                {loading ? '—' : val}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters panel ──────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700">Report Filters</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Select
              label="Doctor"
              options={[
                { value: '', label: 'All doctors' },
                ...doctors.map(d => ({ value: d.id, label: `Dr. ${d.firstName} ${d.lastName}` })),
              ]}
              value={filters.doctorId ?? ''}
              onChange={v => setFilters(f => ({ ...f, doctorId: v ? String(v) : undefined }))}
            />
            <Select
              label="Patient"
              options={[
                { value: '', label: 'All patients' },
                ...patients.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` })),
              ]}
              value={filters.patientId ?? ''}
              onChange={v => setFilters(f => ({ ...f, patientId: v ? String(v) : undefined }))}
            />
            <Select
              label="Status"
              options={[
                { value: '',           label: 'All statuses' },
                { value: 'scheduled',  label: 'Scheduled'    },
                { value: 'confirmed',  label: 'Confirmed'    },
                { value: 'checked_in', label: 'Checked In'   },
                { value: 'completed',  label: 'Completed'    },
                { value: 'cancelled',  label: 'Cancelled'    },
                { value: 'no_show',    label: 'No Show'      },
              ]}
              value={filters.status ?? ''}
              onChange={v => setFilters(f => ({ ...f, status: v ? (v as AppointmentStatus) : undefined }))}
            />
            <Input
              label="From Date"
              type="date"
              value={filters.startDate ?? ''}
              onChange={e => setFilters(f => ({ ...f, startDate: e.target.value || undefined }))}
            />
            <Input
              label="To Date"
              type="date"
              value={filters.endDate ?? ''}
              onChange={e => setFilters(f => ({ ...f, endDate: e.target.value || undefined }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear
            </Button>
            <Button variant="primary" size="sm" loading={loading} onClick={fetchReport}>
              <ChartBarIcon className="h-4 w-4 mr-1.5" /> Generate Report
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Results table ───────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">
              Results
              {!loading && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({appointments.length} appointment{appointments.length !== 1 ? 's' : ''})
                </span>
              )}
            </h3>
          </div>

          <Table
            columns={columns}
            data={paginated}
            loading={loading}
            emptyMessage="No appointments match the selected filters. Adjust filters and generate the report."
          />

          {/* Pagination */}
          {!loading && appointments.length > PER_PAGE && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, appointments.length)} of {appointments.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs disabled:opacity-40 hover:bg-gray-50"
                >
                  ← Prev
                </button>
                <span className="px-2 text-xs text-gray-600">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs disabled:opacity-40 hover:bg-gray-50"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </BaseLayout>
  );
};
