import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import { getErrorMessage } from "../../services/apiResponse";
import { patientAPI, type Patient } from "../../services/patientAPI";
import { invoiceAPI, invoiceItemAPI, generateInvoiceNumber, formatMoney } from "../../services/billingAPI";
import { statusAPI, MISSING_STATUSES_MESSAGE } from "../../services/statusAPI";

interface Line {
  serviceName: string;
  description: string;
  price: string;
}

const COMMON_SERVICES = ["Consultation fee", "Laboratory test", "Medication", "Procedure", "Registration fee", "Ward / bed charge"];
const fieldClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

export default function BillingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(searchParams.get("patientId") ?? "");
  const [unpaidStatusId, setUnpaidStatusId] = useState("");
  const [lines, setLines] = useState<Line[]>([{ serviceName: COMMON_SERVICES[0], description: "", price: "" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    patientAPI.list().then(setPatients).catch((e: unknown) => setError(getErrorMessage(e, "Failed to load patients")));
    statusAPI
      .list("invoice")
      .then((list) => {
        const unpaid = list.find((s) => s.name === "unpaid") ?? list[0];
        if (unpaid) setUnpaidStatusId(unpaid.id);
        else setError(MISSING_STATUSES_MESSAGE);
      })
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load statuses")));
  }, []);

  const updateLine = (index: number, patch: Partial<Line>) => setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const total = lines.reduce((sum, l) => sum + Number(l.price || 0), 0);

  const save = async () => {
    if (!patientId) return setError("Choose a patient.");
    if (!unpaidStatusId) return setError(MISSING_STATUSES_MESSAGE);
    const bad = lines.findIndex((l) => !l.serviceName.trim() || l.price === "" || Number(l.price) < 0);
    if (bad >= 0) return setError(`Line ${bad + 1}: enter a service and a price of 0 or more.`);

    setSaving(true);
    setError("");
    try {
      const invoice = await invoiceAPI.create({ invoiceNumber: generateInvoiceNumber(), patientId, statusId: unpaidStatusId });
      if (!invoice?.id) throw new Error("Invoice was not created");
      for (const line of lines) {
        await invoiceItemAPI.create({ invoiceId: invoice.id, serviceName: line.serviceName.trim(), description: line.description.trim() || undefined, price: Number(line.price).toFixed(2) });
      }
      await Swal.fire({ title: `Invoice ${invoice.invoiceNumber} created`, icon: "success", timer: 1400, showConfirmButton: false });
      navigate(`/billing/${invoice.id}`);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to create invoice"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseLayout resourceName="New Invoice">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Link to="/billing" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to billing</Link>
        <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">New invoice</h1>
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <label className="block space-y-1 text-sm font-medium text-gray-700">
            Patient *
            <select className={fieldClass} value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} · {p.phoneNumber}</option>)}
            </select>
          </label>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Charges</p>
            {lines.map((line, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1.4fr_2fr_1fr_auto]">
                <input list="billing-services" className={fieldClass} placeholder="Service" value={line.serviceName} onChange={(e) => updateLine(index, { serviceName: e.target.value })} />
                <input className={fieldClass} placeholder="Description (optional)" value={line.description} onChange={(e) => updateLine(index, { description: e.target.value })} />
                <input type="number" min="0" step="0.01" className={fieldClass} placeholder="Price" value={line.price} onChange={(e) => updateLine(index, { price: e.target.value })} />
                <button type="button" disabled={lines.length === 1} onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))} className="rounded-lg px-2 text-red-600 hover:bg-red-50 disabled:opacity-30" aria-label="Remove line">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <datalist id="billing-services">{COMMON_SERVICES.map((s) => <option key={s} value={s} />)}</datalist>
            <button type="button" onClick={() => setLines((prev) => [...prev, { serviceName: "", description: "", price: "" }])} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
              <PlusIcon className="h-4 w-4" /> Add charge
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-lg font-bold text-gray-900">Total: {formatMoney(total)}</p>
            <button type="button" disabled={saving} onClick={save} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Creating..." : "Create invoice"}
            </button>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
