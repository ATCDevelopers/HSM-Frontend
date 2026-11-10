import API from "./api";
import { extractList, extractRecord } from "./apiResponse";

export interface Department {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  parentDepartmentId: string | null;
  /** Head of department, appointed by an admin. */
  headUserId?: string | null;
  createdAt?: string;
}

export type DepartmentPayload = Pick<Department, "name"> & Partial<Pick<Department, "code" | "location" | "parentDepartmentId">>;

export const departmentAPI = {
  list: async (): Promise<Department[]> => extractList<Department>(await API.get("department")),

  /** Readable by department managers and by the head of this department. */
  get: async (id: string): Promise<Department> => {
    const record = extractRecord<Department>(await API.get(`department/${id}`));
    if (!record) throw new Error("Department not found");
    return record;
  },

  /** Admin only: appoint a member as head, or pass null to clear the head. */
  setHead: async (id: string, userId: string | null) => extractRecord<Department>(await API.put(`department/${id}/head`, { userId })),

  create: async (payload: DepartmentPayload) => extractRecord<Department>(await API.post("department", payload)),

  update: async (id: string, payload: Partial<DepartmentPayload>) =>
    extractRecord<Department>(await API.put(`department/${id}`, payload)),

  remove: async (id: string) => {
    await API.delete(`department/${id}`);
  },
};

/** Default department for each staff role, by department code; staff can still be placed elsewhere. */
export const ROLE_DEPARTMENT_CODES: Record<string, string> = {
  Admin: "ADM",
  ClinicManager: "ADM",
  Receptionist: "ADM",
  Doctor: "MED",
  Nurse: "MED",
  LabTechnician: "LAB",
  Cashier: "ACC",
  Accountant: "ACC",
  Pharmacist: "PHA",
};

export const departmentForRole = (departments: Department[], role: string) =>
  departments.find((d) => d.code === ROLE_DEPARTMENT_CODES[role])?.id ?? "";

// ─── Department staff and availability ───────────────────────────────────────────────────────

export type Availability = "available" | "busy" | "on_leave" | "off_duty";

export const AVAILABILITY: { id: Availability; label: string; dot: string; badge: string }[] = [
  { id: "available", label: "Available", dot: "bg-green-500", badge: "bg-green-50 text-green-700 ring-green-200" },
  { id: "busy", label: "Busy", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800 ring-amber-200" },
  { id: "on_leave", label: "On leave", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 ring-blue-200" },
  { id: "off_duty", label: "Off duty", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600 ring-gray-200" },
];

export const availabilityInfo = (id?: string | null) => AVAILABILITY.find((a) => a.id === id) ?? AVAILABILITY[0];

export interface StaffMember {
  id: string;
  firstName: string;
  secondName: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  departmentId: string | null;
  departmentName?: string | null;
  availability: Availability;
  availabilityUpdatedAt: string | null;
  imagePath: string | null;
  /** Only on /me: departments this person heads. */
  headOf?: { id: string; name: string; code: string | null }[];
}

export const departmentStaffAPI = {
  /** Availability of someone in a given department; allowed for managers and that department's head. */
  setMemberAvailability: async (departmentId: string, userId: string, availability: Availability) =>
    extractRecord<StaffMember>(await API.patch(`department/${departmentId}/members/${userId}/availability`, { availability })),

  members: async (departmentId: string): Promise<StaffMember[]> => extractList<StaffMember>(await API.get(`department/${departmentId}/members`)),

  /** Every active staff member with their current department (null = unassigned). */
  allStaff: async (): Promise<StaffMember[]> => extractList<StaffMember>(await API.get("department/staff")),

  /** Adds someone to the department; if they were elsewhere this transfers them. */
  assign: async (departmentId: string, userId: string) => extractRecord(await API.put(`department/${departmentId}/members/${userId}`)),

  remove: async (departmentId: string, userId: string) => extractRecord(await API.delete(`department/${departmentId}/members/${userId}`)),

  setAvailability: async (userId: string, availability: Availability) =>
    extractRecord<StaffMember>(await API.patch(`department/staff/${userId}/availability`, { availability })),

  me: async (): Promise<StaffMember | null> => extractRecord<StaffMember>(await API.get("department/staff/me")),

  setMyAvailability: async (availability: Availability) =>
    extractRecord<StaffMember>(await API.patch("department/staff/me/availability", { availability })),
};
