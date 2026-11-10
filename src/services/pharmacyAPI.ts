import API from "./api";
import { extractList, extractRecord } from "./apiResponse";

export interface Medicine {
  id: string;
  statusId: string;
  code: string;
  genericName: string;
  drugName: string;
  dosageForm: string;
  strength: string;
  price: string;
  stock: number;
  createdAt?: string;
}

export type MedicinePayload = Omit<Medicine, "id" | "createdAt">;

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  notes: string | null;
  statusId: string;
  createdAt: string;
  doctorName?: string;
  statusName?: string;
  patientName?: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId: string;
  dosage: string;
  frequency: string;
  durationOfTime: string;
  quantity: number;
  instruction: string | null;
}

export type PrescriptionItemPayload = Omit<PrescriptionItem, "id">;

interface PrescriptionHistoryRow {
  prescription: Prescription;
  doctor?: { firstName: string; lastName: string } | null;
  status?: { name: string } | null;
  patient?: { firstName: string; lastName: string } | null;
}

export const medicineAPI = {
  list: async (): Promise<Medicine[]> => extractList<Medicine>(await API.get("medicine")),

  search: async (q: string): Promise<Medicine[]> =>
    extractList<Medicine>(await API.get("medicine/search", { params: { q } })),

  get: async (id: string): Promise<Medicine> => {
    const record = extractRecord<Medicine>(await API.get(`medicine/${id}`));
    if (!record) throw new Error("Medicine not found");
    return record;
  },

  create: async (payload: MedicinePayload) => extractRecord<Medicine>(await API.post("medicine", payload)),

  update: async (id: string, payload: Partial<MedicinePayload>) =>
    extractRecord<Medicine>(await API.put(`medicine/${id}`, payload)),

  remove: async (id: string) => {
    await API.delete(`medicine/${id}`);
  },
};

/** One medicine deducted by a dispense, with the stock left afterwards. */
export interface DispensedLine {
  medicineId: string;
  medicine: string;
  quantity: number;
  remainingStock: number;
}

const toPrescription = ({ prescription, doctor, status, patient }: PrescriptionHistoryRow): Prescription => ({
  ...prescription,
  doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : undefined,
  statusName: status?.name,
  patientName: patient ? `${patient.firstName} ${patient.lastName}` : undefined,
});

export const prescriptionAPI = {
  /** Pharmacy queue; pass "pending" for prescriptions waiting to be dispensed. */
  list: async (status?: string): Promise<Prescription[]> =>
    extractList<PrescriptionHistoryRow>(await API.get("prescriptions", { params: { status: status || undefined } })).map(toPrescription),

  /** Deducts stock for every item and marks the prescription dispensed, in one backend transaction. */
  dispense: async (id: string) =>
    extractRecord<{ prescription: Prescription; dispensed: DispensedLine[] }>(await API.post(`prescriptions/${id}/dispense`)),

  listByPatient: async (patientId: string): Promise<Prescription[]> => {
    const rows = extractList<PrescriptionHistoryRow>(await API.get(`prescriptions/patient/${patientId}`));
    return rows.map(({ prescription, doctor, status }) => ({
      ...prescription,
      doctorName: doctor ? `${doctor.firstName} ${doctor.lastName}` : undefined,
      statusName: status?.name,
    }));
  },

  /** Search by patient name (min. 2 characters); results carry the patient's name. */
  searchByPatientName: async (name: string): Promise<Prescription[]> => {
    return extractList<PrescriptionHistoryRow>(await API.get("prescriptions/search", { params: { name } })).map(toPrescription);
  },

  create: async (payload: { patientId: string; doctorId: string; statusId: string; notes?: string }) =>
    extractRecord<Prescription>(await API.post("prescriptions", payload)),

  update: async (id: string, payload: Partial<{ statusId: string; notes: string }>) =>
    extractRecord<Prescription>(await API.patch(`prescriptions/${id}`, payload)),

  remove: async (id: string) => {
    await API.delete(`prescriptions/${id}`);
  },
};

export const prescriptionItemAPI = {
  listByPrescription: async (prescriptionId: string): Promise<PrescriptionItem[]> =>
    extractList<PrescriptionItem>(await API.get(`prescription-items/prescription/${prescriptionId}`)),

  create: async (payload: PrescriptionItemPayload) =>
    extractRecord<PrescriptionItem>(await API.post("prescription-items", payload)),

  remove: async (id: string) => {
    await API.delete(`prescription-items/${id}`);
  },
};
