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

export type PaymentMode = "NHIF" | "INSURANCE" | "CASH";

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  NHIF: "NHIF",
  INSURANCE: "Private insurance",
  CASH: "Cash",
};

export interface Patient {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  gender: string;
  nhifCard: string;
  nhifNumber?: string;
  paymentMode?: PaymentMode;
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
    /** NHIF or insurance card number; left empty for cash patients. */
    nhifCard: string;
    paymentMode: PaymentMode;
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
          paymentMode: payload.paymentMode || "NHIF",
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

// ─── Documents brought from other institutions ───────────────────────────────────────────────

export const DOCUMENT_TYPES: { id: string; label: string }[] = [
  { id: "referral_letter", label: "Referral letter" },
  { id: "lab_report", label: "Lab report" },
  { id: "imaging", label: "Imaging (X-ray, scan)" },
  { id: "discharge_summary", label: "Discharge summary" },
  { id: "prescription", label: "Prescription" },
  { id: "medical_report", label: "Medical report" },
  { id: "other", label: "Other" },
];

export const documentTypeLabel = (id?: string | null) => DOCUMENT_TYPES.find((t) => t.id === id)?.label ?? "Document";

export interface PatientDocument {
  id: string;
  patientId: string;
  documentName: string;
  mimeType: string;
  fileSize: string;
  sourceInstitution: string | null;
  documentType: string | null;
  documentDate: string | null;
  notes: string | null;
  createdAt: string;
  uploadedByFirstName: string | null;
  uploadedByLastName: string | null;
}

export interface DocumentUpload {
  file: File;
  sourceInstitution?: string;
  documentType?: string;
  documentDate?: string;
  notes?: string;
}

export const patientDocumentAPI = {
  list: async (patientId: string): Promise<PatientDocument[]> => {
    const response = await API.get<ApiResponse<PatientDocument[]>>(`patients/${patientId}/documents`);
    return response.data.data ?? [];
  },

  upload: async (patientId: string, upload: DocumentUpload): Promise<PatientDocument> => {
    const form = new FormData();
    form.append("document", upload.file);
    (["sourceInstitution", "documentType", "documentDate", "notes"] as const).forEach((key) => {
      if (upload[key]) form.append(key, upload[key] as string);
    });
    const response = await API.post<ApiResponse<PatientDocument>>(`patients/${patientId}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!response.data.data) throw new Error(response.data.message ?? "Upload failed");
    return response.data.data;
  },

  /** Files are only served through the authenticated API, so they're fetched as a blob for preview. */
  fileBlob: async (patientId: string, documentId: string): Promise<Blob> => {
    const response = await API.get(`patients/${patientId}/documents/${documentId}/file`, { responseType: "blob" });
    return response.data as Blob;
  },

  remove: async (patientId: string, documentId: string): Promise<void> => {
    await API.delete(`patients/${patientId}/documents/${documentId}`);
  },
};
