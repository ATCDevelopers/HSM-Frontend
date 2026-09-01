import React from 'react';
import { ArrowRightIcon, CalendarDaysIcon, ClockIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';

export const AppointmentStatusPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <BaseLayout resourceName="Appointments">
      <div className="rounded-3xl bg-linear-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-sm ring-1 ring-indigo-100">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">Status</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">Appointment Status</h2>
              <p className="mt-1 text-sm text-gray-500">Real-time tracking for appointment ID: {id || 'APT-8849'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate('/appointments/history')}
                className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-300"
              >
                View History
              </button>
              <button
                type="button"
                onClick={() => navigate('/appointments')}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Dashboard
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-xl shadow-indigo-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-indigo-100">Current state</p>
                  <p className="mt-3 text-3xl font-bold">In Progress</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30 bg-white/10 text-lg font-bold">
                  72%
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-cyan-200" />
                    <span className="text-sm text-indigo-100">Estimated wait</span>
                  </div>
                  <span className="font-semibold">~15 mins</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/10 p-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheckIcon className="h-5 w-5 text-cyan-200" />
                    <span className="text-sm text-indigo-100">Check-in status</span>
                  </div>
                  <span className="font-semibold">Verified</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">Appointment details</h3>
              <div className="mt-5 space-y-4">
                {[
                  ['Appointment ID', '#APT-8849'],
                  ['Doctor', 'Dr. Sarah Smith'],
                  ['Scheduled time', '11:30 AM'],
                  ['Department', 'General Medicine'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Visit progress</h3>
                <p className="text-sm text-slate-500">Current stage in the appointment flow</p>
              </div>
              <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                Follow up <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ['Check-in complete', '10:20 AM', 'done'],
                ['Doctor consultation', '11:00 AM', 'active'],
                ['Prescription ready', '11:35 AM', 'upcoming'],
              ].map(([title, time, state], index) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3.5 w-3.5 rounded-full ${state === 'done' ? 'bg-emerald-500' : state === 'active' ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    {index < 2 && <div className="mt-2 h-8 w-px bg-slate-200" />}
                  </div>
                  <div className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500">{time}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${state === 'done' ? 'bg-emerald-100 text-emerald-700' : state === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {state === 'done' ? 'Done' : state === 'active' ? 'Now' : 'Next'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};