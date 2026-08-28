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

export const patientsStorageKey = "hms_patients";

export function readPatients(): Patient[] {
  const savedPatients = localStorage.getItem(patientsStorageKey);

  if (!savedPatients) return [];

  try {
    const patients = JSON.parse(savedPatients);
    return Array.isArray(patients) ? patients : [];
  } catch {
    return [];
  }
}

export function writePatients(patients: Patient[]) {
  localStorage.setItem(patientsStorageKey, JSON.stringify(patients));
}
