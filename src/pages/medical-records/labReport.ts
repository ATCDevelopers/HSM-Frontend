import type { FormFieldSchema } from "../../services/labTestConfigAPI";
import type { LabResultWithTemplate } from "../../services/emrAPI";
import type { Patient } from "../../services/patientAPI";

export const HOSPITAL_NAME = "HMS Hospital";

export const personName = (p?: { firstName: string; lastName: string } | null) => (p ? `${p.firstName} ${p.lastName}` : "—");

export const fieldFor = (result: LabResultWithTemplate, key: string): FormFieldSchema | undefined =>
  result.template?.formSchema?.find((f) => f.id === key);

export const rangeText = (field?: FormFieldSchema) => {
  const v = field?.validation;
  if (!v || (v.min === undefined && v.max === undefined)) return "";
  return `${v.min ?? "–"} – ${v.max ?? "–"}`;
};

export const isAbnormal = (field: FormFieldSchema | undefined, value: unknown) => {
  if (!field || field.type !== "number" || typeof value !== "number") return false;
  const v = field.validation;
  return (v?.min !== undefined && value < v.min) || (v?.max !== undefined && value > v.max);
};

export const abnormalCount = (result: LabResultWithTemplate) =>
  Object.entries(result.values ?? {}).filter(([key, value]) => isAbnormal(fieldFor(result, key), value)).length;

/** Rows in template order, so the printed and on-screen report match the form the lab filled in. */
export const resultRows = (result: LabResultWithTemplate) => {
  const values = result.values ?? {};
  const ordered = (result.template?.formSchema ?? []).filter((f) => f.id in values).map((f) => f.id);
  const extra = Object.keys(values).filter((k) => !ordered.includes(k));
  return [...ordered, ...extra].map((key) => {
    const field = fieldFor(result, key);
    return { key, label: field?.label ?? key, value: values[key], range: rangeText(field), abnormal: isAbnormal(field, values[key]) };
  });
};

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const ageOf = (dob?: string) => (dob ? `${Math.floor((Date.now() - new Date(dob).getTime()) / 31_557_600_000)} yrs` : "—");

const resultSection = (result: LabResultWithTemplate) => `
  <section class="result">
    <div class="result-head">
      <div><h2>${escapeHtml(result.template?.name ?? "Lab test")}</h2><span class="muted">${escapeHtml(result.template?.category ?? "")}</span></div>
      <div class="muted right">Reported ${escapeHtml(result.createdAt ? new Date(result.createdAt).toLocaleString() : "—")}</div>
    </div>
    <table>
      <thead><tr><th>Parameter</th><th>Result</th><th>Normal range</th><th>Flag</th></tr></thead>
      <tbody>
        ${resultRows(result)
          .map(
            (row) => `<tr class="${row.abnormal ? "abnormal" : ""}">
              <td>${escapeHtml(row.label)}</td><td><strong>${escapeHtml(row.value)}</strong></td>
              <td>${escapeHtml(row.range || "—")}</td><td>${row.abnormal ? "ABNORMAL" : ""}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>
    ${result.notes ? `<p class="notes"><strong>Lab notes:</strong> ${escapeHtml(result.notes)}</p>` : ""}
    <div class="sign">
      <div>Performed by: <strong>${escapeHtml(personName(result.technician))}</strong></div>
      <div>Sent to: <strong>${result.doctor ? `Dr. ${escapeHtml(personName(result.doctor))}` : "—"}</strong></div>
      <div>Signature: ____________________</div>
    </div>
  </section>`;

/** Opens a print-ready lab report (one result or the full history) in a new window and starts printing. */
export function printLabReport(patient: Patient | null, results: LabResultWithTemplate[]) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) {
    alert("Allow pop-ups for this site to print the lab report.");
    return;
  }
  const title = results.length === 1 ? `${results[0].template?.name ?? "Lab result"}` : "Laboratory history";
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)} - ${escapeHtml(patient ? `${patient.firstName} ${patient.lastName}` : "")}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:32px;font-size:13px}
    header{display:flex;justify-content:space-between;border-bottom:2px solid #1d4ed8;padding-bottom:10px;margin-bottom:16px}
    header h1{margin:0;color:#1d4ed8;font-size:22px} .muted{color:#6b7280;font-size:12px} .right{text-align:right}
    .patient{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 16px;background:#f3f4f6;padding:10px 12px;border-radius:6px;margin-bottom:18px}
    .result{page-break-inside:avoid;margin-bottom:26px} .result-head{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px}
    h2{margin:0;font-size:16px} table{width:100%;border-collapse:collapse} th,td{border:1px solid #d1d5db;padding:6px 8px;text-align:left}
    th{background:#eff6ff;font-size:12px} tr.abnormal td{background:#fef3c7} tr.abnormal td:last-child{color:#b45309;font-weight:bold}
    .notes{margin:8px 0;padding:8px;background:#eff6ff;border-radius:4px} .sign{display:flex;justify-content:space-between;margin-top:10px;font-size:12px}
    footer{margin-top:24px;border-top:1px solid #e5e7eb;padding-top:8px} @media print{body{margin:12mm}}
  </style></head><body>
  <header>
    <div><h1>${HOSPITAL_NAME}</h1><div class="muted">Laboratory Department</div></div>
    <div class="right"><strong>${escapeHtml(title)}</strong><div class="muted">Printed ${escapeHtml(new Date().toLocaleString())}</div></div>
  </header>
  ${
    patient
      ? `<div class="patient">
      <div><span class="muted">Patient</span><br><strong>${escapeHtml([patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" "))}</strong></div>
      <div><span class="muted">Gender / Age</span><br>${escapeHtml(patient.gender)} / ${escapeHtml(ageOf(patient.dateOfBirth))}</div>
      <div><span class="muted">Blood group</span><br>${escapeHtml(patient.bloodGroup || "—")}</div>
      <div><span class="muted">NHIF</span><br>${escapeHtml(patient.nhifCard || "—")}</div>
      <div><span class="muted">Phone</span><br>${escapeHtml(patient.phoneNumber)}</div>
      <div><span class="muted">Patient ID</span><br>${escapeHtml(patient.id)}</div>
    </div>`
      : ""
  }
  ${results.map(resultSection).join("")}
  <footer class="muted">Results flagged ABNORMAL fall outside the reference range configured for the test. Interpret alongside clinical findings.</footer>
  </body></html>`);
  win.document.close();
  win.focus();
  // Give the new window a moment to lay out before opening the print dialog.
  setTimeout(() => win.print(), 300);
}
