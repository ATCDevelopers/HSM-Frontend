import { useMemo, useState } from "react";
import { BeakerIcon, ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon, PrinterIcon } from "@heroicons/react/24/outline";
import Modal from "../../components/atoms/ui/Modal";
import type { LabResultWithTemplate } from "../../services/emrAPI";
import type { Patient } from "../../services/patientAPI";
import { abnormalCount, personName, printLabReport, resultRows } from "./labReport";

interface LabHistoryPanelProps {
  patient: Patient | null;
  results: LabResultWithTemplate[];
  error?: string;
  loading?: boolean;
}

const formatDate = (value?: string) => (value ? new Date(value).toLocaleString() : "—");

/** Right-hand lab history on the medical record: every result the lab recorded, browsable and printable. */
export default function LabHistoryPanel({ patient, results, error, loading }: LabHistoryPanelProps) {
  const [category, setCategory] = useState("");
  const [abnormalOnly, setAbnormalOnly] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useMemo(() => [...new Set(results.map((r) => r.template?.category).filter(Boolean) as string[])].sort(), [results]);
  const visible = results.filter((r) => (!category || r.template?.category === category) && (!abnormalOnly || abnormalCount(r) > 0));
  const open = openIndex !== null ? visible[openIndex] : null;

  return (
    <aside className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 lg:sticky lg:top-20">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-blue-50 p-1.5 text-blue-600"><BeakerIcon className="h-5 w-5" /></span>
          <div>
            <h2 className="font-bold text-gray-900">Laboratory tests</h2>
            <p className="text-xs text-gray-500">{results.length} result{results.length === 1 ? "" : "s"} on record</p>
          </div>
        </div>
        <button
          type="button"
          disabled={visible.length === 0}
          onClick={() => printLabReport(patient, visible)}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          title="Print every result shown below"
        >
          <PrinterIcon className="h-4 w-4" /> Print all
        </button>
      </div>

      {results.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 px-4 py-3">
          {["", ...categories].map((c) => (
            <button
              key={c || "all"}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${category === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {c ? c.charAt(0) + c.slice(1).toLowerCase() : "All"}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-1 text-[11px] font-medium text-amber-700">
            <input type="checkbox" checked={abnormalOnly} onChange={(e) => setAbnormalOnly(e.target.checked)} className="accent-amber-600" />
            Abnormal only
          </label>
        </div>
      )}

      <ul className="max-h-[32rem] divide-y divide-gray-100 overflow-y-auto">
        {loading && <li className="p-4 text-sm text-gray-400">Loading lab history...</li>}
        {error && <li className="p-4 text-sm text-amber-800">{error}</li>}
        {!loading && !error && visible.length === 0 && (
          <li className="p-4 text-sm text-gray-500">{results.length ? "No results match this filter." : "No laboratory tests recorded yet."}</li>
        )}
        {visible.map((r, index) => {
          const flags = abnormalCount(r);
          return (
            <li key={r.id}>
              <button type="button" onClick={() => setOpenIndex(index)} className="w-full px-4 py-3 text-left hover:bg-blue-50">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">{r.template?.name ?? "Lab test"}</span>
                  {flags > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                      <ExclamationTriangleIcon className="h-3 w-3" /> {flags}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{formatDate(r.createdAt)}</p>
                <p className="text-xs text-gray-400">By {personName(r.technician)}{r.doctor && ` · to Dr. ${personName(r.doctor)}`}</p>
              </button>
            </li>
          );
        })}
      </ul>

      <Modal isOpen={Boolean(open)} onClose={() => setOpenIndex(null)} title={open?.template?.name ?? "Lab result"} size="lg">
        {open && openIndex !== null && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between gap-2 text-sm text-gray-500">
              <span>{open.template?.category} · {formatDate(open.createdAt)}</span>
              <span>Result {openIndex + 1} of {visible.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
                  <tr><th className="px-3 py-2">Parameter</th><th className="px-3 py-2">Result</th><th className="px-3 py-2">Normal range</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resultRows(open).map((row) => (
                    <tr key={row.key} className={row.abnormal ? "bg-amber-50" : ""}>
                      <td className="px-3 py-2 text-gray-700">{row.label}</td>
                      <td className={`px-3 py-2 font-semibold ${row.abnormal ? "text-amber-800" : "text-gray-900"}`}>
                        {String(row.value)} {row.abnormal && <ExclamationTriangleIcon className="inline h-4 w-4" />}
                      </td>
                      <td className="px-3 py-2 text-gray-500">{row.range || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {open.notes && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900"><strong>Lab notes:</strong> {open.notes}</p>}
            <p className="text-xs text-gray-500">
              Performed by {personName(open.technician)}{open.doctor && ` · sent to Dr. ${personName(open.doctor)}`}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
              <div className="flex gap-2">
                <button type="button" disabled={openIndex === 0} onClick={() => setOpenIndex(openIndex - 1)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronLeftIcon className="h-4 w-4" /> Newer
                </button>
                <button type="button" disabled={openIndex === visible.length - 1} onClick={() => setOpenIndex(openIndex + 1)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  Older <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
              <button type="button" onClick={() => printLabReport(patient, [open])} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                <PrinterIcon className="h-4 w-4" /> Print this result
              </button>
            </div>
          </div>
        )}
      </Modal>
    </aside>
  );
}
