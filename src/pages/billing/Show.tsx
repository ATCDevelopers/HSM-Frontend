import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PrinterIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import { invoiceAPI, invoiceItemAPI, invoicePatientName, invoiceTotal, formatMoney, type Invoice, type InvoiceItem } from "../../services/billingAPI";
import { statusAPI, statusLabel, type Status } from "../../services/statusAPI";

const fieldClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export default function BillingShow() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canEdit = can("update", "Billing", user?.role);
  const canDelete = can("delete", "Billing", user?.role);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [draft, setDraft] = useState({ serviceName: "", description: "", price: "" });
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([invoiceAPI.get(id), invoiceItemAPI.listByInvoice(id)])
      .then(([inv, lines]) => {
        setInvoice(inv);
        setItems(lines);
      })
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load invoice")));
  }, [id]);

  useEffect(() => {
    load();
    statusAPI.list("invoice").then(setStatuses).catch(() => undefined);
  }, [load]);

  const changeStatus = async (statusId: string) => {
    try {
      await invoiceAPI.update(id, { statusId });
      load();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to update status"));
    }
  };

  const addItem = async () => {
    if (!draft.serviceName.trim() || draft.price === "" || Number(draft.price) < 0) return setError("Enter a service and a price of 0 or more.");
    try {
      await invoiceItemAPI.create({ invoiceId: id, serviceName: draft.serviceName.trim(), description: draft.description.trim() || undefined, price: Number(draft.price).toFixed(2) });
      setDraft({ serviceName: "", description: "", price: "" });
      setError("");
      load();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to add charge"));
    }
  };

  const removeItem = async (item: InvoiceItem) => {
    try {
      await invoiceItemAPI.remove(item.id);
      load();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to remove charge"));
    }
  };

  const removeInvoice = async () => {
    const confirm = await Swal.fire({ title: "Delete this invoice?", text: "Its charges are deleted too.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Delete" });
    if (!confirm.isConfirmed) return;
    try {
      await invoiceAPI.remove(id);
      navigate("/billing");
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to delete invoice"));
    }
  };

  if (!invoice) {
    return (
      <BaseLayout resourceName="Invoice">
        <div className="rounded-2xl bg-white p-8 text-sm text-gray-500 shadow-sm">{error || "Loading invoice..."}</div>
      </BaseLayout>
    );
  }

  const locked = invoice.statusName === "paid" || invoice.statusName === "void";

  return (
    <BaseLayout resourceName="Invoice">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Link to="/billing" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to billing</Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <PrinterIcon className="h-4 w-4" /> Print
          </button>
        </div>

        <section className="space-y-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">Invoice</p>
              <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
              <p className="mt-1 text-sm text-gray-500">{invoicePatientName(invoice)} · {new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
            {canEdit ? (
              <select value={invoice.statusId} onChange={(e) => changeStatus(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold print:hidden">
                {statuses.map((s) => <option key={s.id} value={s.id}>{statusLabel(s.name)}</option>)}
              </select>
            ) : (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{statusLabel(invoice.statusName)}</span>
            )}
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 print:hidden">{error}</div>}

          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr><th className="py-2">Service</th><th className="py-2">Description</th><th className="py-2 text-right">Amount</th><th className="print:hidden" /></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">No charges yet.</td></tr>}
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 font-medium text-gray-900">{item.serviceName}</td>
                  <td className="py-2.5 text-gray-500">{item.description || "—"}</td>
                  <td className="py-2.5 text-right">{formatMoney(item.price)}</td>
                  <td className="w-8 text-right print:hidden">
                    {canEdit && !locked && (
                      <button onClick={() => removeItem(item)} className="text-red-500 hover:text-red-700" aria-label="Remove charge"><TrashIcon className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200"><td colSpan={2} className="py-3 text-right font-semibold">Total</td><td className="py-3 text-right text-lg font-bold">{formatMoney(invoiceTotal(items))}</td><td /></tr>
            </tfoot>
          </table>

          {canEdit && !locked && (
            <div className="grid gap-2 border-t border-gray-100 pt-4 sm:grid-cols-[1.4fr_2fr_1fr_auto] print:hidden">
              <input className={fieldClass} placeholder="Service" value={draft.serviceName} onChange={(e) => setDraft({ ...draft, serviceName: e.target.value })} />
              <input className={fieldClass} placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <input type="number" min="0" step="0.01" className={fieldClass} placeholder="Price" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
              <button onClick={addItem} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add</button>
            </div>
          )}
        </section>

        {canDelete && (
          <div className="flex justify-end print:hidden">
            <button onClick={removeInvoice} className="text-sm font-semibold text-red-600 hover:underline">Delete invoice</button>
          </div>
        )}
      </div>
    </BaseLayout>
  );
}
