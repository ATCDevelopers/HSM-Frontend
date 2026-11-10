import { useEffect, useState } from "react";
import { ExclamationTriangleIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { getErrorMessage } from "../../services/apiResponse";
import { balanceAPI, categoryLabel, formatMoney, PAYER_LABELS, type PatientBalance } from "../../services/billingAPI";
import { statusLabel } from "../../services/statusAPI";
import type { Patient } from "../../services/patientAPI";

const HOSPITAL_NAME = "HMS Hospital";

const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/** A small slip the receptionist can hand the patient before they go to the cashier. */
function printSlip(patient: Patient, balance: PatientBalance) {
  const win = window.open("", "_blank", "width=420,height=640");
  if (!win) return alert("Allow pop-ups for this site to print the slip.");
  const rows = [
    ...balance.invoices
      .filter((i) => !i.insured && (i.statusName === "unpaid" || i.statusName === "partially_paid"))
      .map((i) => `<tr><td>Invoice ${escapeHtml(i.invoiceNumber)} (${escapeHtml(statusLabel(i.statusName))})</td><td class="r">${formatMoney(i.total)}</td></tr>`),
    ...balance.pendingCharges.map(
      (c) => `<tr><td>${escapeHtml(c.serviceName)}${c.quantity > 1 ? ` × ${c.quantity}` : ""}</td><td class="r">${c.amount === null ? "pending" : formatMoney(c.amount)}</td></tr>`,
    ),
  ].join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Balance - ${escapeHtml(patient.firstName)} ${escapeHtml(patient.lastName)}</title>
  <style>body{font-family:Arial,sans-serif;margin:20px;font-size:13px}h1{font-size:16px;margin:0}table{width:100%;border-collapse:collapse;margin:12px 0}
  td{padding:4px 0;border-bottom:1px dashed #ccc}.r{text-align:right}.total{font-size:18px;font-weight:bold;border-top:2px solid #000;padding-top:8px;display:flex;justify-content:space-between}
  .muted{color:#666;font-size:11px}</style></head><body>
  <h1>${HOSPITAL_NAME}</h1><div class="muted">Patient balance · ${escapeHtml(new Date().toLocaleString())}</div>
  <p><strong>${escapeHtml([patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(" "))}</strong><br>
  <span class="muted">${escapeHtml(PAYER_LABELS[balance.paymentMode] ?? balance.paymentMode)} · ${escapeHtml(patient.phoneNumber)}</span></p>
  <table>${rows || '<tr><td>Nothing outstanding</td><td></td></tr>'}</table>
  <div class="total"><span>Amount due</span><span>TZS ${formatMoney(balance.amountDue)}</span></div>
  ${Number(balance.coveredByInsurance) > 0 ? `<p class="muted">Covered by ${escapeHtml(balance.paymentMode === "NHIF" ? "NHIF" : "insurance")}: TZS ${formatMoney(balance.coveredByInsurance)}</p>` : ""}
  ${balance.unpricedCount ? `<p class="muted">${balance.unpricedCount} service(s) still being priced; the final amount may be higher.</p>` : ""}
  <p class="muted">Please pay at the cashier's desk.</p></body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

interface PatientBalanceCardProps {
  patient: Patient;
  /** Compact mode for the dashboard: totals only, no line items. */
  compact?: boolean;
}

/** What a patient owes right now: cash charges not yet invoiced plus unpaid invoices, with insurance cover shown apart. */
export default function PatientBalanceCard({ patient, compact = false }: PatientBalanceCardProps) {
  const [balance, setBalance] = useState<PatientBalance | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setBalance(null);
    setError("");
    balanceAPI.get(patient.id).then(setBalance).catch((e: unknown) => setError(getErrorMessage(e, "Could not load balance")));
  }, [patient.id]);

  if (error) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>;
  if (!balance) return <p className="text-sm text-gray-400">Checking balance...</p>;

  const owes = Number(balance.amountDue) > 0;
  const openInvoices = balance.invoices.filter((i) => !i.insured && (i.statusName === "unpaid" || i.statusName === "partially_paid"));

  return (
    <div className="space-y-4">
      <div className={`flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between ${owes ? "bg-red-50 ring-1 ring-red-100" : "bg-green-50 ring-1 ring-green-100"}`}>
        <div>
          <p className={`text-sm font-semibold ${owes ? "text-red-700" : "text-green-700"}`}>{owes ? "Amount due" : "Nothing outstanding"}</p>
          <p className={`text-3xl font-bold ${owes ? "text-red-800" : "text-green-800"}`}>TZS {formatMoney(balance.amountDue)}</p>
          <p className="mt-1 text-xs text-gray-600">
            {PAYER_LABELS[balance.paymentMode]} patient
            {Number(balance.coveredByInsurance) > 0 && ` · TZS ${formatMoney(balance.coveredByInsurance)} covered by ${balance.paymentMode === "NHIF" ? "NHIF" : "insurance"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => printSlip(patient, balance)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:self-center"
        >
          <PrinterIcon className="h-4 w-4" /> Print slip
        </button>
      </div>

      {balance.unpricedCount > 0 && (
        <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
          {balance.unpricedCount} service{balance.unpricedCount === 1 ? " is" : "s are"} still being priced by billing, so the final amount may be higher.
        </p>
      )}

      {!compact && (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Unpaid invoices · TZS {formatMoney(balance.unpaidInvoices)}</h3>
            <ul className="mt-2 divide-y divide-gray-100 text-sm">
              {openInvoices.length === 0 && <li className="py-2 text-gray-400">None</li>}
              {openInvoices.map((i) => (
                <li key={i.id} className="flex justify-between gap-2 py-2">
                  <span>{i.invoiceNumber} <span className="text-xs text-gray-400">· {statusLabel(i.statusName)} · {new Date(i.createdAt).toLocaleDateString()}</span></span>
                  <span className="font-semibold">{formatMoney(i.total)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Services not yet invoiced · TZS {formatMoney(balance.notYetInvoiced)}</h3>
            <ul className="mt-2 divide-y divide-gray-100 text-sm">
              {balance.pendingCharges.length === 0 && <li className="py-2 text-gray-400">None</li>}
              {balance.pendingCharges.map((c) => (
                <li key={c.id} className="flex justify-between gap-2 py-2">
                  <span>{c.serviceName}{c.quantity > 1 && ` × ${c.quantity}`} <span className="text-xs text-gray-400">· {categoryLabel(c.category)}</span></span>
                  <span className="font-semibold">{c.amount === null ? <span className="text-xs text-amber-700">pricing</span> : formatMoney(c.amount)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
