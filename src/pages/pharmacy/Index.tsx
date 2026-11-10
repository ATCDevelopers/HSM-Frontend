import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import Table from "../../components/sections/Table";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import { medicineAPI, prescriptionAPI, prescriptionItemAPI, type Medicine, type Prescription, type PrescriptionItem } from "../../services/pharmacyAPI";
import { statusAPI, statusLabel, type Status } from "../../services/statusAPI";
import { formatMoney } from "../../services/billingAPI";

const LOW_STOCK_THRESHOLD = 10;
type Tab = "dispensing" | "medicines";
const QUEUE_FILTERS = ["pending", "dispensed", "cancelled", ""] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  dispensed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-200 text-gray-600",
};

/**
 * Pharmacy: the dispensing queue (prescriptions written by doctors, checked against stock and
 * dispensed in one step that deducts stock) and the medicine catalogue.
 */
function Pharmacy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = can("update", "Medicine", user?.role);
  const canDispense = can("update", "Prescription", user?.role);
  const canSeeQueue = can("read", "Prescription", user?.role);

  const [tab, setTab] = useState<Tab>(canSeeQueue ? "dispensing" : "medicines");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineStatuses, setMedicineStatuses] = useState<Status[]>([]);
  const [prescriptionStatuses, setPrescriptionStatuses] = useState<Status[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [queueStatus, setQueueStatus] = useState<(typeof QUEUE_FILTERS)[number]>("pending");
  const [queue, setQueue] = useState<Prescription[]>([]);
  const [items, setItems] = useState<Record<string, PrescriptionItem[]>>({});
  const [patientQuery, setPatientQuery] = useState("");
  const [busyId, setBusyId] = useState("");

  const loadMedicines = useCallback(
    () =>
      medicineAPI
        .list()
        .then(setMedicines)
        .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load medicines")))
        .finally(() => setLoading(false)),
    [],
  );

  const loadQueue = useCallback(async () => {
    if (!canSeeQueue) return;
    try {
      const list = await prescriptionAPI.list(queueStatus);
      setQueue(list);
      const entries = await Promise.all(list.map(async (p) => [p.id, await prescriptionItemAPI.listByPrescription(p.id).catch(() => [])] as const));
      setItems(Object.fromEntries(entries));
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to load prescriptions"));
    }
  }, [canSeeQueue, queueStatus]);

  useEffect(() => {
    loadMedicines();
    statusAPI.list("medicine").then(setMedicineStatuses).catch(() => undefined);
    statusAPI.list("prescription").then(setPrescriptionStatuses).catch(() => undefined);
  }, [loadMedicines]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const medicineById = Object.fromEntries(medicines.map((m) => [m.id, m]));
  const medicineStatusName = (id: string) => medicineStatuses.find((s) => s.id === id)?.name;

  /** Lines whose medicine doesn't have enough stock; the backend re-checks this inside its transaction. */
  const shortages = (p: Prescription) =>
    (items[p.id] ?? []).filter((item) => (medicineById[item.medicineId]?.stock ?? 0) < item.quantity);

  const dispense = async (p: Prescription) => {
    const lines = items[p.id] ?? [];
    const confirm = await Swal.fire({
      title: `Dispense to ${p.patientName}?`,
      html: `<ul style="text-align:left">${lines
        .map((i) => {
          const m = medicineById[i.medicineId];
          return `<li><b>${m ? `${m.genericName} ${m.strength}` : "Medicine"}</b> × ${i.quantity} — ${i.dosage}, ${i.frequency}×/day, ${i.durationOfTime}</li>`;
        })
        .join("")}</ul><p style="font-size:13px;color:#6b7280">Stock will be deducted immediately.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Dispense",
      confirmButtonColor: "#16a34a",
    });
    if (!confirm.isConfirmed) return;

    setBusyId(p.id);
    try {
      const result = await prescriptionAPI.dispense(p.id);
      await Swal.fire({
        title: "Dispensed",
        html: `<ul style="text-align:left">${(result?.dispensed ?? [])
          .map((d) => `<li>${d.medicine}: −${d.quantity} → <b>${d.remainingStock}</b> left${d.remainingStock <= LOW_STOCK_THRESHOLD ? " ⚠️ low" : ""}</li>`)
          .join("")}</ul>`,
        icon: "success",
      });
      await Promise.all([loadQueue(), loadMedicines()]);
    } catch (e: unknown) {
      Swal.fire("Could not dispense", getErrorMessage(e), "error");
      loadMedicines();
    } finally {
      setBusyId("");
    }
  };

  const cancel = async (p: Prescription) => {
    const status = prescriptionStatuses.find((s) => s.name === "cancelled");
    if (!status) return Swal.fire("Missing status", 'No "cancelled" prescription status is configured.', "error");
    const confirm = await Swal.fire({ title: `Cancel ${p.patientName}'s prescription?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Cancel prescription" });
    if (!confirm.isConfirmed) return;
    try {
      await prescriptionAPI.update(p.id, { statusId: status.id });
      loadQueue();
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e, "Failed to cancel prescription"), "error");
    }
  };

  const removeMedicine = async (m: Medicine) => {
    const confirm = await Swal.fire({ title: `Delete ${m.genericName}?`, icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Delete" });
    if (!confirm.isConfirmed) return;
    try {
      await medicineAPI.remove(m.id);
      setMedicines((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e, "Failed to delete medicine"), "error");
    }
  };

  const term = filter.trim().toLowerCase();
  const visibleMedicines = medicines.filter((m) => !term || [m.code, m.genericName, m.drugName].some((v) => v.toLowerCase().includes(term)));
  const patientTerm = patientQuery.trim().toLowerCase();
  const visibleQueue = queue.filter((p) => !patientTerm || (p.patientName ?? "").toLowerCase().includes(patientTerm));
  const lowStock = medicines.filter((m) => m.stock <= LOW_STOCK_THRESHOLD).length;

  const columns = [
    { key: "code", title: "Code" },
    { key: "genericName", title: "Generic name", render: (v: string, m: Medicine) => <span className="font-semibold text-gray-900">{v}<span className="block text-xs font-normal text-gray-400">{m.drugName}</span></span> },
    { key: "strength", title: "Strength", render: (v: string, m: Medicine) => `${v} · ${m.dosageForm}` },
    { key: "price", title: "Price", render: (v: string) => formatMoney(v) },
    { key: "stock", title: "Stock", render: (v: number) => <span className={v <= LOW_STOCK_THRESHOLD ? "font-semibold text-red-600" : "text-gray-700"}>{v}</span> },
    { key: "statusId", title: "Status", render: (v: string) => statusLabel(medicineStatusName(v)) },
    ...(canManage
      ? [{
          key: "actions",
          title: "",
          render: (_: unknown, m: Medicine) => (
            <div className="flex gap-2">
              <button onClick={() => navigate(`/pharmacy/${m.id}/edit`)} className="text-sm font-medium text-blue-600 hover:underline">Edit</button>
              <button onClick={() => removeMedicine(m)} className="text-sm font-medium text-red-600 hover:underline">Delete</button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <BaseLayout resourceName="Pharmacy">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
            <p className="text-sm text-gray-500">
              {canSeeQueue && `${queueStatus === "pending" ? queue.length : "—"} waiting to be dispensed · `}
              {medicines.length} medicines · <span className={lowStock ? "font-semibold text-red-600" : ""}>{lowStock} low on stock</span>
            </p>
          </div>
          {canManage && (
            <button onClick={() => navigate("/pharmacy/new")} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              <PlusIcon className="h-4 w-4" /> Add medicine
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {(canSeeQueue ? (["dispensing", "medicines"] as Tab[]) : (["medicines"] as Tab[])).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 ring-1 ring-gray-200"}`}>
              {t === "medicines" ? "Medicines" : "Dispensing queue"}
            </button>
          ))}
        </div>

        {error && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

        {tab === "medicines" ? (
          <>
            <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by code, generic or brand name..." className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
            <Table columns={columns} data={visibleMedicines} loading={loading} emptyMessage="No medicines registered yet." />
          </>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-1.5">
                {QUEUE_FILTERS.map((s) => (
                  <button key={s || "all"} onClick={() => setQueueStatus(s)} className={`rounded-full px-3 py-1 text-xs font-semibold ${queueStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {s ? statusLabel(s) : "All"}
                  </button>
                ))}
              </div>
              <div className="relative sm:ml-auto sm:w-72">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={patientQuery} onChange={(e) => setPatientQuery(e.target.value)} placeholder="Filter by patient name..." className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            {visibleQueue.length === 0 && (
              <p className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                {queueStatus === "pending" ? "No prescriptions waiting. New ones appear here as soon as a doctor saves them." : "No prescriptions in this list."}
              </p>
            )}

            {visibleQueue.map((p) => {
              const short = shortages(p);
              const lines = items[p.id] ?? [];
              return (
                <article key={p.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.patientName}</h3>
                      <p className="text-xs text-gray-500">Prescribed by Dr. {p.doctorName} · {new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[p.statusName ?? ""] ?? "bg-blue-50 text-blue-700"}`}>{statusLabel(p.statusName)}</span>
                  </div>

                  <ul className="mt-3 space-y-1.5 text-sm">
                    {lines.length === 0 && <li className="text-gray-400">No medicines on this prescription.</li>}
                    {lines.map((item) => {
                      const med = medicineById[item.medicineId];
                      const enough = (med?.stock ?? 0) >= item.quantity;
                      const pending = p.statusName === "pending";
                      return (
                        <li key={item.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 ${pending && !enough ? "bg-red-50" : "bg-gray-50"}`}>
                          <span>
                            <strong>{med ? `${med.genericName} ${med.strength}` : "Medicine"}</strong> × {item.quantity}
                            <span className="text-gray-500"> — {item.dosage}, {item.frequency}×/day, {item.durationOfTime}{item.instruction && `, ${item.instruction}`}</span>
                          </span>
                          {pending && (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${enough ? "text-green-700" : "text-red-600"}`}>
                              {enough ? <CheckCircleIcon className="h-4 w-4" /> : <ExclamationTriangleIcon className="h-4 w-4" />}
                              {med ? `${med.stock} in stock` : "not in catalogue"}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {p.notes && <p className="mt-2 text-sm text-gray-500">Doctor's note: {p.notes}</p>}

                  {canDispense && p.statusName === "pending" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => dispense(p)}
                        disabled={busyId === p.id || short.length > 0 || lines.length === 0}
                        className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busyId === p.id ? "Dispensing..." : "Dispense"}
                      </button>
                      <button onClick={() => cancel(p)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">Cancel</button>
                      {short.length > 0 && <span className="text-xs font-medium text-red-600">Not enough stock. Restock under Medicines, then dispense.</span>}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </BaseLayout>
  );
}

export default Pharmacy;
