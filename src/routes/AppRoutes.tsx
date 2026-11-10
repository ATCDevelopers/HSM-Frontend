import { lazy, Suspense, type ComponentType } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import BaseLayout from "../components/layouts/BaseLayout.tsx";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../auth/AuthContext";
import { getRoleDashboard } from "../auth/authAPI";
// ── Public: Login page (eagerly loaded for instant first paint) ──────────────
import LoginPage from "../pages/auth/LoginPage";

import { DashboardPage } from "../pages/appointments/Dashboard";
import { NewBookingPage } from "../pages/appointments/New-bookingpage";
import { DoctorSchedulePage } from "../pages/appointments/Doctor-schedulepage";
import { PatientHistoryPage } from "../pages/appointments/Patient-appointment";
import { AppointmentStatusPage } from "../pages/appointments/Status-page";
import { AppointmentReportsPage } from "../pages/appointments/Reports";

const Home = lazy(() => import("../pages/home/Home"));
const Dashboard = lazy(() => import("../pages/dashboard/Index"));
const PatientManagement = lazy(
  () => import("../pages/patients/PatientsManagement"),
);
const RegisterPatient = lazy(
  () => import("../pages/patients/RegisterPatients"),
);
const PatientDetails = lazy(() => import("../pages/patients/PatientsDetails"));
const EditPatient = lazy(() => import("../pages/patients/EditPatients"));
const Landing = lazy(() => import("../pages/home/Landing"));
const GetStarted = lazy(() => import("../pages/home/GetStarted"));
const Index = lazy(() => import("../pages/crud/Index"));
const Show = lazy(() => import("../pages/crud/Show"));
const Form = lazy(() => import("../pages/crud/Form"));

const MedicalHistory = lazy(() => import("../pages/medical-records/Index.tsx"));
const VitalsForm = lazy(() => import("../pages/medical-records/VitalsForm"));
const MedicalRecordsShow = lazy(
  () => import("../pages/medical-records/Show.tsx"),
);
const ConsultationForm = lazy(
  () => import("../pages/medical-records/ConsultationForm"),
);
const PrescriptionForm = lazy(() => import("../pages/medical-records/PrescriptionForm"));
const Pharmacy = lazy(() => import("../pages/pharmacy/Index"));
const PharmacyForm = lazy(() => import("../pages/pharmacy/Form"));
const BillingIndex = lazy(() => import("../pages/billing/Index"));
const BillingForm = lazy(() => import("../pages/billing/Form"));
const BillingShow = lazy(() => import("../pages/billing/Show"));
const BillingCharges = lazy(() => import("../pages/billing/Charges"));
const PatientBalancePage = lazy(() => import("../pages/billing/PatientBalance"));
const BillingServices = lazy(() => import("../pages/billing/Services"));
const Departments = lazy(() => import("../pages/departments/Index"));
const DepartmentShow = lazy(() => import("../pages/departments/Show"));
const Reports = lazy(() => import("../pages/reports/Index"));
const Settings = lazy(() => import("../pages/settings/Index"));
const LaboratoryIndex = lazy(() => import("../pages/laboratory/Index"));
const EnterLabResult = lazy(() => import("../pages/laboratory/EnterResult"));
const LabResults = lazy(() => import("../pages/laboratory/Results"));
const LabTestConfig = lazy(
  () => import("../pages/laboratory/labTestConfig"),
);

const UsersIndex = lazy(() => import("../pages/users/Index"));
const RegisterUser = lazy(() => import("../pages/users/Register"));
const UserDetails = lazy(() => import("../pages/users/UserDetails"));
const EditUser = lazy(() => import("../pages/users/EditUser"));
const UsersDashboard = lazy(() => import("../pages/users/Dashboard"));
const NursePortal = lazy(() => import("../pages/users/NursePortal"));
const PharmacyPortal = lazy(() => import("../pages/users/PharmacyPortal"));
const LabPortal = lazy(() => import("../pages/users/LabPortal"));
const AdminPortal = lazy(() => import("../pages/users/AdminPortal"));
const AccountantPortal = lazy(() => import("../pages/users/AccountantPortal"));
const ClinicManagerPortal = lazy(
  () => import("../pages/users/ClinicManagerPortal"),
);
const ReceptionPortal = lazy(() => import("../pages/users/ReceptionPortal"));
const Notes = lazy(() => import("../pages/users/Notes"));
const HeadsOfDepartment = lazy(() => import("../pages/users/HeadsOfDepartment"));

const ResourceIndex = Index as ComponentType<{ resource: string }>;
const ResourceShow = Show as ComponentType<{ resource: string }>;

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
    </div>
  );
}

