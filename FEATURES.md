# Frontend: features added (Nov 2026)

What was added to or changed in the frontend, in the order it was built. Each entry gives what the user sees, how it works, and where the code lives. For the full app reference, see [README.md](README.md). The API side of each feature is in [HSM-Backend/FEATURES.md](../HSM-Backend/FEATURES.md).

**After pulling:** copy `.env.example` to `.env` (it now uses `VITE_API_URL=/api/v1`) and restart `npm run dev`.

---

## Contents

1. [Setup and security fixes](#1-setup-and-security-fixes)
2. [Service layer for every backend module](#2-service-layer-for-every-backend-module)
3. [Role dashboard and portals](#3-role-dashboard-and-portals)
4. [Appointments connected](#4-appointments-connected)
5. [Medical records](#5-medical-records)
6. [Sidebar dropdowns and permission-aware menus](#6-sidebar-dropdowns-and-permission-aware-menus)
7. [Laboratory](#7-laboratory)
8. [Pharmacy and dispensing](#8-pharmacy-and-dispensing)
9. [Automatic billing screens](#9-automatic-billing-screens)
10. [Patient balance for reception](#10-patient-balance-for-reception)
11. [Documents from other hospitals](#11-documents-from-other-hospitals)
12. [Departments, availability and heads of department](#12-departments-availability-and-heads-of-department)
13. [Staff accounts](#13-staff-accounts)
14. [Reports and settings](#14-reports-and-settings)
15. [Tunnel and dev-server configuration](#15-tunnel-and-dev-server-configuration)

---

## 1. Setup and security fixes

| Problem | Fix |
| --- | --- |
| **No backend URL.** `api.ts` read a variable no `.env` defined, so login returned 404 | `api.ts` and `authAPI.ts` read `import.meta.env.VITE_API_URL` |
| **Server secrets could reach the browser.** `vite.config.js` copied *every* env variable into the bundle (`define: {"process.env": env}`) | Removed; only `VITE_*` variables reach the browser |
| **Register User called the public sign-up endpoint**, the one that allowed creating an Admin | It now calls the admin-only `auth/register-worker`; the invalid "Patient" role option was removed |
| **Consultation and vitals forms never saved.** They sent `patient_id`-style names; the backend expects `patientId` | Forms map their fields to camelCase through `emrAPI` |
| **Double layout.** Several routes wrapped pages that already render `BaseLayout` | Extra wrappers removed |
| **Broken sidebar links** (`/appointments/:id/status` literal, `/users/profile`) | Removed |
| **Insurance/Inventory menu items** pointed at screens with no backend | Hidden until the API exists |
| `.env.example` still had Laravel/Pusher settings | Cleaned |
| `dist/vite.svg` tracked in git | Untracked |

## 2. Service layer for every backend module

**What:** pages never call axios directly; each backend module has one typed service file.

| File | Covers |
| --- | --- |
| `services/appointmentAPI.ts` | list (via reports), get, book, reschedule, cancel, status, reminders, availability, schedules, `doctors()`; status labels/colours; `doctorLabel` adds "(on leave)" |
| `services/emrAPI.ts` | consultations, vitals, lab result history |
| `services/pharmacyAPI.ts` | medicines, prescriptions (queue, search, **dispense**), prescription items |
| `services/billingAPI.ts` | invoices, invoice items, price list, charges, invoicing, balance, money formatting |
| `services/departmentAPI.ts` | departments, members, staff, availability, heads, role → department defaults |
| `services/statusAPI.ts` | statuses + `statusLabel` |
| `services/patientAPI.ts` | adds payment mode and **documents** (upload as FormData, preview as blob, delete) |
| `services/labTestConfigAPI.ts` | adds `doctorId` on results and the results inbox `list()` |
| `services/apiResponse.ts` | adds **`getErrorMessage()`**, which shows the backend's real error text instead of axios's "Request failed with status code 409" |

Responses are unwrapped with `extractList`/`extractRecord`, because some endpoints return `{data}` and others a bare array or object.

## 3. Role dashboard and portals

**What:** every portal (Admin, Nurse, Reception, Lab, Pharmacy, Accountant, Clinic Manager) and `/dashboard` used to show "N/A" placeholders. They now all render one live dashboard (`pages/dashboard/Index.tsx`) with a role-specific title.

**How it works:**

- **Cards:** each loads independently with `Promise.allSettled`, so a card the role can't access simply doesn't appear. The cards are: today's appointments, patients, medicines (low stock), invoices awaiting payment, lab tests, staff accounts.
- **Today's appointments** for the roles that see the appointment board.
- **Quick actions**, filtered by `can()`.
- Added in later features:
  - the **My status** bar (§12)
  - the **head of department** banner (§12)
  - the **"What does a patient owe?"** box (§10)

**Also:** Doctors now land on `/dashboard`. Their old landing page needed user-management rights, so it returned "forbidden". (`auth/authAPI.ts`)

## 4. Appointments connected

All five pages were static placeholders; they now use the real API (`pages/appointments/`).

| Page | What it does |
| --- | --- |
| **Dashboard** | Pick a day; counters (booked, waiting, completed, cancelled); schedule list; **Send reminders** |
| **New Booking** | Patient, doctor (with availability hint), date, then a **live slot grid** (`SlotPicker.tsx`, booked/blocked slots disabled); type, priority, reason. A doctor booking for themselves is pre-filled. |
| **Doctor Schedule** | Weekly hours per day, slot length, leave periods, 7-day preview. Saving sends only working days, because the backend replaces the whole week. |
| **All Appointments** | Filter by patient, doctor, status, date range |
| **Status** | Shows only the allowed next steps; reschedule with a slot grid; cancel with a required reason; **Start consultation** once checked in |

## 5. Medical records

- **Index:** the patient list, using the real patients API. It had been calling an `emr/patients` endpoint that doesn't exist.
- **Show (`/medical-records/:patientId`):**
  - **Header:** demographics and the actions the role allows: New consultation, Record vitals, Prescribe, Enter lab result, Book appointment.
  - **Tabs:** Consultations (with doctor name), Vitals table, Prescriptions (medicines, dose, status), and **Outside documents** (§11).
  - **Laboratory tests side panel** (`LabHistoryPanel.tsx`):
    - every result, newest first, with technician, the doctor it was sent to, and an amber abnormal-count badge
    - category and "Abnormal only" filters
    - click a result to open it; step **Newer / Older**; **Print this result** / **Print all**.
- **Printed lab report** (`labReport.ts`): hospital header, patient box, results table with normal ranges and **ABNORMAL** flags, notes, "Performed by / Sent to", signature line. HTML is escaped; one test per page block.
- **PrescriptionForm (new):** several medicine lines (dose, times per day, duration, quantity, instruction). Saved as a `pending` prescription for the pharmacy queue.

## 6. Sidebar dropdowns and permission-aware menus

**What:** the sidebar ignored the `children` defined in `config/modules.ts`. Modules with children now render as **collapsible dropdowns**.

**How:**

- A `Module` can declare `action` (default `read`) and `roles`.
- `canAccessModule()` checks `can(action, subject, role)`, and each child is filtered the same way, so people only see items they can use.
- A dropdown opens automatically when you're on one of its pages.
- **Dropdowns:** Users · Appointments · Laboratory · Billing.

**Files:** `components/layouts/Sidebar.tsx`, `config/modules.ts`.

## 7. Laboratory

| Page | What it does |
| --- | --- |
| **Test Catalog** (`/laboratory`, new) | Card per test with its fields: Enter result · Edit · Archive |
| **Create Test** (`/laboratory/new`, `/:id/edit`) | Existing builder; its old results form, which made users type a patient UUID, was removed |
| **Enter Results** (`/laboratory/results/new`, new) | Three steps, then fill in the form (below) |
| **Test Results** (`/laboratory/results`, new) | Inbox: **doctors see only results sent to them**; others filter by doctor. Abnormal badges, detail modal, Open patient record. |

**Enter Results in detail:**

1. Lock the patient with `PatientPicker`. Their recent results show, so repeats are easy to spot.
2. Lock the test with `TestPicker`: search by name or measured value, filter by category.
3. Choose the doctor to send it to. The dropdown shows availability, such as "on leave".
4. Fill in the test's own fields. Numbers outside the normal range turn amber.

After saving you choose **Another test, same patient** (patient and doctor stay locked), **New patient**, or **View results**.

**Shared component:** `components/sections/PatientPicker.tsx`.

- Type a name, phone, NHIF number or ID; every typed word must match.
- Up to 8 results; Enter picks a single match.
- The chosen patient locks into a blue card until "Change patient".
- Cash patients show "Cash patient".

## 8. Pharmacy and dispensing

`pages/pharmacy/` (Index and Form) were placeholders.

- **Dispensing queue** (opens first for pharmacists):
  - Filter Pending, Dispensed, Cancelled or All, and by patient name.
  - Each medicine line shows ✓ in stock or ⚠ short.
  - **Dispense** is disabled while anything is short.
  - A confirmation lists what will be deducted. After the backend's single transaction, a summary shows "Coartem: −24 → 66 left", with ⚠ when stock drops to 10 or fewer.
  - **Cancel** sets the prescription to cancelled.
- **Medicines:** catalogue with low-stock highlighting; add/edit form (code, generic and brand name, form, strength, price, stock, status).

## 9. Automatic billing screens

Billing dropdown (Cashier, Accountant, Admin; Clinic Manager read-only); `pages/billing/`:

| Page | What it does |
| --- | --- |
| **Patient Charges** (`Charges.tsx`, new) | Charges recorded automatically for every service, grouped by patient, with per-department totals (click one to filter). Filters: status, department, payer (Cash / NHIF claim / Insurance claim). **Invoice all** or tick charges → **Invoice selected** opens the new invoice. Waive/restore. **Add charge** (patient picker + service) for custom services. Banner when charges are waiting for a price. |
| **Service Prices** (`Services.tsx`, new) | Price list grouped by department, with where each department's charges come from. New lab tests, medicines and appointment types appear automatically. Inline price edit (Enter saves); disable/enable charging; **Add service**; "Unpriced only" filter. Saving a price reports how many waiting charges were filled in. |
| **Invoices** (`Index.tsx`, `Show.tsx`, new) | List with status counts and filters; detail with lines, total, status dropdown, add/remove lines until paid or void, print, delete |
| **New Invoice** (`Form.tsx`, new) | Manual invoice with free-form charges and a running total |

**Patient registration** (`pages/patients/RegisterPatients.tsx`):

- New **Payment type** field: NHIF card, Private insurance, or Cash.
- The card number field appears only for insured patients.
- Cash patients see a note that the registration fee will be billed.

## 10. Patient balance for reception

- **Sidebar → Patient Balance** (`pages/billing/PatientBalance.tsx`). Visible to roles with the new `PatientBalance` permission: Receptionist and the billing roles.
- **Shared `PatientBalanceCard`:** amount due in red (owes) or green (nothing owed), insurance cover, unpaid invoices, services not yet invoiced, an unpriced warning, and **Print slip** (a small receipt ending "Please pay at the cashier's desk").
- **Dashboard box** "What does a patient owe?" with an inline patient search, plus a **Check balance** button on the patient profile.

## 11. Documents from other hospitals

**Shared component `components/sections/PatientDocuments.tsx`**, used on the **patient profile** and as the **Outside documents** tab of the medical record:

- **Upload modal:** drag and drop or choose a PDF/JPG/PNG (checked for type and 10 MB size before sending); document type; date on the document; issuing hospital; notes.
- **List cards:** type badge, date, issuing hospital, uploader and upload date, file size.
- **Preview modal:** fetches the file **as a blob through the authenticated API** (never a public link) and shows PDFs in a viewer or images full size. **Open full screen**; **Remove** for staff who can edit the patient. Object URLs are released when the preview closes.

## 12. Departments, availability and heads of department

- **Departments list:** Head and Staff columns (count + roles), an unassigned-staff warning; click a row to open the department.
- **Department page** (`pages/departments/Show.tsx`, new). What you can do depends on who you are:

| Viewer | Can do |
| --- | --- |
| Admin / Clinic Manager | Availability counters (click to filter), role filter, team list, set anyone's availability, **Add staff** (unassigned people first, or "Transfer here"), **Transfer**, **Remove**, Edit details |
| Admin only | **Make head** on a member, **Clear head** |
| Head of that department | Team list, set availability, Edit details; a note explains that adding, transferring and removing is done by administration |

- **Heads of Department** (`pages/users/HeadsOfDepartment.tsx`, under User Management, Admin only): one card per department; appoint or change the head from its members.
- **★ My Department** (sidebar): an amber entrance loaded per user from `/department/staff/me`. It appears only for heads, whatever their role. The dashboard shows a matching banner.
- **My status** bar on the dashboard: everyone sets their own availability (Available, Busy, On leave, Off duty); the greeting shows their department.
- **Availability hints** in doctor dropdowns (booking, lab "send to") through `doctorLabel`.

## 13. Staff accounts

- **Register User and Edit User:** a **Department** dropdown. Picking a role pre-selects its usual department (`ROLE_DEPARTMENT_CODES`), and you can change it.
- **Users list and User details:** show the department.

## 14. Reports and settings

- **Reports** (`pages/reports/Index.tsx`, was a placeholder): appointment analytics for a date range: totals, completed, cancelled, no-show rate, a by-status bar chart, a per-doctor table, **Export CSV**.
- **Settings** (`pages/settings/Index.tsx`, was a placeholder): links to Departments and Staff, and the configured statuses with a warning if they haven't been seeded.

## 15. Tunnel and dev-server configuration

`vite.config.js`:

- **`server.allowedHosts: [".trycloudflare.com"]`** allows Cloudflare quick tunnels. They get a new random name each time they start, hence the wildcard.
- **`server.proxy["/api"]` → `http://localhost:8000`** (override with `API_PROXY_TARGET`). With `VITE_API_URL=/api/v1` the browser calls the API on whatever host served the page, so a single tunnel (port 5173) carries both the app and the API, with no CORS changes.
- **`@` alias:** `__dirname` is now computed for ESM, which also fixed a lint error.
