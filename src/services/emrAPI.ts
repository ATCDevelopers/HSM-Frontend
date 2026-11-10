import API from "./api";
import { extractList, extractRecord } from "./apiResponse";
import type { LabTestResult, LabTest } from "./labTestConfigAPI";

export interface Consultation {
  id: string;
  doctorId: string;
  patientId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  medicalHistory: string | null;
  physicalExamination: string | null;
  preliminaryDiagnosis: string | null;
  investigationRequirements: string | null;
  createdAt: string;
  doctorName?: string;
}

export interface ConsultationPayload {
  doctorId: string;
  patientId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  medicalHistory?: string;
  physicalExamination?: string;
  preliminaryDiagnosis?: string;
  investigationRequirements?: string;
}

export interface Vitals {
  id: string;
  patientId: string;
  temperature: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  weight: number | null;
  height: number | null;
  createdAt: string;
}

export type VitalsPayload = Omit<Vitals, "id" | "createdAt">;

export type LabResultWithTemplate = LabTestResult & {
  id: string;
  template?: LabTest | null;
  technician?: { firstName: string; lastName: string; role?: string } | null;
  doctor?: { firstName: string; lastName: string } | null;
};

interface ConsultationAuditRow {
  consultation: Consultation;
  doctor?: { firstName: string; lastName: string } | null;
}

export const consultationAPI = {
  /** Uses the audit endpoint because it joins the attending doctor's name. */
  listByPatient: async (patientId: string): Promise<Consultation[]> => {
    const rows = extractList<ConsultationAuditRow>(await API.get(`consultation/patient/${patientId}/audit`));
    return rows.map(({ consultation, doctor }) => ({
      ...consultation,
      doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : undefined,
    }));
  },

  create: async (payload: ConsultationPayload) => extractRecord<Consultation>(await API.post("consultation", payload)),

  update: async (id: string, payload: Partial<ConsultationPayload>) =>
    extractRecord<Consultation>(await API.patch(`consultation/${id}`, payload)),

  remove: async (id: string) => {
    await API.delete(`consultation/${id}`);
  },
};

export const vitalsAPI = {
  listByPatient: async (patientId: string): Promise<Vitals[]> =>
    extractList<Vitals>(await API.get(`vitals/patient/${patientId}`)),

  create: async (payload: VitalsPayload) => extractRecord<Vitals>(await API.post("vitals", payload)),

  remove: async (id: string) => {
    await API.delete(`vitals/${id}`);
  },
};

export const labResultAPI = {
  listByPatient: async (patientId: string): Promise<LabResultWithTemplate[]> =>
    extractList<LabResultWithTemplate>(await API.get(`test-results/patient/${patientId}`)),

  remove: async (id: string) => {
    await API.delete(`test-results/${id}`);
  },
};
