import React, { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';
import FieldSet from '../../components/atoms/forms/FieldSet';
import Input from '../../components/atoms/forms/Input';
import Select from '../../components/atoms/forms/Select';
import Button from '../../components/atoms/ui/Button';
import Badge from '../../components/atoms/ui/Badge';
import Table from '../../components/sections/Table';
import {
  getDoctorAvailability,
  setDoctorSchedule,
  getAppointmentReports,
  type DoctorScheduleInput,
  type ComputedSlot,
  type Appointment,
} from '../../services/appointmentAPI';
import { userAPI } from '../../services/userAPI';
import Swal from 'sweetalert2';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const STATUS_BADGE: Record<string, { variant: any; label: string }> = {
  scheduled:  { variant: 'info',    label: 'Scheduled'  },
  confirmed:  { variant: 'primary', label: 'Confirmed'  },
  checked_in: { variant: 'warning', label: 'Checked In' },
  completed:  { variant: 'success', label: 'Completed'  },
  cancelled:  { variant: 'danger',  label: 'Cancelled'  },
  no_show:    { variant: 'default', label: 'No Show'    },
};

interface Doctor { id: string; firstName: string; lastName: string; }

// ─── Component ────────────────────────────────────────────────────────────────
export const DoctorSchedulePage: React.FC = () => {
  const navigate = useNavigate();

  // ── Doctor selection ─────────────────────────────────────────────────────
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

  // ── Availability slots ───────────────────────────────────────────────────
  const [slots, setSlots]           = useState<ComputedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ── Doctor appointments ──────────────────────────────────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // ── Schedule editor ──────────────────────────────────────────────────────
  const [schedules, setSchedules] = useState<DoctorScheduleInput[]>([
    { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30, isWorkingDay: true },
  ]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability'>('schedule');

  // ── Load doctors ─────────────────────────────────────────────────────────
  useEffect(() => {
    userAPI.list().then((users: any[]) =>
      setDoctors(users.filter((u: any) => u.role === 'Doctor'))
    ).catch(() => {});
  }, []);

  // ── Load slots when doctor + date change ─────────────────────────────────
  useEffect(() => {
    if (!selectedDoctorId || !filterDate) return;
    setLoadingSlots(true);
    getDoctorAvailability(selectedDoctorId, filterDate, filterDate)
      .then(data => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctorId, filterDate]);

  // ── Load appointments for selected doctor ─────────────────────────────────
  useEffect(() => {
    if (!selectedDoctorId) return;
    setLoadingAppts(true);
    getAppointmentReports({ doctorId: selectedDoctorId })
      .then(data => {
        const dateFiltered = filterDate
          ? data.filter(a => a.appointmentDate?.slice(0, 10) === filterDate)
          : data;
        setAppointments(dateFiltered);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoadingAppts(false));
  }, [selectedDoctorId, filterDate]);

  // ── Schedule helpers ─────────────────────────────────────────────────────
  const addScheduleRow = () =>
    setSchedules(prev => [
      ...prev,
      { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30, isWorkingDay: true },
    ]);

  const removeScheduleRow = (idx: number) =>
    setSchedules(prev => prev.filter((_, i) => i !== idx));

  const updateScheduleRow = (idx: number, key: keyof DoctorScheduleInput, val: any) =>
    setSchedules(prev =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: val } : row))
    );

  async function handleSaveSchedule() {
    if (!selectedDoctorId) {
      return Swal.fire('Select Doctor', 'Please select a doctor first.', 'warning');
    }
    setSavingSchedule(true);
    try {
      await setDoctorSchedule(selectedDoctorId, schedules);
      await Swal.fire({
        title: 'Schedule Saved',
        text: "Doctor's schedule has been updated successfully.",
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: unknown) {
      Swal.fire('Error', err instanceof Error ? err.message : 'Failed to save schedule', 'error');
    } finally {
      setSavingSchedule(false);
    }
  }

  // ── Table columns ────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'appointmentTime',
      title: 'Time',
      render: (val: string) => <span className="font-semibold text-gray-900">{val}</span>,
    },
    {
      key: 'patient',
      title: 'Patient',
      render: (_: any, a: Appointment) => (
        <span className="text-gray-800">
          {a.patientFirstName} {a.patientLastName}
        </span>
      ),
    },
    {
      key: 'appointmentType',
      title: 'Type',
      render: (val: string) => <span className="text-gray-600">{val}</span>,
    },
    {
      key: 'reason',
      title: 'Reason',
      render: (val: string) => (
        <span className="text-gray-600 max-w-[200px] truncate block" title={val}>{val}</span>
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
      key: 'id',
      title: '',
      render: (_: any, a: Appointment) => (
        <button
          type="button"
          onClick={() => navigate(`/appointments/${a.id}/status`)}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Update Status
        </button>
      ),
    },
  ];

  const doctorOptions = doctors.map(d => ({
    value: d.id,
    label: `Dr. ${d.firstName} ${d.lastName}`,
  }));

  const totalSlots     = slots.filter(s => s.time !== 'ALL_DAY').length;
  const bookedSlots    = slots.filter(s => s.status === 'booked').length;
  const availableSlots = slots.filter(s => s.status === 'available').length;

  return (
    <BaseLayout resourceName="Appointments">
      <div className="w-full min-h-[calc(100vh-6rem)] rounded-2xl bg-blue-50 p-4 sm:p-6 flex flex-col gap-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Calendar</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Doctor Schedule</h2>
            <p className="mt-0.5 text-sm text-gray-500">Manage working hours and review daily appointments.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/appointments/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Select Doctor"
              options={doctorOptions}
              value={selectedDoctorId}
              onChange={v => setSelectedDoctorId(String(v))}
              placeholder="Choose a doctor…"
            />
            <Input
              label="Date"
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
        </div>

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Slots',     value: totalSlots,     icon: CalendarDaysIcon, color: 'text-blue-600',  bg: 'bg-blue-50'  },
            { label: 'Booked',          value: bookedSlots,    icon: UserGroupIcon,    color: 'text-red-600',   bg: 'bg-red-50'   },
            { label: 'Available',       value: availableSlots, icon: ClockIcon,        color: 'text-green-600', bg: 'bg-green-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {loadingSlots ? '…' : value}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex gap-1 rounded-xl bg-white border border-gray-100 shadow-sm p-1 w-fit">
          {(['schedule', 'availability'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'schedule' ? 'Set Working Hours' : 'Slot Availability'}
            </button>
          ))}
        </div>

        {activeTab === 'schedule' && (
          /* ── Schedule Editor ───────────────────────────────────────────── */
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">Working Hours Configuration</h3>
                <p className="text-xs text-gray-500">Set weekly schedule for the selected doctor.</p>
              </div>
              <Button variant="outline" size="sm" onClick={addScheduleRow} className="gap-1.5">
                <PlusIcon className="h-4 w-4" /> Add Day
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Day of Week', 'Start Time', 'End Time', 'Slot Duration (min)', 'Working Day', ''].map(h => (
                      <th key={h} className="pb-2 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {schedules.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2 pr-3">
                        <Select
                          options={DAY_NAMES.map((d, i) => ({ value: i, label: d }))}
                          value={row.dayOfWeek}
                          onChange={v => updateScheduleRow(idx, 'dayOfWeek', Number(v))}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          type="time"
                          value={row.startTime}
                          onChange={e => updateScheduleRow(idx, 'startTime', e.target.value)}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          type="time"
                          value={row.endTime}
                          onChange={e => updateScheduleRow(idx, 'endTime', e.target.value)}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          type="number"
                          value={String(row.slotDurationMinutes ?? 30)}
                          min="5"
                          max="120"
                          onChange={e => updateScheduleRow(idx, 'slotDurationMinutes', Number(e.target.value))}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Select
                          options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
                          value={row.isWorkingDay ? 'true' : 'false'}
                          onChange={v => updateScheduleRow(idx, 'isWorkingDay', v === 'true')}
                        />
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeScheduleRow(idx)}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Remove"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                loading={savingSchedule}
                onClick={handleSaveSchedule}
              >
                Save Schedule
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          /* ── Slot Availability grid ─────────────────────────────────────── */
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div>
              <h3 className="font-bold text-gray-900">Slot Availability</h3>
              <p className="text-xs text-gray-500">Green = available, Red = booked, Gray = blocked.</p>
            </div>
            {!selectedDoctorId ? (
              <p className="text-sm text-slate-400">Select a doctor to view slot availability.</p>
            ) : loadingSlots ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-9 w-16 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-sm text-amber-600">No schedule configured for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots
                  .filter(s => s.time !== 'ALL_DAY')
                  .map(slot => (
                    <div
                      key={`${slot.date}_${slot.time}`}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        slot.status === 'available'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : slot.status === 'booked'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-gray-100 text-gray-400'
                      }`}
                    >
                      {slot.time}
                    </div>
                  ))}
                {slots.some(s => s.time === 'ALL_DAY' && s.status === 'blocked') && (
                  <p className="w-full text-sm font-medium text-red-600">
                    Doctor is on approved leave — entire day is blocked.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Appointments Table ──────────────────────────────────────────── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">
              Appointments on {filterDate || '—'}
            </h3>
          </div>
          <Table
            columns={columns}
            data={appointments}
            loading={loadingAppts}
            emptyMessage={
              selectedDoctorId
                ? 'No appointments found for this doctor on this date.'
                : 'Select a doctor to view appointments.'
            }
          />
        </div>

      </div>
    </BaseLayout>
  );
};