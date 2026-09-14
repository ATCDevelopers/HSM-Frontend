import API from "./api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  photo?: string;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export const userAPI = {
  list: async (): Promise<User[]> => {
    const response = await API.get<ApiResponse<User[]>>("users");
    return response.data.data ?? [];
  },
  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const response = await API.put<ApiResponse<User>>(`users/${id}`, payload);
    if (!response.data.data) throw new Error(response.data.message ?? "User update failed");
    return response.data.data;
  },
  remove: async (id: string): Promise<void> => {
    await API.delete(`users/${id}`);
  },
};
