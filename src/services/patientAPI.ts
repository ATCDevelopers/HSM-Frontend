import API from "./api";

export interface Patient {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "DEACTIVE";
  bloodGroup: string;
  nhifNumber: string;
  nationalId: string;
  photo?: string;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export const patientAPI = {
  list: async (): Promise<Patient[]> => {
    const response = await API.get<ApiResponse<Patient[]>>("patients");
    return response.data.data ?? [];
  },
  get: async (id: string): Promise<Patient> => {
    const response = await API.get<ApiResponse<Patient>>(`patient/${id}`);
    if (!response.data.data) throw new Error(response.data.message ?? "Patient not found");
    return response.data.data;
  },
  create: async (payload: Omit<Patient, "id" | "status">): Promise<Patient> => {
    const response = await API.post<ApiResponse<Patient>>("patient", payload);
    if (!response.data.data) throw new Error(response.data.message ?? "Patient registration failed");
    return response.data.data;
  },
  update: async (id: string, payload: Partial<Patient>): Promise<Patient> => {
    const response = await API.put<ApiResponse<Patient>>(`patient/${id}`, {
      patientData: payload,
    });
    if (!response.data.data) throw new Error(response.data.message ?? "Patient update failed");
    return response.data.data;
  },
  remove: async (id: string): Promise<void> => {
    await API.delete(`patients/${id}`);
  },
};
