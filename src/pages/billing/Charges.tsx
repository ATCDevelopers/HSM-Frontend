import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import Modal from "../../components/atoms/ui/Modal";
import PatientPicker from "../../components/sections/PatientPicker";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import {
  BILLING_CATEGORIES,
  PAYER_LABELS,
  billingServiceAPI,
  categoryLabel,
  chargeAPI,
  type BillableService,
  formatMoney,
  type ChargeStatus,
  type Payer,
  type ServiceCharge,
} from "../../services/billingAPI";

const STATUS_FILTERS: { id: ChargeStatus | ""; label: string }[] = [
  { id: "unbilled", label: "Not yet invoiced" },
  { id: "invoiced", label: "Invoiced" },
  { id: "waived", label: "Waived" },
  { id: "", label: "All" },
];

const PAYER_STYLES: Record<Payer, string> = {
  CASH: "bg-emerald-50 text-emerald-700",
  NHIF: "bg-sky-50 text-sky-700",
  INSURANCE: "bg-violet-50 text-violet-700",
};

const sum = (charges: ServiceCharge[]) => charges.reduce((total, c) => total + Number(c.amount ?? 0), 0);

/**
 * Charges recorded automatically as patients move through the hospital (registration, consultations,
 * vitals, lab tests, dispensed medicines), grouped by patient so billing can invoice them.
 */
