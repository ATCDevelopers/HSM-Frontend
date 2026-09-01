import React, { useState } from 'react';
import { CalendarDaysIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';

interface Appointment {
  id: string;
  time: string;
  patient: string;
  reason: string;
  status: 'Confirmed' | 'Pending' | 'In Progress';
}

export const DoctorSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');

  const appointments: Appointment[] = [
    { id: 'A-001', time: '09:00 AM', patient: 'Jane Doe', reason: 'Routine Checkup', status: 'Confirmed' },
    { id: 'A-002', time: '10:30 AM', patient: 'John Smith', reason: 'Follow-up Visit', status: 'Pending' },
    { id: 'A-003', time: '02:00 PM', patient: 'Maria Garcia', reason: 'Consultation', status: 'In Progress' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <BaseLayout resourceName="Appointments">
      <div className="rounded-3xl bg-gradient-to-br from-slate-100 via-white to-blue-50 p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Calendar</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Doctor Schedule</h2>
              <p className="mt-1 text-sm text-gray-500">Review doctor availability and patient appointments for the selected day.</p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Appointments</span>
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Available slots</span>
                <ClockIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">08</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Patients today</span>
                <UserGroupIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">06</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Scheduled appointments</h3>
                <p className="text-sm text-gray-500">Select a date to filter the consultation list.</p>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  {['Time', 'Patient', 'Reason', 'Status'].map((heading) => (
                    <th key={heading} className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-gray-900">{item.time}</td>
                    <td className="px-5 py-4 text-gray-700">{item.patient}</td>
                    <td className="px-5 py-4 text-gray-700">{item.reason}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/appointments/${item.id}/status`)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition hover:opacity-90 ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-400">Showing {appointments.length} appointments for today</p>
        </div>
      </div>
    </BaseLayout>
  );
};