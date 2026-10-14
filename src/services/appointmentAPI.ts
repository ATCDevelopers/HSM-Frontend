import API from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentPriority = 'low' | 'medium' | 'high' | 'emergency';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string | null;
  appointmentType: string;
  priority: AppointmentPriority;
  status: AppointmentStatus;
  reason: string;
  appointmentDate: string;
  appointmentTime: string;
  createdAt?: string;
  updatedAt?: string;
  // joined fields (from reports endpoint)
  patientFirstName?: string;
  patientLastName?: string;
  patientEmail?: string;
  doctorFirstName?: string;
  doctorLastName?: string;
}

export interface ComputedSlot {
  date: string;
  time: string;
  status: 'available' | 'booked' | 'blocked';
}

export interface DoctorScheduleInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  isWorkingDay?: boolean;
}

export interface DoctorLeaveInput {
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface BookAppointmentPayload {
  patientId: string;
  doctorId?: string;
  appointmentType: string;
  priority?: AppointmentPriority;
  reason: string;
  appointmentDate: string;
  appointmentTime: string;
}

export interface ReschedulePayload {
  appointmentDate: string;
  appointmentTime: string;
  doctorId?: string;
}

export interface AppointmentReportFilters {
  doctorId?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/** GET /doctors/:doctorId/availability?startDate=&endDate= */
export const getDoctorAvailability = async (
  doctorId: string,
  startDate: string,
  endDate: string
): Promise<{ doctorId: string; startDate: string; endDate: string; slots: ComputedSlot[] }> => {
  const res = await API.get(`/doctors/${doctorId}/availability`, {
    params: { startDate, endDate },
  });
  return res.data.data;
};

/** POST /doctors/:doctorId/schedules */
export const setDoctorSchedule = async (
  doctorId: string,
  schedules: DoctorScheduleInput[],
  leaves?: DoctorLeaveInput[]
): Promise<any> => {
  const res = await API.post(`/doctors/${doctorId}/schedules`, { schedules, leaves });
  return res.data.data;
};

/** POST /appointments */
export const bookAppointment = async (payload: BookAppointmentPayload): Promise<Appointment> => {
  const res = await API.post('/appointments', payload);
  return res.data.data;
};

/** PUT /appointments/:id/reschedule */
export const rescheduleAppointment = async (
  appointmentId: string,
  payload: ReschedulePayload
): Promise<Appointment> => {
  const res = await API.put(`/appointments/${appointmentId}/reschedule`, payload);
  return res.data.data;
};

/** PATCH /appointments/:id/cancel */
export const cancelAppointment = async (
  appointmentId: string,
  reason: string
): Promise<Appointment> => {
  const res = await API.patch(`/appointments/${appointmentId}/cancel`, { reason });
  return res.data.data;
};

/** PATCH /appointments/:id/status */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  reason?: string
): Promise<Appointment> => {
  const res = await API.patch(`/appointments/${appointmentId}/status`, { status, reason });
  return res.data.data;
};

/** GET /appointments/reports */
export const getAppointmentReports = async (
  filters: AppointmentReportFilters = {}
): Promise<Appointment[]> => {
  const res = await API.get('/appointments/reports', { params: filters });
  return res.data.data;
};

/** POST /appointments/send-reminders */
export const sendReminders = async (): Promise<any> => {
  const res = await API.post('/appointments/send-reminders');
  return res.data.data;
};