export default function BillingCharges() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canInvoice = can("create", "Billing", user?.role);
  const canWaive = can("update", "Billing", user?.role);

  const [charges, setCharges] = useState<ServiceCharge[]>([]);
  const [status, setStatus] = useState<ChargeStatus | "">("unbilled");
  const [category, setCategory] = useState("");
  const [payer, setPayer] = useState<Payer | "">("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [services, setServices] = useState<BillableService[]>([]);
  const [manual, setManual] = useState({ patientId: "", serviceId: "", quantity: "1", description: "" });

  const openAdd = () => {
    setAdding(true);
    if (services.length === 0) billingServiceAPI.list().then((rows) => setServices(rows.filter((s) => s.isActive))).catch(() => undefined);
  };

  const submitManual = async () => {
    if (!manual.patientId || !manual.serviceId) return Swal.fire("Missing details", "Choose a patient and a service.", "warning");
    try {
      await chargeAPI.add({ patientId: manual.patientId, serviceId: manual.serviceId, quantity: Number(manual.quantity) || 1, description: manual.description || undefined });
      setAdding(false);
      setManual({ patientId: "", serviceId: "", quantity: "1", description: "" });
      load();
    } catch (e: unknown) {
      Swal.fire("Could not add charge", getErrorMessage(e), "error");
    }
  };

  const load = useCallback(() => {
    setLoading(true);
    chargeAPI
      .list({ status, category, payer })
      .then((rows) => {
        setCharges(rows);
        setSelected(new Set());
        setError("");
      })
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load charges")))
      .finally(() => setLoading(false));
  }, [status, category, payer]);

  useEffect(load, [load]);

  const term = search.trim().toLowerCase();
  const visible = charges.filter((c) => !term || `${c.patientFirstName} ${c.patientLastName}`.toLowerCase().includes(term));

  const byPatient = useMemo(() => {
    const groups = new Map<string, { name: string; charges: ServiceCharge[] }>();
    visible.forEach((c) => {
      const g = groups.get(c.patientId) ?? { name: `${c.patientFirstName} ${c.patientLastName}`, charges: [] };
      g.charges.push(c);
      groups.set(c.patientId, g);
    });
    return [...groups.entries()];
  }, [visible]);

  const totalsByCategory = BILLING_CATEGORIES.map((cat) => {
    const rows = visible.filter((c) => c.category === cat.id);
    return { ...cat, count: rows.length, total: sum(rows) };
  }).filter((c) => c.count > 0);
  const unpriced = visible.filter((c) => c.amount === null && c.status === "unbilled").length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const invoicable = (rows: ServiceCharge[]) => rows.filter((c) => c.status === "unbilled" && c.amount !== null);

  const createInvoice = async (patientId: string, name: string, rows: ServiceCharge[]) => {
    const picked = rows.filter((c) => selected.has(c.id));
    const chosen = picked.length ? picked : invoicable(rows);
    if (chosen.some((c) => c.amount === null)) return Swal.fire("Unpriced charges", "Set prices for the selected services first.", "warning");
    if (chosen.length === 0) return Swal.fire("Nothing to invoice", "This patient has no priced, uninvoiced charges.", "info");
    const confirm = await Swal.fire({
      title: `Invoice ${name}?`,
      text: `${chosen.length} charge(s), total ${formatMoney(sum(chosen))}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Create invoice",
    });
    if (!confirm.isConfirmed) return;
    try {
      const invoice = await chargeAPI.invoice(patientId, chosen.map((c) => c.id));
      await Swal.fire({ title: `Invoice ${invoice?.invoiceNumber ?? ""} created`, icon: "success", timer: 1400, showConfirmButton: false });
      if (invoice?.id) navigate(`/billing/${invoice.id}`);
      else load();
    } catch (e: unknown) {
      Swal.fire("Could not create invoice", getErrorMessage(e), "error");
      load();
    }
  };

  const setWaived = async (charge: ServiceCharge, waived: boolean) => {
    if (waived) {
      const confirm = await Swal.fire({ title: `Waive ${charge.serviceName}?`, text: "The patient will not be billed for it.", icon: "warning", showCancelButton: true, confirmButtonText: "Waive" });
      if (!confirm.isConfirmed) return;
    }
    try {
      await chargeAPI.setWaived(charge.id, waived);
      load();
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e), "error");
    }
  };

  return (
    <BaseLayout resourceName="Patient Charges">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient charges</h1>
            <p className="text-sm text-gray-500">Every service a patient receives is recorded here automatically. Select charges and turn them into an invoice.</p>
          </div>
          {canInvoice && (
            <button onClick={openAdd} className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <PlusIcon className="h-4 w-4" /> Add charge
            </button>
          )}
        </div>

        {totalsByCategory.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {totalsByCategory.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(category === c.id ? "" : c.id)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition ${category === c.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{c.label}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{formatMoney(c.total)}</p>
                <p className="text-xs text-gray-400">{c.count} charge{c.count === 1 ? "" : "s"}</p>
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient..." className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
          <select value={status} onChange={(e) => setStatus(e.target.value as ChargeStatus | "")} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm">
            {STATUS_FILTERS.map((s) => <option key={s.id || "all"} value={s.id}>{s.label}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm">
            <option value="">All departments</option>
            {BILLING_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={payer} onChange={(e) => setPayer(e.target.value as Payer | "")} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm">
            <option value="">Cash and insured</option>
            {(Object.keys(PAYER_LABELS) as Payer[]).map((p) => <option key={p} value={p}>{PAYER_LABELS[p]}</option>)}
          </select>
        </div>

        {unpriced > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
            {unpriced} charge{unpriced === 1 ? " is" : "s are"} waiting for a price.{" "}
            <Link to="/billing/services?unpriced=1" className="font-semibold underline">Set prices</Link> and they update automatically.
          </div>
        )}
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading && <p className="text-sm text-gray-400">Loading charges...</p>}
        {!loading && byPatient.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No charges match these filters.</p>}

        <Modal isOpen={adding} onClose={() => setAdding(false)} title="Add a charge" size="lg">
          <div className="space-y-4">
            <p className="text-xs text-gray-500">For services that aren't charged automatically, such as custom services added under Service Prices.</p>
            <PatientPicker value={manual.patientId} onChange={(p) => setManual({ ...manual, patientId: p?.id ?? "" })} />
            <select value={manual.serviceId} onChange={(e) => setManual({ ...manual, serviceId: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm">
              <option value="">Select service</option>
              {BILLING_CATEGORIES.map((cat) => (
                <optgroup key={cat.id} label={cat.label}>
                  {services.filter((s) => s.category === cat.id).map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.price === null ? "no price yet" : formatMoney(s.price)}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
              <input type="number" min="1" value={manual.quantity} onChange={(e) => setManual({ ...manual, quantity: e.target.value })} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" aria-label="Quantity" />
              <input value={manual.description} onChange={(e) => setManual({ ...manual, description: e.target.value })} placeholder="Note (optional)" className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAdding(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
              <button onClick={submitManual} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add charge</button>
            </div>
          </div>
        </Modal>

        {byPatient.map(([patientId, group]) => {
          const ready = invoicable(group.charges);
          return (
            <section key={patientId} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <header className="flex flex-col gap-2 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button onClick={() => navigate(`/patients/${patientId}`)} className="text-left font-semibold text-gray-900 hover:text-blue-700">{group.name}</button>
                  <p className="text-xs text-gray-500">{group.charges.length} charge{group.charges.length === 1 ? "" : "s"} · total {formatMoney(sum(group.charges))}</p>
                </div>
                {canInvoice && ready.length > 0 && (
                  <button onClick={() => createInvoice(patientId, group.name, group.charges)} className="self-start rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 sm:self-center">
                    {group.charges.some((c) => selected.has(c.id)) ? "Invoice selected" : `Invoice all (${ready.length})`}
                  </button>
                )}
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <tbody className="divide-y divide-gray-50">
                    {group.charges.map((c) => (
                      <tr key={c.id} className={c.status === "waived" ? "text-gray-400 line-through" : ""}>
                        <td className="w-8 px-4 py-2.5">
                          {canInvoice && c.status === "unbilled" && c.amount !== null && (
                            <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} className="accent-blue-600" aria-label={`Select ${c.serviceName}`} />
                          )}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</td>
                        <td className="px-2 py-2.5">
                          <p className="font-medium text-gray-900">{c.serviceName}</p>
                          <p className="text-xs text-gray-400">{categoryLabel(c.category)} · {c.department}{c.description && ` · ${c.description}`}</p>
                        </td>
                        <td className="px-2 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PAYER_STYLES[c.payer]}`}>{PAYER_LABELS[c.payer]}</span></td>
                        <td className="whitespace-nowrap px-2 py-2.5 text-right">
                          {c.amount === null ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">Unpriced</span>
                          ) : (
                            <span className="font-semibold text-gray-900">{formatMoney(c.amount)}</span>
                          )}
                          {c.quantity > 1 && c.unitPrice && <span className="block text-[11px] text-gray-400">{c.quantity} × {formatMoney(c.unitPrice)}</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-right text-xs">
                          {c.status === "invoiced" && c.invoiceId && (
                            <button onClick={() => navigate(`/billing/${c.invoiceId}`)} className="font-semibold text-blue-600 hover:underline">View invoice</button>
                          )}
                          {canWaive && c.status === "unbilled" && <button onClick={() => setWaived(c, true)} className="font-semibold text-gray-500 hover:text-red-600">Waive</button>}
                          {canWaive && c.status === "waived" && <button onClick={() => setWaived(c, false)} className="font-semibold text-blue-600 no-underline hover:underline">Restore</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </BaseLayout>
  );
}
