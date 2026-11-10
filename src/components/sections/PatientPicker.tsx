import { useEffect, useMemo, useState } from "react";
import { LockClosedIcon, MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { patientAPI, type Patient } from "../../services/patientAPI";
import { getErrorMessage } from "../../services/apiResponse";

interface PatientPickerProps {
  value: string;
  onChange: (patient: Patient | null) => void;
  error?: string;
}

const MAX_MATCHES = 8;

const ageOf = (dob?: string) => (dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31_557_600_000) : null);
const fullName = (p: Patient) => [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ");

/**
 * Search patients by name, phone, NHIF card or ID, then lock the chosen one in place.
 * The locked card stays until "Change patient" is pressed, so several entries can be made for one patient.
 */
export default function PatientPicker({ value, onChange, error }: PatientPickerProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    patientAPI.list().then(setPatients).catch((e: unknown) => setLoadError(getErrorMessage(e, "Failed to load patients")));
  }, []);

  const selected = patients.find((p) => p.id === value);

  const matches = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    // Every typed word must match somewhere, so "amina 0712" narrows by name and phone together.
    return patients
      .filter((p) => {
        const haystack = [fullName(p), p.phoneNumber, p.nhifCard, p.id, p.email].join(" ").toLowerCase();
        return words.every((w) => haystack.includes(w));
      })
      .slice(0, MAX_MATCHES);
  }, [patients, query]);

  if (selected) {
    const age = ageOf(selected.dateOfBirth);
    return (
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-blue-500 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-600 p-2 text-white"><LockClosedIcon className="h-5 w-5" /></span>
          <div>
            <p className="text-base font-bold text-gray-900">{fullName(selected)}</p>
            <p className="text-sm text-gray-600">
              {selected.gender} · {age !== null ? `${age} yrs` : "age unknown"} · Blood {selected.bloodGroup || "—"} · {selected.phoneNumber}
            </p>
            <p className="text-xs text-gray-500">{selected.paymentMode === "CASH" ? "Cash patient" : `${selected.paymentMode === "INSURANCE" ? "Insurance" : "NHIF"} ${selected.nhifCard || "—"}`}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
          className="self-start rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 sm:self-center"
        >
          Change patient
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter picks the only match, which makes keyboard-only entry quick.
            if (e.key === "Enter" && matches.length === 1) {
              e.preventDefault();
              onChange(matches[0]);
            }
          }}
          placeholder="Type patient name, phone or NHIF number..."
          className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${error ? "border-red-300" : "border-gray-200"}`}
        />
      </div>
      {(error || loadError) && <p className="text-xs text-red-600">{error || loadError}</p>}

      {query.trim() && (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {matches.length === 0 && <li className="px-4 py-3 text-sm text-gray-500">No patient matches "{query}".</li>}
          {matches.map((p) => {
            const age = ageOf(p.dateOfBirth);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => onChange(p)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-blue-50">
                  <UserCircleIcon className="h-8 w-8 shrink-0 text-gray-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-gray-900">{fullName(p)}</span>
                    <span className="block truncate text-xs text-gray-500">
                      {p.gender} · {age !== null ? `${age} yrs` : "—"} · {p.phoneNumber} · {p.paymentMode === "CASH" ? "Cash" : `NHIF ${p.nhifCard}`}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-blue-600">Select</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {!query.trim() && patients.length > 0 && <p className="text-xs text-gray-400">{patients.length} patients registered. Start typing to search.</p>}
    </div>
  );
}
