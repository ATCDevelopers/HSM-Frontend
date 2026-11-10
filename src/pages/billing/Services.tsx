import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import BaseLayout from "../../components/layouts/BaseLayout";
import Modal from "../../components/atoms/ui/Modal";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import { BILLING_CATEGORIES, billingServiceAPI, formatMoney, type BillableService } from "../../services/billingAPI";

const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none";

/**
 * Service price list. New lab tests, medicines and appointment types appear here on their own;
 * billing staff decide what each costs. Changing a price affects future charges (and any charge still
 * waiting for a price), never charges that were already priced.
 */
export default function BillingServices() {
  const { user } = useAuth();
  const canEdit = can("update", "Billing", user?.role);
  const canCreate = can("create", "Billing", user?.role);
  const [searchParams] = useSearchParams();

  const [services, setServices] = useState<BillableService[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [unpricedOnly, setUnpricedOnly] = useState(searchParams.get("unpriced") === "1");
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newService, setNewService] = useState({ name: "", category: "other", department: "", price: "" });

  const load = useCallback(() => {
    billingServiceAPI
      .list()
      .then((rows) => {
        setServices(rows);
        setDrafts(Object.fromEntries(rows.map((s) => [s.id, s.price ?? ""])));
      })
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load services")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const savePrice = async (service: BillableService) => {
    const draft = drafts[service.id]?.trim() ?? "";
    if (draft !== "" && (isNaN(Number(draft)) || Number(draft) < 0)) return Swal.fire("Invalid price", "Enter a number of 0 or more.", "warning");
    setSavingId(service.id);
    try {
      const result = await billingServiceAPI.update(service.id, { price: draft === "" ? null : draft });
      const picked = result?.pricedCharges ?? 0;
      Swal.fire({
        title: "Price saved",
        text: picked ? `${picked} charge(s) that were waiting for this price have been updated.` : `${service.name}: ${draft === "" ? "no price" : formatMoney(draft)}`,
        icon: "success",
        timer: picked ? undefined : 1100,
        showConfirmButton: Boolean(picked),
      });
      load();
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e), "error");
    } finally {
      setSavingId("");
    }
  };

  const toggleActive = async (service: BillableService) => {
    try {
      await billingServiceAPI.update(service.id, { isActive: !service.isActive });
      load();
    } catch (e: unknown) {
      Swal.fire("Error", getErrorMessage(e), "error");
    }
  };

  const addService = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await billingServiceAPI.create({ ...newService, price: newService.price === "" ? null : newService.price });
      setAdding(false);
      setNewService({ name: "", category: "other", department: "", price: "" });
      load();
    } catch (err: unknown) {
      Swal.fire("Could not add service", getErrorMessage(err), "error");
    }
  };

  const term = search.trim().toLowerCase();
  const visible = services.filter((s) => (!unpricedOnly || s.price === null) && (!term || `${s.name} ${s.department}`.toLowerCase().includes(term)));
  const unpricedCount = services.filter((s) => s.price === null && s.isActive).length;

  return (
    <BaseLayout resourceName="Service Prices">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Service prices</h1>
            <p className="text-sm text-gray-500">
              {services.length} services · <span className={unpricedCount ? "font-semibold text-amber-700" : ""}>{unpricedCount} without a price</span>. New lab tests, medicines and appointment types appear here automatically.
            </p>
          </div>
          {canCreate && (
            <button onClick={() => setAdding(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              <PlusIcon className="h-4 w-4" /> Add service
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
          <label className="flex items-center gap-2 text-sm font-medium text-amber-700">
            <input type="checkbox" checked={unpricedOnly} onChange={(e) => setUnpricedOnly(e.target.checked)} className="accent-amber-600" />
            Unpriced only
          </label>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading && <p className="text-sm text-gray-400">Loading services...</p>}

        {BILLING_CATEGORIES.map((cat) => {
          const rows = visible.filter((s) => s.category === cat.id || (cat.id === "other" && !BILLING_CATEGORIES.some((c) => c.id === s.category)));
          if (rows.length === 0) return null;
          return (
            <section key={cat.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
              <header className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                <h2 className="font-bold text-gray-900">{cat.label}</h2>
                <p className="text-xs text-gray-500">{cat.source}</p>
              </header>
              <ul className="divide-y divide-gray-50">
                {rows.map((s) => {
                  const dirty = (drafts[s.id] ?? "") !== (s.price ?? "");
                  return (
                    <li key={s.id} className={`flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center ${s.isActive ? "" : "opacity-50"}`}>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.department}{!s.isActive && " · not charged"}</p>
                      </div>
                      {s.price === null && <span className="self-start rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 sm:self-center">No price</span>}
                      {canEdit ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={drafts[s.id] ?? ""}
                            onChange={(e) => setDrafts((prev) => ({ ...prev, [s.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && dirty && savePrice(s)}
                            placeholder="Price"
                            className={`${inputClass} w-32 text-right`}
                          />
                          <button
                            onClick={() => savePrice(s)}
                            disabled={!dirty || savingId === s.id}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-30"
                          >
                            Save
                          </button>
                          <button onClick={() => toggleActive(s)} className="rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50" title={s.isActive ? "Stop charging for this service" : "Start charging again"}>
                            {s.isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-900">{s.price === null ? "—" : formatMoney(s.price)}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        <Modal isOpen={adding} onClose={() => setAdding(false)} title="Add a billable service">
          <form onSubmit={addService} className="space-y-4">
            <p className="text-xs text-gray-500">For services that aren't discovered automatically, e.g. a maternal care package or a dressing.</p>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Name *<input className={inputClass} required value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="e.g. Antenatal care visit" /></label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Category *
              <select className={inputClass} value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })}>
                {BILLING_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Department *<input className={inputClass} required value={newService.department} onChange={(e) => setNewService({ ...newService, department: e.target.value })} placeholder="e.g. Maternity" /></label>
            <label className="block space-y-1 text-sm font-medium text-gray-700">Price<input type="number" min="0" step="0.01" className={inputClass} value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} /></label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Cancel</button>
              <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Add</button>
            </div>
          </form>
        </Modal>
      </div>
    </BaseLayout>
  );
}
