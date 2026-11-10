import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout";
import PatientPicker from "../../components/sections/PatientPicker";
import PatientBalanceCard from "../../components/sections/PatientBalanceCard";
import { patientAPI, type Patient } from "../../services/patientAPI";

/** Front-desk balance check: find a patient and tell them exactly what they owe. */
export default function PatientBalancePage() {
  const [searchParams] = useSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const id = searchParams.get("patientId");
    if (id) patientAPI.get(id).then(setPatient).catch(() => undefined);
  }, [searchParams]);

  return (
    <BaseLayout resourceName="Patient Balance">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700"><BanknotesIcon className="h-6 w-6" /></span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient balance</h1>
            <p className="text-sm text-gray-500">Search a patient to see what they owe for services received so far.</p>
          </div>
        </div>
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <PatientPicker value={patient?.id ?? ""} onChange={setPatient} />
        </section>
        {patient && <PatientBalanceCard patient={patient} />}
      </div>
    </BaseLayout>
  );
}
