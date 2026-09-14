import React from 'react';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout.tsx';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <BaseLayout resourceName="Appointments">
      <div className="w-full rounded-3xl bg-linear-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm ring-1 ring-blue-100">
        <div className="mx-auto w-full">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Overview</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Appointments Dashboard</h2>
              <p className="mt-1 text-sm text-gray-500">Track bookings, doctor availability, and patient activity in one place.</p>
            </div>
            <button
              onClick={() => navigate('/appointments/new')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <CalendarDaysIcon className="h-4 w-4" />
              New Booking
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            Appointment summary data will appear here when the dashboard API is connected.
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[] .map(({ title, value, tone, detail, route, icon: Icon }) => (
              <button
                key={title}
                type="button"
                onClick={() => navigate(route)}
                className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2 ${tone === 'blue' ? 'bg-blue-100 text-blue-700' : tone === 'indigo' ? 'bg-indigo-100 text-indigo-700' : tone === 'green' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
                </div>
                <p className="mt-5 text-sm text-gray-500">{title}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
                <p className="mt-2 text-xs text-gray-400">{detail}</p>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Today's schedule</h3>
                  <p className="text-sm text-gray-500">Upcoming consultations and check-ins</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/appointments/schedule')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {[].map((item) => (
                  <div key={item.time} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.patient}</p>
                      <p className="text-sm text-gray-500">{item.doctor}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">{item.time}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.status === 'Confirmed' ? 'bg-green-100 text-green-700' : item.status === 'Waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-slate-400">No appointment data available.</p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl shadow-slate-900/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Performance</p>
                  <h3 className="mt-2 text-xl font-bold">Patient flow</h3>
                </div>
                <div className="rounded-xl bg-white/10 p-2">
                  <UserGroupIcon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">Performance data will appear when appointment reporting is available.</p>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};