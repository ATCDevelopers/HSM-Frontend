import API from "./api";

export interface Address {
  id?: string;
  region: string;
  district?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface Patient {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender: string;
  nhifCard: string;
  nhifNumber?: string;
  email: string;
  dateOfBirth: string;
  bloodGroup: string;
  phoneNumber: string;
  phone?: string;
  photoUrl?: string | null;
  photo?: string | null;
  nationalId?: string | null;
  address?: Address | null;
  status?: "ACTIVE" | "DEACTIVE";
}

export interface RegisterPatientPayload {
  patient: {
    firstName: string;
    lastName: string;
    middleName?: string;
    gender: string;
    nhifCard: string;
    email: string;
    dateOfBirth: string;
    bloodGroup: string;
    phoneNumber: string;
    photoUrl?: string;
    nationalId?: string;
  };
  address: {
    region: string;
    district?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
  };
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

function normalizePatient(p: any): Patient {
  if (!p) return p;
  const phoneNumber = p.phoneNumber || p.phone || "";
  const nhifCard = p.nhifCard || p.nhifNumber || "";
  const photoUrl = p.photoUrl || p.photo || null;
  return {
    ...p,
    phoneNumber,
    phone: phoneNumber,
    nhifCard,
    nhifNumber: nhifCard,
    photoUrl,
    photo: photoUrl,
    status: p.status || "ACTIVE",
  };
}

export const patientAPI = {
  list: async (): Promise<Patient[]> => {
    const response = await API.get<ApiResponse<Patient[]>>("patients");
    const rawList = response.data.data ?? [];
    return rawList.map(normalizePatient);
  },

  get: async (id: string): Promise<Patient> => {
    const response = await API.get<ApiResponse<Patient>>(`patient/${id}`);
    if (!response.data.data) throw new Error(response.data.message ?? "Patient not found");
    return normalizePatient(response.data.data);
  },

  create: async (payload: RegisterPatientPayload | any): Promise<Patient> => {
    // If payload is already structured with patient & address
    let body = payload;
    if (!payload.patient) {
      body = {
        patient: {
          firstName: payload.firstName,
          middleName: payload.middleName || undefined,
          lastName: payload.lastName,
          gender: payload.gender,
          nhifCard: payload.nhifCard || payload.nhifNumber || "",
          email: payload.email,
          dateOfBirth: payload.dateOfBirth,
          bloodGroup: payload.bloodGroup,
          phoneNumber: payload.phoneNumber || payload.phone || "",
          photoUrl: payload.photoUrl || payload.photo || undefined,
          nationalId: payload.nationalId || undefined,
        },
        address: {
          region: payload.region || "N/A",
          district: payload.district || undefined,
          city: payload.city || "N/A",
          state: payload.state || payload.region || "N/A",
          postalCode: payload.postalCode || undefined,
          country: payload.country || "Tanzania",
        },
      };
    }
    const response = await API.post<ApiResponse<Patient>>("patient", body);
    if (!response.data.data) throw new Error(response.data.message ?? "Patient registration failed");
    return normalizePatient(response.data.data);
  },

  update: async (id: string, payload: Partial<Patient> & { address?: Address }): Promise<Patient> => {
    const patientData: Record<string, any> = { ...payload };
    delete patientData.address;
    delete patientData.id;
    if (patientData.phone) {
      patientData.phoneNumber = patientData.phone;
    }
    if (patientData.nhifNumber) {
      patientData.nhifCard = patientData.nhifNumber;
    }

    const response = await API.put<ApiResponse<Patient>>(`patient/${id}`, {
      patientData,
      addressData: payload.address || {},
    });
    if (!response.data.data) throw new Error(response.data.message ?? "Patient update failed");
    return normalizePatient(response.data.data);
  },

  remove: async (id: string): Promise<void> => {
    await API.delete(`patients/${id}`);
  },
};
