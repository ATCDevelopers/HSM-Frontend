/**
 * Hospital Management System - Frontend Modules Configuration
 *
 * This file defines all available modules for the sidebar navigation.
 * Modules are organized based on the backend database schema and permission matrix.
 *
 * Reference: docs/RE-ENABLE-AUTHENTICATION.md for permission system
 */

import { can, type Actions, type SubjectNames } from './ability';

export interface Module {
  id: string;
  name: string;
  icon: string;
  path: string;
  description?: string;
  subject?: SubjectNames;
  /** Action checked against `subject`; defaults to 'read'. */
  action?: Actions;
  permissions?: string[];
  roles?: string[];
  children?: Module[];
}

export const modules: Module[] = [
  // Dashboard
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'Home',
    path: '/dashboard',
    description: 'Overview and statistics',
    roles: ['Admin', 'SYS_ADMIN', 'ClinicManager', 'MGR', 'Doctor', 'DOC', 'Nurse', 'NURSE', 'Receptionist', 'RECEP', 'Pharmacist', 'PHARM', 'LabTechnician', 'LAB_TECH', 'Cashier', 'CASHIER', 'Accountant', 'ACCT'],
  },

  // User Management
  {
    id: 'users',
    name: 'User Management',
    icon: 'Users',
    path: '/users',
    description: 'Manage system users and staff',
    subject: 'User',
    roles: ['Admin', 'SYS_ADMIN', 'ClinicManager', 'MGR'],
    children: [
      { id: 'users-index', name: 'Users', icon: 'Users', path: '/users/index' },
      { id: 'users-dashboard', name: 'Dashboard', icon: 'BarChart3', path: '/users/dashboard' },
      { id: 'users-register', name: 'Register User', icon: 'User', path: '/users/register' },
      { id: 'users-heads', name: 'Heads of Department', icon: 'Shield', path: '/users/heads-of-department', roles: ['Admin', 'SYS_ADMIN'] },
      { id: 'users-nurse', name: 'Nurse Portal', icon: 'User', path: '/users/nurse-portal' },
      { id: 'users-pharmacy', name: 'Pharmacy Portal', icon: 'Pill', path: '/users/pharmacy-portal' },
      { id: 'users-lab', name: 'Lab Portal', icon: 'Flask', path: '/users/lab-portal' },
      { id: 'users-admin', name: 'Admin Portal', icon: 'Shield', path: '/users/admin-portal' },
      { id: 'users-accountant', name: 'Accountant Portal', icon: 'DollarSign', path: '/users/accountant-portal' },
      { id: 'users-clinic-manager', name: 'Clinic Manager Portal', icon: 'Building', path: '/users/clinic-manager-portal' },
      { id: 'users-reception', name: 'Reception Portal', icon: 'Home', path: '/users/reception-portal' },
      { id: 'users-notes', name: 'Notes', icon: 'FileText', path: '/users/notes' },
    ],
  },

  // Patient Management
  {
    id: 'patients',
    name: 'Patients',
    icon: 'User',
    path: '/patients',
    description: 'Patient records and management',
    subject: 'Patient',
  },

  // Appointments
  {
    id: 'appointments',
    name: 'Appointments',
    icon: 'Calendar',
    path: '/appointments',
    description: 'Schedule and manage appointments',
    subject: 'Appointment',
    children: [
      {
        id: 'appointments-dashboard',
        name: 'Dashboard',
        icon: 'Home',
        path: '/appointments/dashboard',
      },
      {
        id: 'appointments-new',
        name: 'New Booking',
        icon: 'Calendar',
        path: '/appointments/new',
      },
      {
        id: 'appointments-schedule',
        name: 'Doctor Schedule',
        icon: 'Calendar',
        path: '/appointments/schedule',
      },
      {
        id: 'appointments-history',
        name: 'All Appointments',
        icon: 'FileText',
        path: '/appointments/history',
      },
      {
        id: 'appointments-reports',
        name: 'Reports',
        icon: 'BarChart',
        path: '/appointments/reports',
      },
    ],
  },

  // Medical Records / EMR
  {
    id: 'medical-records',
    name: 'Medical Records',
    icon: 'FileText',
    path: '/medical-records',
    description: 'Electronic medical records and consultations',
    subject: 'Consultation',
  },

  // Laboratory
  {
    id: 'laboratory',
    name: 'Laboratory',
    icon: 'Flask',
    path: '/laboratory',
    description: 'Lab tests and results management',
    subject: 'Laboratory',
    children: [
      { id: 'laboratory-catalog', name: 'Test Catalog', icon: 'Flask', path: '/laboratory', subject: 'Lab_test' },
      { id: 'laboratory-new', name: 'Create Test', icon: 'Flask', path: '/laboratory/new', subject: 'Lab_test', action: 'create' },
      { id: 'laboratory-enter', name: 'Enter Results', icon: 'FileText', path: '/laboratory/results/new', subject: 'Laboratory', action: 'create' },
      { id: 'laboratory-results', name: 'Test Results', icon: 'FileText', path: '/laboratory/results', subject: 'Laboratory' },
    ],
  },

  // Pharmacy
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    icon: 'Pill',
    path: '/pharmacy',
    description: 'Medicines and prescriptions',
    subject: 'Pharmacy',
  },

  // Patient balance: what a patient owes, for reception and billing
  {
    id: 'patient-balance',
    name: 'Patient Balance',
    icon: 'DollarSign',
    path: '/patient-balance',
    description: 'What a patient owes right now',
    subject: 'PatientBalance',
  },

  // Billing & Invoices
  {
    id: 'billing',
    name: 'Billing',
    icon: 'DollarSign',
    path: '/billing',
    description: 'Invoices and payments',
    subject: 'Billing',
    children: [
      { id: 'billing-charges', name: 'Patient Charges', icon: 'DollarSign', path: '/billing/charges' },
      { id: 'billing-services', name: 'Service Prices', icon: 'DollarSign', path: '/billing/services' },
      { id: 'billing-invoices', name: 'Invoices', icon: 'FileText', path: '/billing' },
      { id: 'billing-new', name: 'New Invoice', icon: 'FileText', path: '/billing/new', subject: 'Billing', action: 'create' },
    ],
  },

  // Insurance and Inventory are hidden until the backend exposes endpoints for them
  // (the insurance_companies / patient_insurances tables exist but have no routes yet).

  // Departments
  {
    id: 'departments',
    name: 'Departments',
    icon: 'Building',
    path: '/departments',
    description: 'Hospital departments and units',
    subject: 'Department',
  },

  // Reports
  {
    id: 'reports',
    name: 'Reports',
    icon: 'BarChart',
    path: '/reports',
    description: 'System reports and analytics',
    subject: 'Report',
  },

  // Settings
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    path: '/settings',
    description: 'System configuration',
    roles: ['Admin', 'SYS_ADMIN'],
  },
];


export function getModulesByRole(userRole?: string | null): Module[] {
  if (!userRole) return [];
  return modules.filter(module => canAccessModule(module, userRole));
}


export function canAccessModule(module: Module, userRole?: string | null): boolean {
  if (!userRole) return false;

  // If explicit roles are declared on module
  if (module.roles && module.roles.length > 0) {
    const isRoleAllowed = module.roles.includes(userRole);
    if (!isRoleAllowed) return false;
  }

  // If module maps to a CASL subject, check the required action (read by default)
  if (module.subject) {
    return can(module.action ?? 'read', module.subject, userRole);
  }

  return true;
}

