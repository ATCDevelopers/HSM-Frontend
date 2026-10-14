import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import BaseLayout from '../../components/layouts/BaseLayout';
import Input from '../../components/atoms/forms/Input';
import Select from '../../components/atoms/forms/Select';
import Button from '../../components/atoms/ui/Button';
import Badge from '../../components/atoms/ui/Badge';
import Table from '../../components/sections/Table';
import Modal from '../../components/atoms/ui/Modal';
import {
  getAppointmentReports,
  rescheduleAppointment,
  cancelAppointment,
  type Appointment,
  type AppointmentStatus,
} from '../../services/appointmentAPI';
import { patientAPI } from '../../services/patientAPI';
import Swal from 'sweetalert2';

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

interface Patient { id: string; firstName: string; lastName: string; }

// ─── Component ────────────────────────────────────────────────────────────────
export const PatientHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // ── Filters ──────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filterPatient, setFilterPatient] = useState('');
  const [filterStatus,  setFilterStatus]  = useState<AppointmentStatus | ''>('');
  const [filterStart,   setFilterStart]   = useState('');
  const [filterEnd,     setFilterEnd]     = useState('');
  const [searchTerm,    setSearchTerm]    = useState('');
  const [filtersOpen,   setFiltersOpen]   = useState(false);

  // ── Pagination ───────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // ── Reschedule modal ─────────────────────────────────────────────────────
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  // ── Load patients list ────────────────────────────────────────────────────
  useEffect(() => {
    patientAPI.list().then(setPatients).catch(() => {});
  }, []);

  // ── Load appointments ─────────────────────────────────────────────────────
  function fetchAppointments() {
    setLoading(true);
    setError('');
    getAppointmentReports({
      patientId: filterPatient || undefined,
      status: filterStatus || undefined,
      startDate: filterStart || undefined,
      endDate: filterEnd || undefined,
    })
      .then(data => { setAppointments(data); setPage(1); })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load appointments')
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAppointments(); }, []);

  // ── Client-side search ────────────────────────────────────────────────────
  const filtered = appointments.filter(a => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return [
      a.patientFirstName, a.patientLastName, a.doctorFirstName, a.doctorLastName,
      a.appointmentType, a.status, a.reason,
    ].some(v => v?.toLowerCase().includes(q));
  });

  const totalPages     = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Cancel ────────────────────────────────────────────────────────────────
  async function handleCancel(appt: Appointment) {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Cancel Appointment',
      input: 'textarea',
      inputLabel: 'Reason for cancellation',
      inputPlaceholder: 'Enter reason…',
      inputAttributes: { required: 'true' },
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Cancel Appointment',
      cancelButtonText: 'Go Back',
      preConfirm: (val) => {
        if (!val || !val.trim()) { Swal.showValidationMessage('Reason is required.'); }
        return val;
      },
    });
    if (!isConfirmed || !reason) return;

    try {
      await cancelAppointment(appt.id, reason);
      setAppointments(prev =>
        prev.map(a => a.id === appt.id ? { ...a, status: 'cancelled' } : a)
      );
      Swal.fire({ title: 'Cancelled', text: 'Appointment has been cancelled.', icon: 'success', timer: 1800, showConfirmButton: false });
    } catch (err: unknown) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to cancel', 'error');
    }
  }

  // ── Reschedule ────────────────────────────────────────────────────────────
  function openReschedule(appt: Appointment) {
    setRescheduleTarget(appt);
    setRescheduleDate(appt.appointmentDate?.slice(0, 10) ?? '');
    setRescheduleTime(appt.appointmentTime ?? '');
  }

  async function handleReschedule() {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;
    setRescheduleLoading(true);
    try {
      const updated = await rescheduleAppointment(rescheduleTarget.id, {
        appointmentDate: rescheduleDate,
        appointmentTime: rescheduleTime,
      });
      setAppointments(prev =>
        prev.map(a => a.id === updated.id ? { ...a, ...updated } : a)
      );
      setRescheduleTarget(null);
      Swal.fire({ title: 'Rescheduled', text: 'Appointment has been rescheduled.', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (err: unknown) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to reschedule', 'error');
    } finally {
      setRescheduleLoading(false);
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
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
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
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
      key: 'actions',
      title: 'Actions',
      render: (_: any, a: Appointment) => {
        const terminal = ['completed', 'cancelled', 'no_show'].includes(a.status);
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/appointments/${a.id}/status`)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Status
            </button>
            {!terminal && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => openReschedule(a)}
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Reschedule
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => handleCancel(a)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <BaseLayout resourceName="Appointments">
      <div className="w-full min-h-[calc(100vh-6rem)] rounded-2xl bg-blue-50 p-4 sm:p-6 flex flex-col gap-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">History</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Patient Appointment History</h2>
            <p className="mt-0.5 text-sm text-gray-500">Browse, filter, reschedule or cancel appointments.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setFiltersOpen(o => !o)} className="gap-1.5">
              <FunnelIcon className="h-4 w-4" /> Filters
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/appointments/new')} className="gap-1.5">
              <CalendarDaysIcon className="h-4 w-4" /> New Booking
            </Button>
          </div>
        </div>

        {/* ── Filters panel ──────────────────────────────────────────────── */}
        {filtersOpen && (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Select
                label="Patient"
                options={[{ value: '', label: 'All patients' }, ...patients.map(p => ({
                  value: p.id,
                  label: `${p.firstName} ${p.lastName}`,
                }))]}
                value={filterPatient}
                onChange={v => setFilterPatient(String(v))}
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
                value={filterStatus}
                onChange={v => setFilterStatus(v as any)}
              />
              <Input label="From Date" type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} />
              <Input label="To Date"   type="date" value={filterEnd}   onChange={e => setFilterEnd(e.target.value)}   />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => {
                setFilterPatient(''); setFilterStatus(''); setFilterStart(''); setFilterEnd('');
              }}>
                Clear
              </Button>
              <Button variant="primary" size="sm" onClick={fetchAppointments}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* ── Search bar ─────────────────────────────────────────────────── */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search patient, doctor, type, reason…"
            className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 py-2.5 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <Table
            columns={columns}
            data={paginated}
            loading={loading}
            emptyMessage="No appointment records found."
          />

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <p className="text-xs text-gray-500">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
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

      {/* ── Reschedule Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={!!rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Appointment"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          {rescheduleTarget && (
            <p className="text-sm text-gray-600">
              Rescheduling appointment for{' '}
              <strong>{rescheduleTarget.patientFirstName} {rescheduleTarget.patientLastName}</strong>.
            </p>
          )}
          <Input
            label="New Date"
            type="date"
            required
            value={rescheduleDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => setRescheduleDate(e.target.value)}
          />
          <Input
            label="New Time (HH:mm)"
            type="time"
            required
            value={rescheduleTime}
            onChange={e => setRescheduleTime(e.target.value)}
          />
          <div className="flex gap-3 pt-1">
            <Button
              variant="primary"
              loading={rescheduleLoading}
              onClick={handleReschedule}
              className="flex-1 justify-center"
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              onClick={() => setRescheduleTarget(null)}
              className="flex-1 justify-center"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </BaseLayout>
  );
};