import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import BaseLayout from "../../components/layouts/BaseLayout";
import StepWizard from "./StepWizard";
import type { VitalsFormInput } from "./types";
import { sanitizeNumericInput } from "../../utils/inputValidation";

interface FieldConfig {
  key: keyof Omit<VitalsFormInput, "patient_id">;
  label: string;
  unit: string;
  placeholder: string;
  min: number;
  max: number;
  step?: string;
}

const STEPS: {
  label: string;
  heading: string;
  description: string;
  fields: FieldConfig[];
}[] = [
  {
    label: "Temp,Bp & Heart",
    heading: "",
    description: "",
    fields: [
      {
        key: "temperature",
        label: "Temperature",
        unit: "°C",
        placeholder: "",
        min: 30,
        max: 43,
        step: "0.1",
      },
      {
        key: "bp_systolic",
        label: "Systolic Blood Pressure",
        unit: "mmHg",
        placeholder: "",
        min: 60,
        max: 250,
      },
      {
        key: "bp_diastolic",
        label: "Diastolic Blood Pressure",
        unit: "mmHg",
        placeholder: "",
        min: 30,
        max: 150,
      },
      {
        key: "heart_rate",
        label: "Heart Rate",
        unit: "bpm",
        placeholder: "",
        min: 30,
        max: 220,
      },
    ],
  },
  {
    label: "Breathing",
    heading: "Respiratory Measurements",
    description: "Enter breathing and oxygen measurements.",
    fields: [
      {
        key: "respiratory_rate",
        label: "Respiratory Rate",
        unit: "/min",
        placeholder: "",
        min: 5,
        max: 60,
      },
      {
        key: "oxygen_saturation",
        label: "Oxygen Saturation",
        unit: "%",
        placeholder: "",
        min: 50,
        max: 100,
      },
    ],
  },
  {
    label: "Body",
    heading: "Body Measurements",
    description: "Enter the patient's weight and height.",
    fields: [
      {
        key: "weight",
        label: "Weight",
        unit: "kg",
        placeholder: "",
        min: 0.5,
        max: 400,
        step: "0.1",
      },
      {
        key: "height",
        label: "Height",
        unit: "cm",
        placeholder: "",
        min: 20,
        max: 250,
        step: "0.1",
      },
    ],
  },
];

const ALL_FIELDS = STEPS.flatMap((s) => s.fields);
const STEP_LABELS = [...STEPS.map((s) => s.label), "Review"];

async function mockSaveVitals(data: VitalsFormInput): Promise<void> {
  console.log("Mock save vitals:", data);
  await new Promise((res) => setTimeout(res, 500));
}

export default function VitalsForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId") ?? "";
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

    stepFields.forEach(({ key, label, min, max }) => {
      const raw = values[key];
      if (raw === undefined || raw.trim() === "") {
        newErrors[key] = `${label} is required`;
        valid = false;
      } else {
        const num = Number(raw);
        if (Number.isNaN(num)) {
          newErrors[key] = `${label} must be a number`;
          valid = false;
        } else if (num < min || num > max) {
          newErrors[key] = `${label} must be between ${min} and ${max}`;
          valid = false;
        } else {
          delete newErrors[key];
        }
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
      const payload: VitalsFormInput = {
        patient_id: patientId,
        temperature: Number(values.temperature),
        bp_systolic: Number(values.bp_systolic),
        bp_diastolic: Number(values.bp_diastolic),
        heart_rate: Number(values.heart_rate),
        respiratory_rate: Number(values.respiratory_rate),
        oxygen_saturation: Number(values.oxygen_saturation),
        weight: Number(values.weight),
        height: Number(values.height),
      };
      await mockSaveVitals(payload);
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
      <BaseLayout resourceName="New Vital">
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
            <p className="mt-4 font-medium text-gray-900">Vitals saved</p>
            <p className="mt-1 text-sm text-gray-400">
              Returning to history...
            </p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout resourceName="New Vital">
      <div className="rounded-2xl bg-blue-50 p-6">
        <Link
          to={backToHistoryUrl}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Medical Records
        </Link>
        <div className="mt-3">
          <StepWizard
            title="Patient Vitals"
            subtitle="Enter Patient vitals Step by Step."
            stepLabels={STEP_LABELS}
            currentStep={step}
            onNext={handleNext}
            onBack={handleBack}
            submitting={submitting}
          >
            {!isReviewStep ? (
              <>
                {STEPS[step].heading && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-gray-900">
                      {STEPS[step].heading}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {STEPS[step].description}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {STEPS[step].fields.map(
                    ({ key, label, unit, step: stepAttr }) => (
                      <div key={key}>
                        <label
                          htmlFor={key}
                          className="mb-1.5 block text-sm text-gray-700"
                        >
                          {label}
                        </label>
                        <div className="relative">
                          <input
                            id={key}
                            type="number"
                            step={stepAttr ?? "1"}
                            value={values[key] ?? ""}
                            onChange={(e) => handleChange(key, sanitizeNumericInput(e.target.value, stepAttr === "0.1"))}
                            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${
                              errors[key]
                                ? "border-red-400"
                                : "border-gray-300 focus:border-blue-500"
                            }`}
                          />
                        </div>
                        <span className="mt-1 block text-xs text-gray-400">
                          {unit}
                        </span>
                        {errors[key] && (
                          <p className="mt-1 text-xs text-red-600">
                            {errors[key]}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="mb-1 font-semibold text-gray-900">
                  Review Vitals
                </h2>
                <p className="mb-4 text-sm text-gray-500">
                  Check the information before saving the vitals record.
                </p>
                <div className="divide-y divide-gray-100 rounded-lg bg-gray-50 px-4">
                  {ALL_FIELDS.map((f) => (
                    <div
                      key={f.key}
                      className="flex justify-between py-2.5 text-sm"
                    >
                      <span className="text-gray-500">{f.label}</span>
                      <span className="font-medium text-gray-900">
                        {values[f.key]} {f.unit}
                      </span>
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
