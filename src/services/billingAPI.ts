import API from "./api";
import { extractList, extractRecord } from "./apiResponse";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientFirstName: string | null;
  patientLastName: string | null;
  statusId: string;
  statusName: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  serviceName: string;
  description: string | null;
  price: string;
}

export const invoicePatientName = (invoice: Pick<Invoice, "patientFirstName" | "patientLastName">) =>
  [invoice.patientFirstName, invoice.patientLastName].filter(Boolean).join(" ") || "Unknown patient";

/** e.g. INV-20261101-4821. The backend only checks uniqueness, so a date plus random suffix is enough. */
export const generateInvoiceNumber = () => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `INV-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const invoiceTotal = (items: InvoiceItem[]) => items.reduce((sum, item) => sum + Number(item.price || 0), 0);

export const formatMoney = (amount: number | string) =>
  Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const invoiceAPI = {
  list: async (): Promise<Invoice[]> => extractList<Invoice>(await API.get("invoices")),

  listByPatient: async (patientId: string): Promise<Invoice[]> =>
    extractList<Invoice>(await API.get(`invoices/patient/${patientId}`)),

  get: async (id: string): Promise<Invoice> => {
    const record = extractRecord<Invoice>(await API.get(`invoices/${id}`));
    if (!record) throw new Error("Invoice not found");
    return record;
  },

  create: async (payload: { invoiceNumber: string; patientId: string; statusId: string }) =>
    extractRecord<Invoice>(await API.post("invoices", payload)),

  update: async (id: string, payload: Partial<{ statusId: string }>) =>
    extractRecord<Invoice>(await API.put(`invoices/${id}`, payload)),

  remove: async (id: string) => {
    await API.delete(`invoices/${id}`);
  },
};

export const invoiceItemAPI = {
  listByInvoice: async (invoiceId: string): Promise<InvoiceItem[]> =>
    extractList<InvoiceItem>(await API.get(`invoice-items/invoice/${invoiceId}`)),

  create: async (payload: { invoiceId: string; serviceName: string; description?: string; price: string }) =>
    extractRecord<InvoiceItem>(await API.post("invoice-items", payload)),

  remove: async (id: string) => {
    await API.delete(`invoice-items/${id}`);
  },
};

// ─── Automatic billing: service price list and charges ──────────────────────────────────────

export type BillingCategory = "registration" | "consultation" | "nursing" | "laboratory" | "pharmacy" | "other";
export type Payer = "NHIF" | "INSURANCE" | "CASH";
export type ChargeStatus = "unbilled" | "invoiced" | "waived";

/** Where each category of charge comes from, in the order a patient usually moves through the hospital. */
export const BILLING_CATEGORIES: { id: BillingCategory; label: string; source: string }[] = [
  { id: "registration", label: "Registration", source: "Reception · cash patients opening an account" },
  { id: "consultation", label: "Consultations", source: "Doctors · charged when an appointment is booked" },
  { id: "nursing", label: "Nursing", source: "Nurses · charged when vitals are recorded" },
  { id: "laboratory", label: "Laboratory", source: "Lab · charged when a test result is entered" },
  { id: "pharmacy", label: "Pharmacy", source: "Pharmacy · charged per medicine when dispensed" },
  { id: "other", label: "Other services", source: "Custom services added by billing" },
];

export const categoryLabel = (id: string) => BILLING_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const PAYER_LABELS: Record<Payer, string> = { CASH: "Cash", NHIF: "NHIF claim", INSURANCE: "Insurance claim" };

export interface BillableService {
  id: string;
  code: string;
  name: string;
  category: string;
  department: string;
  price: string | null;
  isActive: boolean;
}

export interface ServiceCharge {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  serviceId: string;
  serviceName: string;
  category: string;
  department: string;
  sourceType: string;
  description: string | null;
  quantity: number;
  unitPrice: string | null;
  amount: string | null;
  payer: Payer;
  status: ChargeStatus;
  invoiceId: string | null;
  createdAt: string;
}

export const billingServiceAPI = {
  /** The backend re-discovers lab tests, medicines and appointment types on every call. */
  list: async (category?: string): Promise<BillableService[]> =>
    extractList<BillableService>(await API.get("billing/services", { params: { category } })),

  create: async (payload: { name: string; category: string; department: string; price?: string | null }) =>
    extractRecord<BillableService>(await API.post("billing/services", payload)),

  update: async (id: string, payload: Partial<{ name: string; price: string | null; isActive: boolean }>) =>
    extractRecord<{ service: BillableService; pricedCharges: number }>(await API.patch(`billing/services/${id}`, payload)),
};

export const chargeAPI = {
  list: async (filters: { status?: ChargeStatus | ""; patientId?: string; category?: string; payer?: Payer | "" } = {}): Promise<ServiceCharge[]> =>
    extractList<ServiceCharge>(
      await API.get("billing/charges", {
        params: { status: filters.status || undefined, patientId: filters.patientId, category: filters.category || undefined, payer: filters.payer || undefined },
      }),
    ),

  /** Manual charge, for services no clinical action records automatically (e.g. a custom maternity package). */
  add: async (payload: { patientId: string; serviceId: string; quantity?: number; description?: string }) =>
    extractRecord<ServiceCharge>(await API.post("billing/charges", payload)),

  setWaived: async (id: string, waived: boolean) => extractRecord<ServiceCharge>(await API.patch(`billing/charges/${id}/waive`, { waived })),

  /** Creates one invoice from the given unbilled, priced charges of a single patient. */
  invoice: async (patientId: string, chargeIds: string[]) =>
    extractRecord<Invoice>(await API.post("billing/charges/invoice", { patientId, chargeIds })),
};

export interface PatientBalance {
  patientId: string;
  paymentMode: Payer;
  amountDue: string;
  notYetInvoiced: string;
  unpaidInvoices: string;
  coveredByInsurance: string;
  unpricedCount: number;
  pendingCharges: { id: string; serviceName: string; category: string; quantity: number; amount: string | null; createdAt: string }[];
  invoices: { id: string; invoiceNumber: string; statusName: string | null; createdAt: string; total: string; insured: boolean }[];
}

/** Front-desk view of what a patient owes; readable by reception as well as billing. */
export const balanceAPI = {
  get: async (patientId: string): Promise<PatientBalance> => {
    const record = extractRecord<PatientBalance>(await API.get(`billing/balance/${patientId}`));
    if (!record) throw new Error("Balance not available");
    return record;
  },
};
