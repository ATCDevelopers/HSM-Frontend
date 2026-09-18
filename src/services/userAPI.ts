import API from "./api";

export interface User {
  id: string;
  firstName: string;
  secondName?: string | null;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  status?: "ACTIVE" | "INACTIVE" | string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  imagePath?: string | null;
  photo?: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export const userAPI = {
  list: async (): Promise<User[]> => {
    const response = await API.get<ApiResponse<User[]> | User[]>("users");
    const data = (response.data as any)?.data ?? response.data;
    return Array.isArray(data) ? data : [];
  },
  get: async (id: string): Promise<User> => {
    const response = await API.get<ApiResponse<User> | User>(`users/${id}`);
    const data = (response.data as any)?.data ?? response.data;
    if (!data) throw new Error((response.data as any)?.message ?? "User not found");
    return data as User;
  },
  getById: async (id: string): Promise<User> => {
    const response = await API.get<ApiResponse<User> | User>(`users/${id}`);
    const data = (response.data as any)?.data ?? response.data;
    if (!data) throw new Error((response.data as any)?.message ?? "User not found");
    return data as User;
  },
  update: async (id: string, payload: Partial<User>): Promise<User> => {
    const response = await API.put<ApiResponse<User> | User>(`users/${id}`, payload);
    const data = (response.data as any)?.data ?? response.data;
    return (data as User) ?? ({ id, ...payload } as User);
  },
  remove: async (id: string): Promise<void> => {
    await API.delete(`users/${id}`);
  },
};
