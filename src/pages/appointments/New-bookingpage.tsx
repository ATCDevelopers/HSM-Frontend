import React, { useState } from 'react';
import { CalendarDaysIcon, ClockIcon, StarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import BaseLayout from '../../components/layouts/BaseLayout';

export const NewBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: '',
    doctorId: 'Dr. Sarah Smith',
    date: '',
    timeSlot: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting Booking:', formData);
  };

  const quickSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM'];

  return (
    <BaseLayout resourceName="Appointments">
      <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-sm ring-1 ring-sky-100">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Booking</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">New Appointment Booking</h2>
              <p className="mt-1 text-sm text-gray-500">Schedule a visit with your preferred healthcare professional.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/appointments')}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.35fr]">
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-blue-600/20">
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                Fast care
              </div>
              <h3 className="mt-5 text-2xl font-bold">Consultation made easy</h3>
              <p className="mt-2 text-sm text-blue-100">Book in minutes and receive a quick confirmation from the clinic team.</p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="h-8 w-8 text-cyan-200" />
                    <div>
                      <p className="text-sm text-blue-100">Available doctor</p>
                      <p className="font-semibold">Dr. Sarah Smith</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-8 w-8 text-cyan-200" />
                    <div>
                      <p className="text-sm text-blue-100">Average wait</p>
                      <p className="font-semibold">15 - 20 minutes</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <StarIcon className="h-8 w-8 text-cyan-200" />
                    <div>
                      <p className="text-sm text-blue-100">Patient rating</p>
                      <p className="font-semibold">4.9 / 5 care score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Patient name</label>
                  <input
                    type="text"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.75 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Enter patient name"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Doctor</label>
                    <select
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.75 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    >
                      <option>Dr. Sarah Smith</option>
                      <option>Dr. Daniel Lee</option>
                      <option>Dr. Emily Brown</option>
                      <option>Dr. James Wilson</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Date</label>
                    <input
                      type="date"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.75 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Time slot</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({ ...formData, timeSlot: slot })}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${formData.timeSlot === slot ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Reason for visit</label>
                  <textarea
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white py-2.75 px-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Describe the reason for the appointment"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/appointments')}
                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};