/**
 * Root redirect: authenticated users are sent straight to their role dashboard;
 * unauthenticated users go to /login.
 */
function RootRedirect() {
  return <Landing />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* ── Public routes ─────────────────────────────────────────────── */}

        {/* Landing page — first page when the application opens */}
        <Route path="/" element={<Landing />} />

        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />

        {/* Get Started page */}
        <Route path="/get-started" element={<GetStarted />} />

        {/* ── Protected routes ──────────────────────────────────────────── */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Appointments */}
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute>
              <NewBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/new"
          element={
            <ProtectedRoute>
              <NewBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/schedule"
          element={
            <ProtectedRoute>
              <DoctorSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/schedule"
          element={
            <ProtectedRoute>
              <DoctorSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/history"
          element={
            <ProtectedRoute>
              <PatientHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/history"
          element={
            <ProtectedRoute>
              <PatientHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/:id/status"
          element={
            <ProtectedRoute>
              <AppointmentStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment/:id/status"
          element={
            <ProtectedRoute>
              <AppointmentStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/reports"
          element={
            <ProtectedRoute>
              <AppointmentReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Patients */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/register"
          element={
            <ProtectedRoute>
              <RegisterPatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/new"
          element={
            <ProtectedRoute>
              <Form resource="patients" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id/edit"
          element={
            <ProtectedRoute>
              <EditPatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute>
              <PatientDetails />
            </ProtectedRoute>
          }
        />

        {/* Medical records */}
        <Route
          path="/medical-records"
          element={
            <ProtectedRoute>
              <MedicalHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-records/vitals/new"
          element={
            <ProtectedRoute>
              <VitalsForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-records/:patientId"
          element={
            <ProtectedRoute>
              <MedicalRecordsShow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-records/consultations/new"
          element={
            <ProtectedRoute>
              <ConsultationForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medical-records/prescriptions/new"
          element={
            <ProtectedRoute>
              <PrescriptionForm />
            </ProtectedRoute>
          }
        />

        {/* Pharmacy: medicine catalogue and dispensing */}
        <Route
          path="/pharmacy"
          element={
            <ProtectedRoute>
              <Pharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/new"
          element={
            <ProtectedRoute>
              <PharmacyForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy/:id/edit"
          element={
            <ProtectedRoute>
              <PharmacyForm />
            </ProtectedRoute>
          }
        />

        {/* Billing */}
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <BillingIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/new"
          element={
            <ProtectedRoute>
              <BillingForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-balance"
          element={
            <ProtectedRoute>
              <PatientBalancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/charges"
          element={
            <ProtectedRoute>
              <BillingCharges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/services"
          element={
            <ProtectedRoute>
              <BillingServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/:id"
          element={
            <ProtectedRoute>
              <BillingShow />
            </ProtectedRoute>
          }
        />

        {/* Administration */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <Departments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments/:id"
          element={
            <ProtectedRoute>
              <DepartmentShow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Laboratory test configuration and result submission */}
        <Route
          path="/laboratory"
          element={
            <ProtectedRoute>
              <LaboratoryIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratory/results"
          element={
            <ProtectedRoute>
              <LabResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratory/results/new"
          element={
            <ProtectedRoute>
              <EnterLabResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratory/new"
          element={
            <ProtectedRoute>
              <LabTestConfig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratory/:id/edit"
          element={
            <ProtectedRoute>
              <LabTestConfig />
            </ProtectedRoute>
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/index"
          element={
            <ProtectedRoute>
              <UsersIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/dashboard"
          element={
            <ProtectedRoute>
              <UsersDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/register"
          element={
            <ProtectedRoute>
              <RegisterUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/heads-of-department"
          element={
            <ProtectedRoute>
              <HeadsOfDepartment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute>
              <EditUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/nurse-portal"
          element={
            <ProtectedRoute>
              <NursePortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/pharmacy-portal"
          element={
            <ProtectedRoute>
              <PharmacyPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/lab-portal"
          element={
            <ProtectedRoute>
              <LabPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/admin-portal"
          element={
            <ProtectedRoute>
              <AdminPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/accountant-portal"
          element={
            <ProtectedRoute>
              <AccountantPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/clinic-manager-portal"
          element={
            <ProtectedRoute>
              <ClinicManagerPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/reception-portal"
          element={
            <ProtectedRoute>
              <ReceptionPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/notes"
          element={
            <ProtectedRoute>
              <BaseLayout resourceName="User Notes">
                <Notes />
              </BaseLayout>
            </ProtectedRoute>
          }
        />

        

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
