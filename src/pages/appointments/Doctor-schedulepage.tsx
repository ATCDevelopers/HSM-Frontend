import React, { useEffect, useState } from 'react';
import { CalendarDaysIcon, TrashIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';
import BaseLayout from '../../components/layouts/BaseLayout';
import { useAuth } from '../../auth/AuthContext';
import { can } from '../../config/ability';
import { getErrorMessage } from '../../services/apiResponse';
import { appointmentAPI, type Doctor, type DoctorLeave, type DoctorSchedule, type Slot, toDateKey } from '../../services/appointmentAPI';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DayRow {
  working: boolean;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

const DEFAULT_ROW: DayRow = { working: false, startTime: '08:00', endTime: '17:00', slotDurationMinutes: 30 };

const inputClass = 'rounded-lg border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400';

const toRows = (schedules: DoctorSchedule[]): DayRow[] =>
  DAYS.map((_, day) => {
    const s = schedules.find((entry) => entry.dayOfWeek === day && entry.isWorkingDay !== false);
    return s ? { working: true, startTime: s.startTime, endTime: s.endTime, slotDurationMinutes: s.slotDurationMinutes ?? 30 } : { ...DEFAULT_ROW };
  });

export const DoctorSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'Doctor';
  const canEdit = can('manage', 'Appointment', user?.role);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState(isDoctor ? user?.id ?? '' : '');
  const [rows, setRows] = useState<DayRow[]>(DAYS.map(() => ({ ...DEFAULT_ROW })));
  const [leaves, setLeaves] = useState<DoctorLeave[]>([]);
  const [newLeaves, setNewLeaves] = useState<DoctorLeave[]>([]);
  const [leaveDraft, setLeaveDraft] = useState<DoctorLeave>({ startDate: '', endDate: '', reason: '' });
  const [week, setWeek] = useState<Slot[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    appointmentAPI.doctors().then(setDoctors).catch((e: unknown) => setError(getErrorMessage(e, 'Failed to load doctors')));
  }, []);

  const loadDoctor = (id: string) => {
    if (!id) return;
    setError('');
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 6);
    Promise.all([appointmentAPI.getSchedule(id), appointmentAPI.availability(id, toDateKey(start), toDateKey(end))])
      .then(([schedule, slots]) => {
        setRows(toRows(schedule.schedules));
        setLeaves(schedule.leaves);
        setNewLeaves([]);
        setWeek(slots);
      })
      .catch((e: unknown) => setError(getErrorMessage(e, 'Failed to load schedule')));
  };

  useEffect(() => loadDoctor(doctorId), [doctorId]);

  const updateRow = (day: number, patch: Partial<DayRow>) =>
    setRows((prev) => prev.map((row, i) => (i === day ? { ...row, ...patch } : row)));

  const addLeave = () => {
    if (!leaveDraft.startDate || !leaveDraft.endDate || leaveDraft.startDate > leaveDraft.endDate) {
      setError('Leave needs a start date on or before its end date.');
      return;
    }
    setNewLeaves((prev) => [...prev, leaveDraft]);
    setLeaveDraft({ startDate: '', endDate: '', reason: '' });
    setError('');
  };

  const save = async () => {
    const invalid = rows.findIndex((r) => r.working && r.startTime >= r.endTime);
    if (invalid >= 0) {
      setError(`${DAYS[invalid]}: start time must be before end time.`);
      return;
    }
    // Saving replaces the whole week, so only working days are sent.
    const schedules: DoctorSchedule[] = rows.flatMap((r, day) =>
      r.working ? [{ dayOfWeek: day, startTime: r.startTime, endTime: r.endTime, slotDurationMinutes: Number(r.slotDurationMinutes), isWorkingDay: true }] : [],
    );
    setSaving(true);
    try {
      await appointmentAPI.saveSchedule(doctorId, schedules, newLeaves);
      await Swal.fire({ title: 'Schedule saved', icon: 'success', timer: 1400, showConfirmButton: false });
      loadDoctor(doctorId);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to save schedule'));
    } finally {
      setSaving(false);
    }
  };

  const days = Array.from(new Set(week.map((s) => s.date)));

  return (
    <BaseLayout resourceName="Doctor Schedule">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-blue-100 p-2 text-blue-700"><CalendarDaysIcon className="h-6 w-6" /></span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor schedule</h1>
              <p className="text-sm text-gray-500">Weekly working hours and leave determine which slots patients can book.</p>
            </div>
          </div>
          <select
            value={doctorId}
            disabled={isDoctor}
            onChange={(e) => setDoctorId(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none sm:w-72"
          >
            <option value="">Select doctor</option>
            {doctors.map((d) => <option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>)}
          </select>
        </div>

        {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {!doctorId ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">Select a doctor to view or edit their schedule.</p>
        ) : (
          <>
            <section className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr><th className="px-4 py-3">Day</th><th className="px-4 py-3">Working</th><th className="px-4 py-3">Start</th><th className="px-4 py-3">End</th><th className="px-4 py-3">Slot (min)</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, day) => (
                    <tr key={DAYS[day]}>
                      <td className="px-4 py-2.5 font-medium text-gray-900">{DAYS[day]}</td>
                      <td className="px-4 py-2.5"><input type="checkbox" checked={row.working} disabled={!canEdit} onChange={(e) => updateRow(day, { working: e.target.checked })} className="h-4 w-4 accent-blue-600" /></td>
                      <td className="px-4 py-2.5"><input type="time" className={inputClass} value={row.startTime} disabled={!canEdit || !row.working} onChange={(e) => updateRow(day, { startTime: e.target.value })} /></td>
                      <td className="px-4 py-2.5"><input type="time" className={inputClass} value={row.endTime} disabled={!canEdit || !row.working} onChange={(e) => updateRow(day, { endTime: e.target.value })} /></td>
                      <td className="px-4 py-2.5">
                        <select className={inputClass} value={row.slotDurationMinutes} disabled={!canEdit || !row.working} onChange={(e) => updateRow(day, { slotDurationMinutes: Number(e.target.value) })}>
                          {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-bold text-gray-900">Leave</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {leaves.length === 0 && newLeaves.length === 0 && <li className="text-gray-400">No upcoming leave.</li>}
                {leaves.map((l, i) => (
                  <li key={`saved-${i}`} className="rounded-lg bg-gray-50 px-3 py-2 text-gray-700">
                    {toDateKey(new Date(l.startDate))} → {toDateKey(new Date(l.endDate))} {l.reason && <span className="text-gray-400">· {l.reason}</span>}
                  </li>
                ))}
                {newLeaves.map((l, i) => (
                  <li key={`new-${i}`} className="flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-blue-800">
                    <span>{l.startDate} → {l.endDate} {l.reason && `· ${l.reason}`} <em className="text-xs">(not saved yet)</em></span>
                    <button type="button" onClick={() => setNewLeaves((prev) => prev.filter((_, j) => j !== i))} aria-label="Remove leave"><TrashIcon className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
              {canEdit && (
                <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_2fr_auto]">
                  <input type="date" className={inputClass} value={leaveDraft.startDate} onChange={(e) => setLeaveDraft({ ...leaveDraft, startDate: e.target.value })} />
                  <input type="date" className={inputClass} value={leaveDraft.endDate} onChange={(e) => setLeaveDraft({ ...leaveDraft, endDate: e.target.value })} />
                  <input className={inputClass} placeholder="Reason (optional)" value={leaveDraft.reason} onChange={(e) => setLeaveDraft({ ...leaveDraft, reason: e.target.value })} />
                  <button type="button" onClick={addLeave} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">Add leave</button>
                </div>
              )}
            </section>

            {canEdit && (
              <div className="flex justify-end">
                <button type="button" onClick={save} disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save schedule'}
                </button>
              </div>
            )}

            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-bold text-gray-900">Next 7 days</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {days.map((date) => {
                  const daySlots = week.filter((s) => s.date === date && s.time !== 'ALL_DAY');
                  const open = daySlots.filter((s) => s.status === 'available').length;
                  return (
                    <div key={date} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-900">{DAYS[new Date(`${date}T00:00:00`).getDay()]} {date.slice(5)}</p>
                      <p className="text-xs text-gray-500">{daySlots.length ? `${open} of ${daySlots.length} slots open` : 'Off / on leave'}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </BaseLayout>
  );
};
