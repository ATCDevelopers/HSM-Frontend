export type Actions =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'request'
  | 'prescribe'
  | 'write'
  | 'process';

export type SubjectNames =
  | 'User'
  | 'Patient'
  | 'Department'
  | 'Appointment'
  | 'Vitals'
  | 'Consultation'
  | 'Medicine'
  | 'Diagnosis'
  | 'Lab_test'
  | 'Prescription'
  | 'Prescription-Items'
  | 'Laboratory'
  | 'Pharmacy'
  | 'Billing'
  | 'Insurance'
  | 'Inventory'
  | 'Report';

export type Subjects = 'all' | SubjectNames;

export interface UserAbility {
  can: (action: Actions, subject: Subjects) => boolean;
}

const ROLE_ALIASES: Record<string, string> = {
  MGR: 'ClinicManager',
  DOC: 'Doctor',
  NURSE: 'Nurse',
  RECEP: 'Receptionist',
  PHARM: 'Pharmacist',
  LAB_TECH: 'LabTechnician',
  CASHIER: 'Cashier',
  ACCT: 'Accountant',
};

// reusable action permission bundles
const READ_ONLY: Actions[] = ['read'];
const READ_WRITE: Actions[] = ['read', 'write', 'create', 'update'];

const PERMISSION_MATRIX: Record<string, Partial<Record<Subjects, Actions[] | true>>> = {
  ClinicManager: {
    User: READ_ONLY,
    Department: true,
    Patient: READ_ONLY,
    Appointment: true,
    Consultation: READ_ONLY,
    Diagnosis: READ_ONLY,
    Lab_test: READ_ONLY,
    Prescription: READ_ONLY,
    'Prescription-Items': READ_ONLY,
    Medicine: READ_ONLY,
    Laboratory: READ_ONLY,
    Pharmacy: READ_ONLY,
    Billing: READ_ONLY,
    Insurance: true,
    Inventory: true,
    Report: true,
  },
  Doctor: {
    Patient: true,
    Appointment: true,
    Consultation: READ_WRITE,
    Prescription: READ_WRITE,
    'Prescription-Items': READ_WRITE,
    Diagnosis: READ_ONLY,
    Lab_test: READ_ONLY,
    Laboratory: ['read', 'request'],
    Pharmacy: ['read', 'prescribe'],
    Report: READ_ONLY,
  },
  Nurse: {
    Patient: ['read', 'update'],
    Appointment: READ_ONLY,
    Prescription: READ_ONLY,
    'Prescription-Items': READ_ONLY,
    Vitals: READ_WRITE,
    Report: READ_ONLY,
  },
  Receptionist: {
    Patient: true,
    Appointment: true,
    Billing: READ_ONLY,
    Report: READ_ONLY,
  },
  Pharmacist: {
    Patient: READ_ONLY,
    Pharmacy: true,
    Inventory: true,
    Report: READ_ONLY,
  },
  LabTechnician: {
    Patient: READ_ONLY,
    Diagnosis: true,
    Lab_test: true,
    Laboratory: true,
    Inventory: READ_ONLY,
    Report: READ_ONLY,
  },
  Cashier: {
    Patient: READ_ONLY,
    Billing: true,
    Insurance: true,
    Report: READ_ONLY,
  },
  Accountant: {
    Billing: true,
    Insurance: true,
    Inventory: true,
    Report: READ_ONLY,
  },
  Patient: {
    Patient: READ_ONLY,
    Prescription: READ_ONLY,
    'Prescription-Items': READ_ONLY,
    Medicine: READ_ONLY,
    Laboratory: READ_ONLY,
    Billing: READ_ONLY,
    Appointment: true,
  },
};


export function can(action: Actions, subject: Subjects, userRole?: string | null): boolean {
  if (!userRole) return false;

  const rawRole = userRole.trim();

  if (rawRole === 'Admin' || rawRole === 'SYS_ADMIN' ) {
    return true;
  }

  const normalizedRole = ROLE_ALIASES[rawRole] || rawRole;
  const roleRules = PERMISSION_MATRIX[normalizedRole];

  if (!roleRules) return false;

  const subjectRules = roleRules[subject];
  if (!subjectRules) return false;

  if (subjectRules === true) return true;

  return subjectRules.includes(action) || subjectRules.includes('manage');
}

export function defineAbilityFor(userRole?: string | null): UserAbility {
  return {
    can: (action: Actions, subject: Subjects) => can(action, subject, userRole),
  };
}
