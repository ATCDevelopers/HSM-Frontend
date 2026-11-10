import { useEffect, useMemo, useState } from "react";
import BaseLayout from "../../components/layouts/BaseLayout";
import { getErrorMessage } from "../../services/apiResponse";
import { appointmentAPI, type Appointment, type AppointmentStatus, STATUS_LABELS, doctorName, patientName, toDateKey } from "../../services/appointmentAPI";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateKey(d);
};

const toCsv = (rows: Appointment[]) => {
  const header = ["Date", "Time", "Patient", "Doctor", "Type", "Priority", "Status", "Reason"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const body = rows.map((a) =>
    [toDateKey(new Date(a.appointmentDate)), a.appointmentTime, patientName(a), doctorName(a), a.appointmentType, a.priority, STATUS_LABELS[a.status], a.reason].map(escape).join(","),
  );
  return [header.join(","), ...body].join("\n");
};

/**
 * Reports - appointment analytics from /appointments/reports.
 * The backend narrows doctors to their own appointments; other clinical modules have no reporting endpoint yet.
 */
function Reports() {
  const [startDate, setStartDate] = useState(daysAgo(30));
  const [endDate, setEndDate] = useState(toDateKey(new Date()));
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    appointmentAPI
      .list({ startDate, endDate })
      .then(setRows)
      .catch((e: unknown) => setError(getErrorMessage(e, "Failed to load report")))
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  const byStatus = useMemo(() => {
    const counts = Object.fromEntries((Object.keys(STATUS_LABELS) as AppointmentStatus[]).map((s) => [s, 0])) as Record<AppointmentStatus, number>;
    rows.forEach((a) => (counts[a.status] += 1));
    return counts;
  }, [rows]);

  const byDoctor = useMemo(() => {
    const map = new Map<string, { name: string; total: number; completed: number; noShow: number }>();
    rows.forEach((a) => {
      const key = a.doctorId ?? "unassigned";
      const entry = map.get(key) ?? { name: doctorName(a), total: 0, completed: 0, noShow: 0 };
      entry.total += 1;
      if (a.status === "completed") entry.completed += 1;
      if (a.status === "no_show") entry.noShow += 1;
      map.set(key, entry);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [rows]);

  const closed = byStatus.completed + byStatus.no_show;
  const noShowRate = closed ? Math.round((byStatus.no_show / closed) * 100) : 0;

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: "text/csv" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `appointments_${startDate}_${endDate}.csv` });
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <BaseLayout resourceName="Reports">
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment report</h1>
            <p className="text-sm text-gray-500">Volume, outcomes and doctor workload for a date range.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            <span className="text-gray-400">to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            <button onClick={download} disabled={!rows.length} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">Export CSV</button>
          </div>
        </div>

        {error && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{error}</div>}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Total", rows.length],
            ["Completed", byStatus.completed],
            ["Cancelled", byStatus.cancelled],
            ["No-show rate", `${noShowRate}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{loading ? "—" : value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">By status</h2>
            <div className="mt-4 space-y-2">
              {(Object.keys(byStatus) as AppointmentStatus[]).map((s) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 text-gray-600">{STATUS_LABELS[s]}</span>
                  <div className="h-2.5 flex-1 rounded-full bg-gray-100">
                    <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${rows.length ? (byStatus[s] / rows.length) * 100 : 0}%` }} />
                  </div>
                  <span className="w-8 text-right font-semibold text-gray-900">{byStatus[s]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-gray-900">By doctor</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-gray-500">
                <tr><th className="py-2">Doctor</th><th className="py-2 text-right">Booked</th><th className="py-2 text-right">Completed</th><th className="py-2 text-right">No-show</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {byDoctor.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400">No appointments in this range.</td></tr>}
                {byDoctor.map((d) => (
                  <tr key={d.name}><td className="py-2">Dr. {d.name}</td><td className="py-2 text-right">{d.total}</td><td className="py-2 text-right">{d.completed}</td><td className="py-2 text-right">{d.noShow}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </BaseLayout>
  );
}

export default Reports;
