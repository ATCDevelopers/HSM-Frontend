import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import Table from "../../components/sections/Table";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import { getErrorMessage } from "../../services/apiResponse";
import { invoiceAPI, invoicePatientName, type Invoice } from "../../services/billingAPI";
import { statusLabel } from "../../services/statusAPI";

const STATUS_STYLES: Record<string, string> = {
  unpaid: "bg-red-50 text-red-700",
  partially_paid: "bg-yellow-50 text-yellow-700",
  paid: "bg-green-50 text-green-700",
  void: "bg-gray-100 text-gray-600",
};

export default function BillingIndex() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    invoiceAPI
      .list()
      .then(setInvoices)
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load invoices")))
      .finally(() => setLoading(false));
  }, []);

  const term = search.trim().toLowerCase();
  const rows = invoices.filter(
    (i) => (!status || i.statusName === status) && (!term || [i.invoiceNumber, invoicePatientName(i)].some((v) => v.toLowerCase().includes(term))),
  );
  const count = (name: string) => invoices.filter((i) => i.statusName === name).length;

  const columns = [
    { key: "invoiceNumber", title: "Invoice", render: (v: string) => <span className="font-semibold text-gray-900">{v}</span> },
    { key: "patient", title: "Patient", render: (_: unknown, i: Invoice) => invoicePatientName(i) },
    { key: "createdAt", title: "Date", render: (v: string) => new Date(v).toLocaleDateString() },
    {
      key: "statusName",
      title: "Status",
      render: (v: string) => <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[v] ?? "bg-blue-50 text-blue-700"}`}>{statusLabel(v)}</span>,
    },
  ];

  return (
    <BaseLayout resourceName="Billing">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
            <p className="text-sm text-gray-500">{count("unpaid")} unpaid · {count("partially_paid")} partially paid · {count("paid")} paid</p>
          </div>
          {can("create", "Billing", user?.role) && (
            <button onClick={() => navigate("/billing/new")} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              <PlusIcon className="h-4 w-4" /> New invoice
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice number or patient..." className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">All statuses</option>
            {Object.keys(STATUS_STYLES).map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </div>

        {error && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

        <Table columns={columns} data={rows} loading={loading} emptyMessage="No invoices found." onRowClick={(i: Invoice) => navigate(`/billing/${i.id}`)} />
      </div>
    </BaseLayout>
  );
}
