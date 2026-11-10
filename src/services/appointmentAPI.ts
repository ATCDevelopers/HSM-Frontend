import API from "./api";
import { extractList, extractRecord } from "./apiResponse";

export type AppointmentStatus = "scheduled" | "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show";
export type AppointmentPriority = "low" | "medium" | "high" | "emergency";

export interface Appointment {
  id: string;
  patientId: string;
  patientFirstName: string | null;
  patientLastName: string | null;
  patientEmail?: string | null;
  doctorId: string | null;
  doctorFirstName: string | null;
  doctorLastName: string | null;
  appointmentType: string;
  priority: AppointmentPriority;
  status: AppointmentStatus;
  reason: string;
  appointmentDate: string;
  appointmentTime: string;
  createdAt?: string;
}

export interface AppointmentFilters {
  doctorId?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
  status?: AppointmentStatus;
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

export interface Slot {
  date: string;
  time: string;
  status: "available" | "booked" | "blocked";
}

export interface DoctorSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes?: number;
  isWorkingDay?: boolean;
}

export interface DoctorLeave {
  startDate: string;
  endDate: string;
  reason?: string;
}

/** Forward moves the backend allows from each status (mirrors APPOINTMENT_STATUS_TRANSITIONS). */
export const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ["confirmed", "checked_in", "cancelled", "no_show"],
  confirmed: ["checked_in", "cancelled", "no_show"],
  checked_in: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  checked_in: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  no_show: "bg-gray-200 text-gray-700",
};

export const patientName = (a: Pick<Appointment, "patientFirstName" | "patientLastName">) =>
  [a.patientFirstName, a.patientLastName].filter(Boolean).join(" ") || "Unknown patient";

export const doctorName = (a: Pick<Appointment, "doctorFirstName" | "doctorLastName">) =>
  [a.doctorFirstName, a.doctorLastName].filter(Boolean).join(" ") || "Unassigned";

/** YYYY-MM-DD in local time, the format every appointment endpoint accepts. */
export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  departmentId?: string | null;
  availability?: string;
}

/** "Dr. Jane Doe" plus a hint when the doctor isn't available right now. */
export const doctorLabel = (d: Doctor) => {
  const hint = { busy: "busy", on_leave: "on leave", off_duty: "off duty" }[d.availability ?? ""];
  return `Dr. ${d.firstName} ${d.lastName}${hint ? ` (${hint})` : ""}`;
};

export const appointmentAPI = {
  doctors: async (): Promise<Doctor[]> => extractList<Doctor>(await API.get("doctors")),

  /** Backed by /appointments/reports, which is the only appointment listing endpoint. */
  list: async (filters: AppointmentFilters = {}): Promise<Appointment[]> => {
    const response = await API.get("appointments/reports", { params: filters });
    return extractList<Appointment>(response).sort((a, b) =>
      `${a.appointmentDate}${a.appointmentTime}`.localeCompare(`${b.appointmentDate}${b.appointmentTime}`),
    );
  },

  get: async (id: string): Promise<Appointment> => {
    const record = extractRecord<Appointment>(await API.get(`appointments/${id}`));
    if (!record) throw new Error("Appointment not found");
    return record;
  },

  book: async (payload: BookAppointmentPayload) =>
    extractRecord<Appointment>(await API.post("appointments", payload)),

  reschedule: async (id: string, payload: { appointmentDate: string; appointmentTime: string; doctorId?: string }) =>
    extractRecord<Appointment>(await API.put(`appointments/${id}/reschedule`, payload)),

  cancel: async (id: string, reason: string) =>
    extractRecord<Appointment>(await API.patch(`appointments/${id}/cancel`, { reason })),

  updateStatus: async (id: string, status: AppointmentStatus, reason?: string) =>
    extractRecord<Appointment>(await API.patch(`appointments/${id}/status`, { status, reason })),

  sendReminders: async () => extractList(await API.post("appointments/send-reminders")),

  availability: async (doctorId: string, startDate: string, endDate: string): Promise<Slot[]> => {
    const response = await API.get(`doctors/${doctorId}/availability`, { params: { startDate, endDate } });
    return extractRecord<{ slots: Slot[] }>(response)?.slots ?? [];
  },

  getSchedule: async (doctorId: string) =>
    extractRecord<{ schedules: DoctorSchedule[]; leaves: DoctorLeave[] }>(await API.get(`doctors/${doctorId}/schedules`)) ?? {
      schedules: [],
      leaves: [],
    },

  saveSchedule: async (doctorId: string, schedules: DoctorSchedule[], leaves: DoctorLeave[] = []) =>
    extractRecord(await API.post(`doctors/${doctorId}/schedules`, { schedules, leaves })),
};
