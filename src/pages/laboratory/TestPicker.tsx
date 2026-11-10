import { useMemo, useState } from "react";
import { BeakerIcon, LockClosedIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { LabTest } from "../../services/labTestConfigAPI";

interface TestPickerProps {
  tests: LabTest[];
  value: string;
  onChange: (testId: string) => void;
  error?: string;
}

/** Search or filter lab tests by category, then lock the chosen test, mirroring PatientPicker. */
export default function TestPicker({ tests, value, onChange, error }: TestPickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const selected = tests.find((t) => t.id === value);
  const categories = useMemo(() => [...new Set(tests.map((t) => t.category))].sort(), [tests]);

  const matches = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return tests.filter((t) => {
      if (category && t.category !== category) return false;
      const haystack = [t.name, t.category, t.description ?? "", ...t.formSchema.map((f) => f.label)].join(" ").toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }, [tests, query, category]);

  if (selected) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-600 p-2 text-white"><LockClosedIcon className="h-5 w-5" /></span>
          <div>
            <p className="text-base font-bold text-gray-900">{selected.name}</p>
            <p className="text-sm text-gray-600">{selected.category} · {selected.formSchema.length} field{selected.formSchema.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <button type="button" onClick={() => onChange("")} className="self-start rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 sm:self-center">
          Change test
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches.length === 1) {
              e.preventDefault();
              onChange(matches[0].id);
            }
          }}
          placeholder="Search test name or what it measures, e.g. malaria, haemoglobin, glucose..."
          className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${error ? "border-red-300" : "border-gray-200"}`}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {["", ...categories].map((c) => (
          <button
            key={c || "all"}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${category === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {c ? c.charAt(0) + c.slice(1).toLowerCase() : "All"}
          </button>
        ))}
      </div>

      <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {matches.length === 0 && <p className="text-sm text-gray-500">No test matches your search.</p>}
        {matches.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white p-3 text-left hover:border-blue-400 hover:bg-blue-50"
          >
            <BeakerIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-gray-900">{t.name}</span>
              <span className="block truncate text-xs text-gray-500">{t.formSchema.map((f) => f.label).join(", ")}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
