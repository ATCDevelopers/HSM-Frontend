import axios from 'axios';

const BASE_URL = process.env.VITE_BACKEND_BASE_URL as string;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
}

export type UserRole =
  | 'Admin'
  | 'Doctor'
  | 'Nurse'
  | 'Receptionist'
  | 'Pharmacist'
  | 'LabTechnician'
  | 'Cashier'
  | 'ClinicManager'
  | 'Accountant';

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}


export function getRoleDashboard(role: UserRole | string): string {
  const map: Record<string, string> = {
    Admin: '/users/admin-portal',
    Doctor: '/users/dashboard',
    Nurse: '/users/nurse-portal',
    Receptionist: '/users/reception-portal',
    Pharmacist: '/users/pharmacy-portal',
    LabTechnician: '/users/lab-portal',
    Cashier: '/dashboard',
    ClinicManager: '/users/clinic-manager-portal',
    Accountant: '/users/accountant-portal',
  };
  return map[role] ?? '/dashboard';
}


export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const response = await axios.post<{ message: string; data: LoginResponse }>(
    `${BASE_URL}/auth/login`,
    payload,
    { withCredentials: true }
  );
  return response.data.data;
}

export async function logoutRequest(accessToken: string): Promise<void> {
  await axios.post(
    `${BASE_URL}/auth/logout`,
    {},
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    }
  );
}
