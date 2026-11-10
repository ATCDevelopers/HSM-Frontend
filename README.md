# HMS Frontend: Hospital Management System Web App

React single-page app used by hospital staff: reception, doctors, nurses, lab, pharmacy, billing, management and admins. It talks to the API in `../HSM-Backend` (see that README for every endpoint and rule).

**Stack:** React 19 · TypeScript · Vite 7 · React Router 7 · Tailwind CSS 4 · Axios · SweetAlert2 · Heroicons · jsPDF (patient PDF export) · React Compiler

---

## Contents

1. [Getting started](#1-getting-started)
2. [Project structure](#2-project-structure)
3. [How the app talks to the API](#3-how-the-app-talks-to-the-api)
4. [Login, sessions and landing pages](#4-login-sessions-and-landing-pages)
5. [Permissions: what each user sees](#5-permissions-what-each-user-sees)
6. [Sidebar and routing](#6-sidebar-and-routing)
7. [Shared building blocks](#7-shared-building-blocks)
8. [Features, module by module](#8-features-module-by-module)
9. [Printing](#9-printing)
10. [Adding a page or module](#10-adding-a-page-or-module)
11. [Checking your work and test accounts](#11-checking-your-work-and-test-accounts)
12. [Known limitations](#12-known-limitations)

---

## 1. Getting started

```bash
npm install
cp .env.example .env     # then check VITE_API_URL
npm run dev              # http://localhost:5173
npm run build            # production build into dist/
npm run type-check       # tsc --noEmit
```

**`.env`:**

| Variable | Example | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `/api/v1` | API base path. The Vite dev server **proxies `/api` to the backend** (`http://localhost:8000`, or `API_PROXY_TARGET`), so the app works on localhost and through tunnels. A full URL also works if you're not using the proxy. **No trailing slash.** |
| `VITE_BASE_URL` | `http://localhost:8000` | Backend root |
| `VITE_NAME`, `VITE_ENV`, `VITE_DEBUG`, … | | Read by `src/config/projectConfig.ts` |

Only `VITE_`-prefixed variables reach the browser (through `import.meta.env`). Never put secrets in this file. The backend must allow this origin through its `CLIENT_URL` setting.

**Sharing the dev server through a tunnel (e.g. `cloudflared tunnel --url http://localhost:5173`):** `server.allowedHosts` in `vite.config.js` already allows any `*.trycloudflare.com` host; add other tunnel domains there (ngrok: `.ngrok-free.app`). Only the frontend needs a tunnel, because API calls go through the same host via the proxy. Restart `npm run dev` after changing `vite.config.js` or `.env`.

---

## 2. Project structure

```text
src/
├── main.tsx, App.tsx          # bootstraps router + AuthProvider + SidebarProvider
├── routes/AppRoutes.tsx       # every route (lazy-loaded pages, ProtectedRoute)
├── auth/
│   ├── AuthContext.tsx        # logged-in user + token in sessionStorage; login/logout
│   └── authAPI.ts             # login/logout calls, role → landing page map
├── config/
│   ├── ability.ts             # PERMISSION_MATRIX + can(action, subject, role)  ← mirrors backend
│   ├── modules.ts             # sidebar items (with dropdown children) and their access rules
│   └── projectConfig.ts       # app name/env settings
├── services/                  # one file per backend module; the ONLY place that calls the API
│   ├── api.ts                 # axios instance, auth header, automatic token refresh
│   ├── apiResponse.ts         # extractList / extractRecord / getErrorMessage
│   ├── patientAPI.ts          # patients + documents
│   ├── appointmentAPI.ts      # appointments, schedules, availability, doctors
│   ├── emrAPI.ts              # consultations, vitals, lab result history
│   ├── labTestConfigAPI.ts    # lab test templates + results inbox
│   ├── pharmacyAPI.ts         # medicines, prescriptions, dispensing
│   ├── billingAPI.ts          # invoices, price list, charges, patient balance
│   ├── departmentAPI.ts       # departments, staff, availability, heads
│   ├── statusAPI.ts           # lookup statuses
│   └── userAPI.ts             # staff accounts
├── components/
│   ├── layouts/               # BaseLayout (sidebar + top bar), Sidebar, TopNavbar
│   ├── atoms/                 # Button, Modal, Input, Select, Badge, Card, …
│   └── sections/              # Table + shared feature widgets (PatientPicker, PatientDocuments, PatientBalanceCard)
└── pages/<module>/            # screens, grouped by module (Index = list, Show = detail, Form = create/edit)
```

---

## 3. How the app talks to the API

```text
page  →  services/<module>API.ts  →  services/api.ts (axios)  →  backend
```

- **Pages never call axios directly.** They call a typed service function such as `invoiceAPI.list()` or `prescriptionAPI.dispense(id)`.
- **`api.ts` request step:** adds `Authorization: Bearer <token>` from `sessionStorage`.
- **`api.ts` response step:**
  - On a **401** it calls `POST /auth/refresh` once (the refresh token travels in an httpOnly cookie because of `withCredentials: true`), stores the new access token and **retries the original request**.
  - If the refresh fails, it clears the session and sends the user to `/login`.
- **Response shapes vary.** Some endpoints return `{ data }` and some a bare array or object. Services always unwrap with `extractList` / `extractRecord` from `apiResponse.ts`.
- **Error messages:** show errors with `getErrorMessage(error, fallback)`. It prefers the backend's `{ error }` text (e.g. "Ciprofloxacin 500mg (need 14, have 8)") over axios's generic "Request failed with status code 409".
- **File uploads** send `FormData` (`patientDocumentAPI.upload`).
- **File previews** fetch the file as a `blob` through the authenticated API and show it with an object URL. Files are never public links.

---

## 4. Login, sessions and landing pages

1. **`/login`:** `AuthContext.login()` calls `POST /auth/login` and stores the access token and user in **sessionStorage**, so closing the tab logs you out.
2. **Landing page:** the user goes to their role's landing page (`getRoleDashboard` in `authAPI.ts`):

| Role | Lands on |
| --- | --- |
| Admin | `/users/admin-portal` |
| Doctor, Cashier | `/dashboard` |
| Nurse | `/users/nurse-portal` |
| Receptionist | `/users/reception-portal` |
| Pharmacist | `/users/pharmacy-portal` |
| LabTechnician | `/users/lab-portal` |
| ClinicManager | `/users/clinic-manager-portal` |
| Accountant | `/users/accountant-portal` |

**Portals:** every portal renders the same live **role dashboard** (`pages/dashboard/Index.tsx`) with a different title. The dashboard decides its own content from the role (§8.1).

**Protected routes:** `ProtectedRoute` sends anyone without a session to `/login`. The **backend still checks every request**; hiding things in the UI is only for convenience.

---

## 5. Permissions: what each user sees

`src/config/ability.ts` holds a `PERMISSION_MATRIX` that **mirrors the backend's `src/config/ability.ts`**. Use it everywhere:

```tsx
const { user } = useAuth();
const canDispense = can("update", "Prescription", user?.role);
{canDispense && <button onClick={dispense}>Dispense</button>}
```

When you change a permission in the backend, make the same change here, or the UI will show buttons that fail with 403, or hide ones that would work.

**Rules that aren't plain role checks:**

- **PatientBalance:** lets Receptionists see what a patient owes without the rest of Billing.
- **Head of department:** a per-person flag, not a role. It comes from `departmentStaffAPI.me()` (`headOf`). It adds the **★ My Department** sidebar entrance and a dashboard banner, and unlocks the head view of `/departments/:id`.
- **Admin-only screens** check `user.role === "Admin"`: Heads of Department, Make head.

---

## 6. Sidebar and routing

- **Sidebar items** are configured in `src/config/modules.ts`:
  - A `Module` has `path`, `icon`, an optional `subject` (+ `action`, default `read`) and an optional `roles` list.
  - `canAccessModule()` decides whether it's shown.
  - Items with `children` render as **collapsible dropdowns**. Each child is filtered with the same rules, and a dropdown opens automatically when you're on one of its pages.
- **Current dropdowns:**
  - **Users:** Users, Register User, Heads of Department (Admin), and portals
  - **Appointments:** Dashboard, New Booking, Doctor Schedule, All Appointments
  - **Laboratory:** Test Catalog, Create Test, Enter Results, Test Results
  - **Billing:** Patient Charges, Service Prices, Invoices, New Invoice
- **Single items:** Dashboard, Patients, Medical Records, Pharmacy, Patient Balance, Departments, Reports, Settings.
- **Loaded per user:** **★ My Department** (heads only).
- **Routes** are declared in `src/routes/AppRoutes.tsx`:
  - Pages are lazy-loaded and wrapped in `<ProtectedRoute>`.
  - Pages render their own `<BaseLayout>`, so **don't wrap them again in the route**.
  - Fixed paths (`/laboratory/results/new`) and parameter paths (`/laboratory/:id/edit`) can coexist, because React Router prefers the fixed one.

---

## 7. Shared building blocks

Reuse these instead of rebuilding them:

| Component / helper | Where | What it does |
| --- | --- | --- |
| `PatientPicker` | `components/sections/` | Type a name, phone or NHIF number, pick from up to 8 matches, and the patient **locks** into a card until "Change patient". Enter picks a single match. Used in lab results, balance and manual charges. |
| `PatientBalanceCard` | `components/sections/` | What a patient owes (red/green), insurance cover, line items, **Print slip** |
| `PatientDocuments` | `components/sections/` | Upload outside documents (drag-drop, type, issuing hospital, date, notes), list them, preview PDFs and images in place, remove |
| `TestPicker` | `pages/laboratory/` | Search lab tests by name or measured value, filter by category, lock the chosen test |
| `SlotPicker` | `pages/appointments/` | Live grid of a doctor's slots for a day; booked/blocked slots are disabled |
| `LabHistoryPanel` + `labReport.ts` | `pages/medical-records/` | Lab history side panel and printable lab reports |
| `Table`, `Modal`, `Button`, … | `components/` | Generic UI |
| `getErrorMessage`, `extractList`, `extractRecord` | `services/apiResponse.ts` | Error text and response unwrapping |
| Formatting helpers | `billingAPI.ts`, `appointmentAPI.ts` | `formatMoney`, `toDateKey`, `doctorLabel` (adds "(on leave)"), `statusLabel` |

---

## 8. Features, module by module

### 8.1 Dashboard and portals: `pages/dashboard/Index.tsx`

- **"My status" bar:** set your own availability (Available, Busy, On leave, Off duty). Your department appears in the greeting.
- **Head banner:** if you head a department, an "Open my department" banner.
- **Live cards for your role:** today's appointments, patients, medicines (low stock), invoices awaiting payment, lab tests, staff. Each card loads independently, so a forbidden one simply doesn't appear.
- **"What does a patient owe?"** (Receptionist and billing roles): pick a patient and see their balance inline.
- **Today's appointments** and **quick actions** for the role.

### 8.2 Patients: `pages/patients/`

- **List** with search and pagination.
- **Register:** a **Payment type** field (NHIF card, Private insurance, Cash).
  - A card number is required unless the patient pays cash.
  - Cash registration shows that a registration fee will be billed.
- **Patient profile:** details, **Check balance**, Edit, Delete, and the **Documents from other institutions** panel.

### 8.3 Appointments: `pages/appointments/`

| Page | What it does |
| --- | --- |
| Dashboard | Any day's bookings, counters (booked / waiting / completed / cancelled), **Send reminders** |
| New Booking | Choose patient, doctor (labelled if busy or on leave), date, then a **live slot** from `SlotPicker`; type, priority, reason |
| Doctor Schedule | Weekly hours per day (working toggle, start, end, slot length), leave periods, 7-day availability preview. Saving replaces the whole week. Doctors edit their own. |
| All Appointments | Filter by patient, doctor, status and date range |
| Status (`/appointments/:id/status`) | Only allowed moves are offered: confirm, check in, complete, no-show. Also reschedule with a slot picker, cancel with a reason, and **Start consultation** for checked-in patients. |

### 8.4 Medical records: `pages/medical-records/`

- **Index:** searchable patient list.
- **Show (`/medical-records/:patientId`):**
  - **Header:** demographics and actions allowed for the role: New consultation, Record vitals, Prescribe, Enter lab result, Book appointment.
  - **Tabs:** Consultations · Vitals · Prescriptions (with medicines and status) · **Outside documents**.
  - **Right-hand "Laboratory tests" panel:**
    - all results, newest first, with technician, the doctor it was sent to, and abnormal-value badges
    - category and "Abnormal only" filters
    - click a result to open it, step **Newer / Older**, **Print this result** or **Print all**.
- **ConsultationForm / VitalsForm:** step-by-step wizards. The signed-in doctor is recorded as the consultant.
- **PrescriptionForm:** several medicine lines (dose, times per day, duration, quantity, instruction). Saved as **pending** for the pharmacy queue.

### 8.5 Laboratory: `pages/laboratory/`

| Page | What it does |
| --- | --- |
| Test Catalog (`/laboratory`) | Cards per test with its fields: Enter result · Edit · Archive |
| Create Test (`/laboratory/new`, `/:id/edit`) | Build a test's form: number (with normal min/max), text or option fields |
| Enter Results (`/laboratory/results/new`) | 1) lock the patient (their recent results show, to avoid repeats) → 2) lock the test with `TestPicker` → 3) choose the doctor → fill the test's own fields. Out-of-range numbers turn amber. After saving: **Another test, same patient** / New patient / View results. |
| Test Results (`/laboratory/results`) | Inbox. **Doctors see only results sent to them**; others can filter by doctor. Abnormal counts, details modal, Open patient record. |

### 8.6 Pharmacy: `pages/pharmacy/`

- **Dispensing queue** (opens first for pharmacists): filter Pending, Dispensed, Cancelled or All, or by patient name.
  - Each medicine line shows ✓ in stock or ⚠ short.
  - **Dispense** is disabled while anything is short.
  - Dispensing deducts stock and marks the prescription dispensed **in one backend step**, then shows "−24 → 66 left" per medicine.
  - **Cancel** sets the prescription to cancelled.
- **Medicines:** catalogue with low-stock highlighting; add or edit (`Form.tsx`) code, names, form, strength, price, stock, status.

### 8.7 Billing (Cashier, Accountant, Admin; Clinic Manager read-only): `pages/billing/`

| Page | What it does |
| --- | --- |
| Patient Charges (`/billing/charges`) | Charges created **automatically** as patients receive services, grouped by patient, with per-department totals. Filters: status, department, payer (cash / NHIF / insurance). **Invoice all** or tick charges → **Invoice selected**. Waive/restore. **Add charge** for custom services. Warns about unpriced charges. |
| Service Prices (`/billing/services`) | Price list grouped by department. **New lab tests, medicines and appointment types appear here automatically.** Set or change prices inline, turn charging on or off for a service, add custom services (e.g. antenatal visit). Setting a price fills in charges that were waiting for one. |
| Invoices (`/billing`, `/billing/:id`) | List with filters; detail with lines, total, status change, add/remove lines (until paid or void), print |
| New Invoice (`/billing/new`) | Manual invoice with free-form charges |
| Patient Balance (`/patient-balance`) | Also open to **Receptionists**: amount due, unpaid invoices, services not yet invoiced, insurance cover, **Print slip** |

### 8.8 Departments: `pages/departments/`, `pages/users/HeadsOfDepartment.tsx`

- **List:** head and staff count per department, plus a warning about unassigned staff. Click a row to open it.
- **Department page (`/departments/:id`)**, which changes with who is viewing:
  - **Admin / Clinic Manager:** see the team with availability, set availability, **Add staff** (unassigned people first, or "Transfer here"), **Transfer**, **Remove**, Edit details. Admins also get **Make head** and **Clear head**.
  - **Head of that department:** see the team, set availability, edit name, code and location. No add, transfer or remove.
- **Heads of Department (User Management, Admin only):** one card per department; appoint or change the head from that department's members.

### 8.9 Staff accounts: `pages/users/`

- **Register User:** choosing a role pre-selects its usual department (Doctor → Medical Department, Cashier → Accounts & Billing, …), which you can change.
- **Edit User:** includes the department.
- **List and details:** show the department.

### 8.10 Reports and Settings

- **Reports:** appointment analytics for a date range: totals, completed, cancelled, no-show rate, a by-status chart, a per-doctor table, **Export CSV**.
- **Settings (Admin):** links to Departments and Staff, and the configured statuses.

---

## 9. Printing

Printouts open a small new window containing escaped HTML and call `window.print()`. The browser must allow pop-ups for the site.

| Printout | Built by |
| --- | --- |
| Lab result / full lab history | `pages/medical-records/labReport.ts` (hospital header, patient box, results table with normal ranges and **ABNORMAL** flags, notes, signature lines) |
| Patient balance slip | `components/sections/PatientBalanceCard.tsx` |
| Invoice | `pages/billing/Show.tsx` (`window.print()` with `print:hidden` controls) |
| Patient PDF export | `pages/medical-records/exportPatientPdf.ts` (jsPDF) |

---

## 10. Adding a page or module

1. **Service:** add a typed service in `src/services/<module>API.ts`. Unwrap responses with `extractList` / `extractRecord`.
2. **Page:** create it in `src/pages/<module>/` (Index / Show / Form), render `<BaseLayout resourceName="…">`, and show errors with `getErrorMessage`.
3. **Route:** add a lazy route inside `<ProtectedRoute>` in `AppRoutes.tsx`.
4. **Sidebar:** add an item, or a dropdown child, in `config/modules.ts` with the right `subject` / `action` / `roles`.
5. **Permissions:** mirror any new backend permission in `config/ability.ts`, and gate buttons with `can()`.
6. **Patient selection:** use `PatientPicker` instead of a long dropdown.
7. **Verify** (§11).

---

## 11. Checking your work and test accounts

```bash
npm run type-check        # must pass
npm run build             # must pass
```

ESLint is currently noise: its config doesn't parse TypeScript, so every file shows a parse error. Rely on the type-check and build.

**Development accounts** (backend local database). Every password is `Abc@2026.` (including the final period):

| Role | Email |
| --- | --- |
| Admin | `admin@hms.test` |
| Clinic Manager (head of Administration) | `manager@hms.test` |
| Receptionist | `reception@hms.test` |
| Doctor (head of Medical) | `doctor@hms.test` |
| Nurse | `nurse@hms.test` |
| Lab Technician (head of Laboratory) | `lab@hms.test` |
| Pharmacist (head of Pharmacy) | `pharmacist@hms.test` |
| Cashier | `cashier@hms.test` |
| Accountant (head of Accounts & Billing) | `accountant@hms.test` |

**A good walkthrough of the whole system:**

1. **Reception:** register a **cash** patient, book an appointment, check the balance.
2. **Nurse:** record vitals.
3. **Doctor:** write a consultation and a prescription.
4. **Lab:** enter a result and send it to the doctor.
5. **Doctor:** open Test Results.
6. **Pharmacist:** dispense.
7. **Cashier:** open Patient Charges and invoice the patient.

---

## 12. Known limitations

- **Insurance, Inventory and Wards** have no backend API yet, so they're hidden from the sidebar.
- **Individual payments aren't recorded.** Invoice status is set by hand.
- **Prescriptions and manual invoices aren't saved atomically.** Each is saved as a header plus separate line requests; if a line fails, the header remains.
- **The template's old docs are outdated.** `docs/RE-ENABLE-AUTHENTICATION.md`, `docs/ADDING-MODULES-AND-PAGES.md` and `docs/AI.md` describe a Laravel-based template, not this app. Prefer this README.
