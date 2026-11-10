import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import { getErrorMessage } from "../../services/apiResponse";
import { medicineAPI, type MedicinePayload } from "../../services/pharmacyAPI";
import { statusAPI, statusLabel, MISSING_STATUSES_MESSAGE, type Status } from "../../services/statusAPI";

const DOSAGE_FORMS = ["Tablet", "Capsule", "Syrup", "Suspension", "Injection", "Cream", "Ointment", "Drops", "Inhaler"];
const fieldClass = "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

const EMPTY: MedicinePayload = { code: "", genericName: "", drugName: "", dosageForm: DOSAGE_FORMS[0], strength: "", price: "", stock: 0, statusId: "" };

/** Create (/pharmacy/new) or edit (/pharmacy/:id/edit) a medicine. */
function PharmacyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<MedicinePayload>(EMPTY);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    statusAPI
      .list("medicine")
      .then((list) => {
        setStatuses(list);
        if (list.length === 0) setError(MISSING_STATUSES_MESSAGE);
        else if (!id) setForm((prev) => ({ ...prev, statusId: (list.find((s) => s.name === "in_stock") ?? list[0]).id }));
      })
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load statuses")));
    if (id) {
      medicineAPI
        .get(id)
        .then(({ code, genericName, drugName, dosageForm, strength, price, stock, statusId }) =>
          setForm({ code, genericName, drugName, dosageForm, strength, price, stock, statusId }),
        )
        .catch((e: unknown) => setError(getErrorMessage(e, "Medicine not found")));
    }
  }, [id]);

  const set = <K extends keyof MedicinePayload>(key: K, value: MedicinePayload[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.genericName.trim() || !form.drugName.trim() || !form.strength.trim() || form.price === "" || !form.statusId) {
      return setError("All fields are required.");
    }
    setSaving(true);
    setError("");
    const payload = { ...form, code: form.code.trim().toUpperCase(), price: String(form.price), stock: Number(form.stock) };
    try {
      if (id) await medicineAPI.update(id, payload);
      else await medicineAPI.create(payload);
      await Swal.fire({ title: id ? "Medicine updated" : "Medicine added", icon: "success", timer: 1200, showConfirmButton: false });
      navigate("/pharmacy");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save medicine"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseLayout resourceName={id ? "Edit Medicine" : "Add Medicine"}>
      <form onSubmit={submit} className="mx-auto w-full max-w-3xl space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-8">
        <Link to="/pharmacy" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to pharmacy</Link>
        <h1 className="text-2xl font-bold text-gray-900">{id ? "Edit medicine" : "Add medicine"}</h1>
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-gray-700">Code / barcode *<input className={fieldClass} value={form.code} onChange={(e) => set("code", e.target.value)} /></label>
          <label className="space-y-1 text-sm font-medium text-gray-700">Status *
            <select className={fieldClass} value={form.statusId} onChange={(e) => set("statusId", e.target.value)}>
              <option value="">Select status</option>
              {statuses.map((s) => <option key={s.id} value={s.id}>{statusLabel(s.name)}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">Generic name *<input className={fieldClass} placeholder="Paracetamol" value={form.genericName} onChange={(e) => set("genericName", e.target.value)} /></label>
          <label className="space-y-1 text-sm font-medium text-gray-700">Brand name *<input className={fieldClass} placeholder="Panadol" value={form.drugName} onChange={(e) => set("drugName", e.target.value)} /></label>
          <label className="space-y-1 text-sm font-medium text-gray-700">Dosage form *
            <select className={fieldClass} value={form.dosageForm} onChange={(e) => set("dosageForm", e.target.value)}>
              {DOSAGE_FORMS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">Strength *<input className={fieldClass} placeholder="500mg" value={form.strength} onChange={(e) => set("strength", e.target.value)} /></label>
          <label className="space-y-1 text-sm font-medium text-gray-700">Unit price *<input type="number" min="0" step="0.01" className={fieldClass} value={form.price} onChange={(e) => set("price", e.target.value)} /></label>
          <label className="space-y-1 text-sm font-medium text-gray-700">Stock *<input type="number" min="0" className={fieldClass} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} /></label>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/pharmacy")} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </BaseLayout>
  );
}

export default PharmacyForm;
