import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import { useAuth } from "../../auth/AuthContext";
import { getErrorMessage } from "../../services/apiResponse";
import { medicineAPI, prescriptionAPI, prescriptionItemAPI, type Medicine } from "../../services/pharmacyAPI";
import { statusAPI, MISSING_STATUSES_MESSAGE } from "../../services/statusAPI";
import { patientAPI, type Patient } from "../../services/patientAPI";

interface ItemRow {
  medicineId: string;
  dosage: string;
  frequency: string;
  durationOfTime: string;
  quantity: string;
  instruction: string;
}

const blankItem = (): ItemRow => ({ medicineId: "", dosage: "", frequency: "1", durationOfTime: "", quantity: "1", instruction: "" });
const fieldClass = "w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:border-blue-500 focus:outline-none";

export default function PrescriptionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const patientId = searchParams.get("patientId") ?? "";
  const backUrl = patientId ? `/medical-records/${patientId}` : "/medical-records";

  const [patient, setPatient] = useState<Patient | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pendingStatusId, setPendingStatusId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([blankItem()]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patientId) patientAPI.get(patientId).then(setPatient).catch(() => undefined);
    medicineAPI.list().then(setMedicines).catch((e: unknown) => setError(getErrorMessage(e, "Failed to load medicines")));
    statusAPI
      .list("prescription")
      .then((statuses) => {
        const pending = statuses.find((s) => s.name === "pending") ?? statuses[0];
        if (pending) setPendingStatusId(pending.id);
        else setError(MISSING_STATUSES_MESSAGE);
      })
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load statuses")));
  }, [patientId]);

  const updateItem = (index: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const save = async () => {
    if (!patientId || !user?.id) return setError("Open this form from a patient's medical record.");
    if (!pendingStatusId) return setError(MISSING_STATUSES_MESSAGE);
    const incomplete = items.findIndex((i) => !i.medicineId || !i.dosage.trim() || !i.durationOfTime.trim() || Number(i.quantity) < 1);
    if (incomplete >= 0) return setError(`Line ${incomplete + 1}: choose a medicine and fill in dosage, duration and quantity.`);

    setSaving(true);
    setError("");
    try {
      const prescription = await prescriptionAPI.create({ patientId, doctorId: user.id, statusId: pendingStatusId, notes: notes.trim() || undefined });
      if (!prescription?.id) throw new Error("Prescription was not created");
      for (const item of items) {
        await prescriptionItemAPI.create({
          prescriptionId: prescription.id,
          medicineId: item.medicineId,
          dosage: item.dosage.trim(),
          frequency: item.frequency,
          durationOfTime: item.durationOfTime.trim(),
          quantity: Number(item.quantity),
          instruction: item.instruction.trim() || null,
        });
      }
      await Swal.fire({ title: "Prescription saved", icon: "success", timer: 1300, showConfirmButton: false });
      navigate(backUrl);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to save prescription"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseLayout resourceName="New Prescription">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Link to={backUrl} className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to medical record</Link>

        <section className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New prescription</h1>
            <p className="text-sm text-gray-500">{patient ? `For ${patient.firstName} ${patient.lastName}` : "Patient record"} · sent to the pharmacy queue as pending</p>
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-6">
                <select className={`${fieldClass} sm:col-span-2`} value={item.medicineId} onChange={(e) => updateItem(index, { medicineId: e.target.value })}>
                  <option value="">Medicine</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>{m.genericName} ({m.drugName}) {m.strength} · {m.dosageForm} · stock {m.stock}</option>
                  ))}
                </select>
                <input className={fieldClass} placeholder="Dosage e.g. 500mg" value={item.dosage} onChange={(e) => updateItem(index, { dosage: e.target.value })} />
                <label className="flex items-center gap-1 text-xs text-gray-500">
                  <input type="number" min="0.5" step="0.5" className={fieldClass} value={item.frequency} onChange={(e) => updateItem(index, { frequency: e.target.value })} />
                  ×/day
                </label>
                <input className={fieldClass} placeholder="Duration e.g. 7 days" value={item.durationOfTime} onChange={(e) => updateItem(index, { durationOfTime: e.target.value })} />
                <input type="number" min="1" className={fieldClass} placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(index, { quantity: e.target.value })} />
                <input className={`${fieldClass} sm:col-span-5`} placeholder="Instruction e.g. take after meals" value={item.instruction} onChange={(e) => updateItem(index, { instruction: e.target.value })} />
                <button
                  type="button"
                  disabled={items.length === 1}
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  className="inline-flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-30"
                >
                  <TrashIcon className="h-4 w-4" /> Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setItems((prev) => [...prev, blankItem()])} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
              <PlusIcon className="h-4 w-4" /> Add medicine
            </button>
          </div>

          <textarea rows={2} className={fieldClass} placeholder="Notes for the pharmacist (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(backUrl)} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="button" disabled={saving} onClick={save} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving ? "Saving..." : "Save prescription"}
            </button>
          </div>
        </section>
      </div>
    </BaseLayout>
  );
}
