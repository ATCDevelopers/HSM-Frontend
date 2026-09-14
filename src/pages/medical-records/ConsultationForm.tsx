import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import API from "../../services/api";
import StepWizard from "./StepWizard";
import type { ConsultationFormInput } from "./types";

interface FieldConfig {
  key: keyof Omit<ConsultationFormInput, "doctor_id" | "patient_id">;
  label: string;
  placeholder: string;
}

const STEPS: {
  label: string;
  heading: string;
  description: string;
  fields: FieldConfig[];
}[] = [
  {
    label: "Complaint",
    heading: "Chief Complaint",
    description:
      "Record the main reason the patient has come for consultation.",
    fields: [
      {
        key: "chief_complaint",
        label: "",
        placeholder: "Enter chief complaint.....",
      },
    ],
  },
  {
    label: "History",
    heading: "Patient History",
    description:
      "Record the patient's current illness and relevant medical history.",
    fields: [
      {
        key: "history_of_present_illness",
        label: "History of Present Illness",
        placeholder: "Enter History of present illness....",
      },
      {
        key: "medical_history",
        label: "Medical History",
        placeholder: "Enter Medical History.....",
      },
    ],
  },
  {
    label: "Examination",
    heading: "Physical Examination",
    description: "Record the findings from the physical examination.",
    fields: [
      {
        key: "physical_examination",
        label: "",
        placeholder: "Enter physical examination.....",
      },
    ],
  },
  {
    label: "Assessment",
    heading: "Assessment & Investigation",
    description:
      "Record the preliminary diagnosis and investigations required.",
    fields: [
      {
        key: "preliminary_diagnosis",
        label: "Preliminary Diagnosis",
        placeholder: "Enter preliminary diagnosis....",
      },
      {
        key: "investigation_requirement",
        label: "Investigation Requirement",
        placeholder: "Enter investigation Req....",
      },
    ],
  },
];

const ALL_FIELDS = STEPS.flatMap((s) => s.fields);
const STEP_LABELS = [...STEPS.map((s) => s.label), "Review"];

export default function ConsultationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId") ?? "";
  const doctorId = searchParams.get("doctorId") ?? "";
  const backToHistoryUrl = patientId
    ? `/medical-records/${patientId}`
    : "/medical-records";

  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const isReviewStep = step === STEPS.length;

  const validateStep = (idx: number): boolean => {
    const stepFields = STEPS[idx].fields;
    const newErrors: Record<string, string> = { ...errors };
    let valid = true;

    stepFields.forEach(({ key, label, placeholder }) => {
      const raw = values[key];
      if (!raw?.trim()) {
        newErrors[key] =
          `${label || placeholder.replace("Enter ", "").replace(/\.+$/, "")} is required`;
        valid = false;
      } else {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const goBackToHistory = () => {
    navigate(backToHistoryUrl);
  };

  const handleNext = async () => {
    if (!isReviewStep) {
      if (!validateStep(step)) return;
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    try {
      const payload: ConsultationFormInput = {
        doctor_id: doctorId,
        patient_id: patientId,
        chief_complaint: values.chief_complaint,
        history_of_present_illness: values.history_of_present_illness,
        medical_history: values.medical_history,
        physical_examination: values.physical_examination,
        preliminary_diagnosis: values.preliminary_diagnosis,
        investigation_requirement: values.investigation_requirement,
      };
      await API.post("consultations", payload);
      setSaved(true);
      setTimeout(goBackToHistory, 1200);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (saved) {
    return (
      <BaseLayout resourceName="New Consultation">
        <div className="rounded-2xl bg-blue-50 p-6">
          <Link
            to={backToHistoryUrl}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Medical Records
          </Link>
          <div className="mx-auto mt-3 max-w-3xl rounded-2xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="mt-4 font-medium text-gray-900">Consultation saved</p>
            <p className="mt-1 text-sm text-gray-400">
              Returning to history...
            </p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout resourceName="New Consultation">
      <div className="rounded-2xl bg-blue-50 p-6">
        <Link
          to={backToHistoryUrl}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Medical Records
        </Link>
        <div className="mt-3">
          <StepWizard
            title="New Consultation"
            subtitle="Complete the clinical consultation step by step."
            stepLabels={STEP_LABELS}
            currentStep={step}
            onNext={handleNext}
            onBack={handleBack}
            submitting={submitting}
          >
            {!isReviewStep ? (
              <>
                <div className="mb-4">
                  <h2 className="font-semibold text-gray-900">
                    {STEPS[step].heading}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {STEPS[step].description}
                  </p>
                </div>
                <div className="space-y-5">
                  {STEPS[step].fields.map(({ key, label, placeholder }) => (
                    <div key={key}>
                      {label && (
                        <label
                          htmlFor={key}
                          className="mb-1.5 block text-sm text-gray-700"
                        >
                          {label}
                        </label>
                      )}
                      <textarea
                        id={key}
                        rows={5}
                        placeholder={placeholder}
                        value={values[key] ?? ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className={`w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${
                          errors[key]
                            ? "border-red-400"
                            : "border-gray-300 focus:border-blue-500"
                        }`}
                      />
                      {errors[key] && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="mb-1 font-semibold text-gray-900">
                  Review Consultation
                </h2>
                <p className="mb-4 text-sm text-gray-500">
                  Review all information before saving the consultation.
                </p>
                <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                  {ALL_FIELDS.map((f) => (
                    <div key={f.key}>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        {f.label || f.key.replace(/_/g, " ")}
                      </p>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-900">
                        {values[f.key] || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </StepWizard>
        </div>
      </div>
    </BaseLayout>
  );
}
