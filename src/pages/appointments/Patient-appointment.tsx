import React, { useState } from 'react';
import { ArrowRightIcon, CalendarDaysIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';

export const PatientHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const appointments = [
    { id: 1, doctor: 'Dr. Sarah Smith', type: 'General Consultation', date: 'March 12, 2026', time: '10:30 AM', status: 'Completed' },
    { id: 2, doctor: 'Dr. James Wilson', type: 'Follow-up', date: 'March 5, 2026', time: '2:00 PM', status: 'Completed' },
    { id: 3, doctor: 'Dr. Emily Brown', type: 'Checkup', date: 'February 28, 2026', time: '11:15 AM', status: 'Completed' },
  ];

  const filteredAppointments = appointments.filter((appointment) => {
    const query = searchTerm.toLowerCase();
    return appointment.doctor.toLowerCase().includes(query) || appointment.type.toLowerCase().includes(query);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <BaseLayout resourceName="Appointments">
      <div className="rounded-3xl bg-linear-to-br from-indigo-50 via-white to-sky-50 p-6 shadow-sm ring-1 ring-indigo-100">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">History</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Appointment History</h2>
              <p className="mt-1 text-sm text-gray-500">Browse your medical visits and consultation records.</p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Total visits</span>
                <CalendarDaysIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Completed</span>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">All</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Next review</span>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">Soon</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">Apr 08</p>
            </div>
          </div>

          <div className="relative mt-6">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor name or appointment type"
              aria-label="Search appointments"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div className="mt-6 space-y-3">
            {filteredAppointments.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => navigate(`/appointments/${appointment.id}/status`)}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{appointment.doctor} — {appointment.type}</p>
                  <p className="mt-1 text-sm text-gray-500">{appointment.date} • {appointment.time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-400">Showing {filteredAppointments.length} appointments</p>
        </div>
      </div>
    </BaseLayout>
  );
};