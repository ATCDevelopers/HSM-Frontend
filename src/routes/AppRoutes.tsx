import { lazy, Suspense, type ComponentType } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import BaseLayout from "../components/layouts/BaseLayout";
// Guest screens stay eagerly imported so the very first paint (the login page)
// has nothing to download on demand.
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import { DashboardPage } from "../pages/appointments/Dashboard";
import { NewBookingPage } from "../pages/appointments/New-bookingpage";
import { DoctorSchedulePage } from "../pages/appointments/Doctor-schedulepage";
import { PatientHistoryPage } from "../pages/appointments/Patient-appointment";
import { AppointmentStatusPage } from "../pages/appointments/Status-page";

// Everything behind auth is code-split: each page becomes its own chunk that the
// browser only fetches when the user actually navigates to it. This shrinks the
// initial bundle from "the whole app" down to just the login screen.
const Home = lazy(() => import("../pages/home/Home"));
const Dashboard = lazy(() => import("../pages/dashboard/Index"));
const PatientManagement = lazy(
  () => import("../pages/patients/PatientsManagement"),
);
const RegisterPatient = lazy(
  () => import("../pages/patients/RegisterPatients"),
);
const PatientDetails = lazy(
  () => import("../pages/patients/PatientsDetails"),
);
const EditPatient = lazy(() => import("../pages/patients/EditPatients"));

// Standard CRUD pages - reused for all resources
const Index = lazy(() => import("../pages/crud/Index"));
const Show = lazy(() => import("../pages/crud/Show"));
const Form = lazy(() => import("../pages/crud/Form"));

const MedicalHistory = lazy(() => import("../pages/medical-records/Index"));
const VitalsForm = lazy(() => import("../pages/medical-records/VitalsForm"));
const MedicalRecordsShow = lazy(() => import("../pages/medical-records/Show"));
const ConsultationForm = lazy(
  () => import("../pages/medical-records/ConsultationForm"),
);

const ResourceIndex = Index as ComponentType<{ resource: string }>;
const ResourceShow = Show as ComponentType<{ resource: string }>;

/** Lightweight fallback shown while a lazily-loaded page chunk is fetched. */
function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public (guest) routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — require authentication */}
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Appointments */}
          <Route
            path="/appointments"
            element={<BaseLayout resourceName="Appointments"><DashboardPage /></BaseLayout>}
          />
          <Route
            path="/appointments/dashboard"
            element={<BaseLayout resourceName="Appointments"><DashboardPage /></BaseLayout>}
          />
          <Route
            path="/appointments/new"
            element={<BaseLayout resourceName="Appointments"><NewBookingPage /></BaseLayout>}
          />
          <Route
            path="/booking/new"
            element={<BaseLayout resourceName="Appointments"><NewBookingPage /></BaseLayout>}
          />
          <Route
            path="/appointments/schedule"
            element={<BaseLayout resourceName="Appointments"><DoctorSchedulePage /></BaseLayout>}
          />
          <Route
            path="/doctor/schedule"
            element={<BaseLayout resourceName="Appointments"><DoctorSchedulePage /></BaseLayout>}
          />
          <Route
            path="/appointments/history"
            element={<BaseLayout resourceName="Appointments"><PatientHistoryPage /></BaseLayout>}
          />
          <Route
            path="/patient/history"
            element={<BaseLayout resourceName="Appointments"><PatientHistoryPage /></BaseLayout>}
          />
          <Route
            path="/appointments/:id/status"
            element={<BaseLayout resourceName="Appointment Status"><AppointmentStatusPage /></BaseLayout>}
          />
          <Route
            path="/appointment/:id/status"
            element={<BaseLayout resourceName="Appointment Status"><AppointmentStatusPage /></BaseLayout>}
          />

          {/* Patients */}
          <Route path="/patients" element={<PatientManagement />} />
          <Route path="/patients/register" element={<RegisterPatient />} />
          <Route path="/patients/:id/edit" element={<EditPatient />} />
          <Route path="/patients/:id" element={<PatientDetails />} />

          {/* Generic CRUD routes */}
          <Route path="/patients/new" element={<Form resource="patients" />} />

          <Route path="/medical-records" element={<MedicalHistory />} />
          <Route path="/medical-records/vitals/new" element={<VitalsForm />} />
          <Route
            path="/medical-records/:patientId"
            element={<MedicalRecordsShow />}
          />
          <Route
            path="/medical-records/consultations/new"
            element={<ConsultationForm />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;

