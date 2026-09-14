export interface AuditFields {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by: string;
  updated_by: string;
  deleted_by: string | null;
}

export interface Vitals extends AuditFields {
  patient_id: string;
  temperature: number;
  bp_systolic: number;
  bp_diastolic: number;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  weight: number;
  height: number;
}

export type VitalsFormInput = Omit<Vitals, keyof AuditFields>;

export interface Consultation extends AuditFields {
  doctor_id: string;
  patient_id: string;
  chief_complaint: string;
  history_of_present_illness: string;
  medical_history: string;
  physical_examination: string;
  preliminary_diagnosis: string;
  investigation_requirement: string;
}

export type ConsultationFormInput = Omit<Consultation, keyof AuditFields>;

// --- New: list + tabbed record types ---

export interface PatientListRow {
  patient_id: string;
  patient_name: string;
  visit_id: string;
  diagnosis: string;
  bp: string;
  lab_test_count: number;
  prescription_count: number;
  status: string;
}

export interface PatientHeader {
  patient_id: string;
  name: string;
  gender: string;
  age: number;
  phone: string;
}

export interface ConsultationRow {
  consultation_id: string;
  date: string;
  doctor_name: string;
  chief_complaint: string;
  diagnosis: string;
  history_of_present_illness: string;
  physical_examination: string;
  investigation_requirement: string;
  visit_id: string;
}

export interface VitalsRow {
  date: string;
  bp: string;
  temp: string;
  hr: string;
  rr: string;
  spo2: string;
  weight: string;
}

export interface LabTestRow {
  date: string;
  test: string;
  status: "Completed" | "Pending";
  result: string;
}

export interface PrescriptionRow {
  date: string;
  medication: string;
  dose: string;
  frequency: string;
  status: "Active" | "Completed";
}

export interface DiagnosisRow {
  date: string;
  diagnosis: string;
  icd10: string;
  status: "Active" | "Resolved";
}
