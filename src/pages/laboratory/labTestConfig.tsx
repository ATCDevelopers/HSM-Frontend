import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlusIcon, TrashIcon, ArrowLeftIcon, BeakerIcon } from "@heroicons/react/24/outline";
import BaseLayout from "../../components/layouts/BaseLayout.tsx";
import Button from "../../components/atoms/ui/Button";
import Input from "../../components/atoms/forms/Input";
import {
  labTestAPI,
  labTestResultAPI,
  type FormFieldSchema,
  type CreateLabTestPayload,
  type LabTest,
} from "../../services/labTestConfigAPI";
import { useAuth } from "../../auth/AuthContext";
import { can } from "../../config/ability";
import Swal from "sweetalert2";

export default function LabTestForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Captures UUID parameter if in update mode
  const { user } = useAuth();
  const isEditMode = !!id;

  // Authorization Check
  const canManage = can('create', 'Lab_test', user?.role) || can('update', 'Lab_test', user?.role) || can('manage', 'Lab_test', user?.role);

  // 1. Master Catalog Metadata State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("PREGNANCY");
  const [description, setDescription] = useState("");
  const [formFields, setFormFields] = useState<FormFieldSchema[]>([]);

  // 2. New Structural Attribute Builder Sub-State
  const [fieldId, setFieldId] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<"text" | "number" | "select">("text");
  const [fieldRequired, setFieldRequired] = useState(true);
  const [fieldMin, setFieldMin] = useState("");
  const [fieldMax, setFieldMax] = useState("");
  const [fieldOptions, setFieldOptions] = useState("");

  // UI Progress Elements
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  // Result submission state. Values use the field IDs from the selected template.
  const [templates, setTemplates] = useState<LabTest[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [resultValues, setResultValues] = useState<Record<string, string>>({});
  const [resultNotes, setResultNotes] = useState("");
  const [submittingResult, setSubmittingResult] = useState(false);

  // Hook to pull active template configuration matrix if editing
  useEffect(() => {
    if (!isEditMode) return;
    
    labTestAPI.get(id!)
      .then((test) => {
        setName(test.name);
        setCategory(test.category);
        setDescription(test.description || "");
        setFormFields(test.formSchema || []);
      })
      .catch((err) => {
        Swal.fire("Error", err instanceof Error ? err.message : "Failed to load layout configuration", "error");
        navigate("/laboratory");
      })
      .finally(() => setFetching(false));
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    labTestAPI.list()
      .then((items) => {
        setTemplates(items);
        if (items.length > 0) setSelectedTemplateId(items[0].id);
      })
      .catch(() => {
        // Template loading errors are shown when the user attempts submission.
      });
  }, []);

  // Appends a single structured dynamic form field setup definition to our JSONB layout state
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldId || !fieldLabel) return;

    // Standardize IDs to clean snake_case database variable strings
    const standardizedId = fieldId.trim().toLowerCase().replace(/\s+/g, "_");

    if (formFields.some((f) => f.id === standardizedId)) {
      Swal.fire("Validation Error", "A field attribute with this specific Code Key ID already exists.", "warning");
      return;
    }

    const newField: FormFieldSchema = {
      id: standardizedId,
      type: fieldType,
      label: fieldLabel.trim(),
      required: fieldRequired,
    };

    if (fieldType === "number" && (fieldMin || fieldMax)) {
      newField.validation = {};
      if (fieldMin) newField.validation.min = Number(fieldMin);
      if (fieldMax) newField.validation.max = Number(fieldMax);
    }

    if (fieldType === "select" && fieldOptions) {
      newField.options = fieldOptions.split(",").map((opt) => opt.trim()).filter(Boolean);
    }

    setFormFields([...formFields, newField]);

    // Reset current element fields for subsequent property definitions
    setFieldId("");
    setFieldLabel("");
    setFieldMin("");
    setFieldMax("");
    setFieldOptions("");
  };

  const handleRemoveField = (indexToRemove: number) => {
    setFormFields(formFields.filter((_, idx) => idx !== indexToRemove));
  };

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setResultValues({});
  };

  const handleResultValueChange = (fieldId: string, value: string) => {
    setResultValues((current) => ({ ...current, [fieldId]: value }));
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) {
      Swal.fire("Required", "Select a laboratory test template.", "warning");
      return;
    }
    if (!patientId.trim()) {
      Swal.fire("Required", "Enter the patient UUID.", "warning");
      return;
    }

    const missingField = selectedTemplate.formSchema.find(
      (field) => field.required && !resultValues[field.id]?.trim(),
    );
    if (missingField) {
      Swal.fire("Required", `${missingField.label} is required.`, "warning");
      return;
    }

    const values: Record<string, string | number> = {};
    for (const field of selectedTemplate.formSchema) {
      const rawValue = resultValues[field.id]?.trim() ?? "";
      if (!rawValue) continue;

      if (field.type === "number") {
        const numericValue = Number(rawValue);
        if (Number.isNaN(numericValue)) {
          Swal.fire("Invalid value", `${field.label} must be a number.`, "warning");
          return;
        }
        if (field.validation?.min !== undefined && numericValue < field.validation.min) {
          Swal.fire("Invalid value", `${field.label} must be at least ${field.validation.min}.`, "warning");
          return;
        }
        if (field.validation?.max !== undefined && numericValue > field.validation.max) {
          Swal.fire("Invalid value", `${field.label} must be at most ${field.validation.max}.`, "warning");
          return;
        }
        values[field.id] = numericValue;
      } else {
        if (field.type === "select" && field.options && !field.options.includes(rawValue)) {
          Swal.fire("Invalid value", `Select a valid option for ${field.label}.`, "warning");
          return;
        }
        values[field.id] = rawValue;
      }
    }

    setSubmittingResult(true);
    try {
      await labTestResultAPI.create({
        labTestTemplateId: selectedTemplate.id,
        patientId: patientId.trim(),
        values,
        notes: resultNotes.trim() || undefined,
      });
      await Swal.fire("Submitted", "The laboratory result was saved successfully.", "success");
      setPatientId("");
      setResultValues({});
      setResultNotes("");
    } catch (err) {
      Swal.fire("Submission failed", err instanceof Error ? err.message : "Failed to save laboratory result.", "error");
    } finally {
      setSubmittingResult(false);
    }
  };

  // Submit complete template configurations directly to Express endpoint /api/v1/labtest
  const handleSaveCatalog = async () => {
    if (!name.trim()) {
      Swal.fire("Required", "Please provide a name for this laboratory test panel.", "warning");
      return;
    }
    if (formFields.length === 0) {
      Swal.fire("Required", "Please append at least one interactive field attribute entry.", "warning");
      return;
    }

    setLoading(true);
    const payload: CreateLabTestPayload = {
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      formSchema: formFields,
      createdBy: user?.id || "c52ec2fb-c7d2-45b9-b452-cd85608cb105", // Session context fallback
    };

    try {
      if (isEditMode) {
        await labTestAPI.update(id!, { ...payload, updatedBy: payload.createdBy });
        await Swal.fire("Success", "Test schema layout updated cleanly.", "success");
      } else {
        await labTestAPI.create(payload);
        await Swal.fire("Created", "Dynamic lab test configuration synchronized to catalog.", "success");
      }
      navigate("/laboratory");
    } catch (err) {
      Swal.fire("Submission Failed", err instanceof Error ? err.message : "Error saving structure blueprint", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!canManage) {
    return (
      <BaseLayout resourceName="Lab Tests">
        <div className="p-6 text-center text-red-600 font-semibold bg-white rounded-2xl shadow-sm">
          Access Denied: You do not possess structural administration credentials to write catalog schemas.
        </div>
      </BaseLayout>
    );
  }

  if (fetching) {
    return (
      <BaseLayout resourceName="Lab Tests">
        <div className="p-12 text-center text-gray-500 font-medium bg-white rounded-2xl shadow-sm">
          Fetching structural layout metrics from catalog...
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout resourceName="Lab Tests">
      <div className="w-full rounded-2xl bg-blue-50 p-4 sm:p-6 min-h-[calc(100vh-6rem)] flex flex-col">
        <div className="mx-auto max-w-5xl w-full flex-1 flex flex-col">
          
          {/* Top Panel Action Bar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 bg-white rounded-xl shadow-sm text-gray-500 hover:bg-gray-100 transition"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEditMode ? "Modify Lab Test Catalog Canvas" : "Configure New Lab Test Matrix"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">Design dynamic parameters compiled as direct Postgres JSONB schemas.</p>
              </div>
            </div>
            
            <Button variant="primary" onClick={handleSaveCatalog} disabled={loading}>
              {loading ? "Saving Canvas..." : isEditMode ? "Update Template" : "Publish to Catalog"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT CONTAINER: Core Text Configurations Matrix */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 flex items-center gap-2 text-blue-600">
                <BeakerIcon className="h-4 w-4" /> 1. Test Configurations
              </h3>
              
              <Input
                label="Dynamic Test Panel Title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Advanced Prenatal Genetic Screening"
                className="w-full"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Clinical Speciality Group</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border-gray-200 bg-gray-50/50 p-2.5 text-sm font-medium text-gray-800 focus:border-blue-500 focus:bg-white transition"
                >
                  <option value="PREGNANCY">Pregnancy (Maternal Profiles)</option>
                  <option value="HAEMATOLOGY">Haematology (Blood Testing)</option>
                  <option value="BIOCHEMISTRY">Biochemistry Panel</option>
                  <option value="MICROBIOLOGY">Microbiology</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Catalog Entry Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding profile collections, vacuum storage metrics, or structural clinical observations..."
                  className="w-full rounded-xl border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white transition h-24 resize-none"
                />
              </div>
            </div>

            {/* RIGHT CONTAINER: Dynamic Field Injection Canvas Engine */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Form builder input appender block */}
              <form onSubmit={handleAddField} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4 text-blue-600">
                  2. Field Property Canvas Builder
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Unique System Code Key (id)"
                    value={fieldId}
                    onChange={(e) => setFieldId(e.target.value)}
                    placeholder="e.g., fetal_fraction"
                    required
                  />
                  <Input
                    label="Human Readable Input Label"
                    value={fieldLabel}
                    onChange={(e) => setFieldLabel(e.target.value)}
                    placeholder="e.g., Fetal Fraction Percentage (%)"
                    required
                  />
                </div>

                <label className="block text-xs font-semibold text-gray-500 mb-1">Render Component Type</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FormFieldSchema["type"])}
                  className="w-full rounded-xl border-gray-200 bg-gray-50/50 p-2.5 text-sm font-medium text-gray-800 focus:border-blue-500"
                >
                  <option value="text">Single Line Text Box</option>
                  <option value="number">Numeric Analysis Input</option>
                  <option value="select">Dropdown Multi-Choice Box</option>
                </select>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={fieldRequired} onChange={(e) => setFieldRequired(e.target.checked)} />
                  Required field
                </label>

                {fieldType === "number" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="Minimum Bound Rule" type="number" value={fieldMin} onChange={(e) => setFieldMin(e.target.value)} placeholder="0" />
                    <Input label="Maximum Bound Rule" type="number" value={fieldMax} onChange={(e) => setFieldMax(e.target.value)} placeholder="100" />
                  </div>
                )}

                {fieldType === "select" && (
                  <Input
                    label="Menu Options (comma-separated)"
                    value={fieldOptions}
                    onChange={(e) => setFieldOptions(e.target.value)}
                    placeholder="Low Risk, Borderline / Retest, High Risk"
                    required
                  />
                )}

                <Button type="submit" variant="secondary">
                  <PlusIcon className="mr-2 h-4 w-4" /> Add Parameter
                </Button>
              </form>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4 text-blue-600">
                  3. Form Parameters ({formFields.length})
                </h3>
                {formFields.length === 0 ? (
                  <p className="text-sm text-gray-500">No field configurations added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {formFields.map((field, idx) => (
                      <div key={field.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div>
                          <p className="font-semibold text-gray-800">{field.label}</p>
                          <p className="text-xs text-gray-500">ID: {field.id} | Type: {field.type} {field.required ? "| Required" : "| Optional"}</p>
                        </div>
                        <button type="button" onClick={() => handleRemoveField(idx)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${field.label}`}>
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmitResult} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-2 mb-4 text-blue-600">
                  4. Submit Laboratory Result
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Patient UUID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
                    required
                  />

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Test Template</label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full rounded-xl border-gray-200 bg-gray-50/50 p-2.5 text-sm font-medium text-gray-800 focus:border-blue-500"
                      required
                    >
                      <option value="">Select a saved template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedTemplate?.formSchema.map((field) => (
                    <div key={field.id}>
                      {field.type === "select" ? (
                        <>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">{field.label}</label>
                          <select
                            value={resultValues[field.id] ?? ""}
                            onChange={(e) => handleResultValueChange(field.id, e.target.value)}
                            className="w-full rounded-xl border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-800 focus:border-blue-500"
                            required={field.required}
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                          </select>
                        </>
                      ) : (
                        <Input
                          label={field.label}
                          type={field.type === "number" ? "number" : "text"}
                          value={resultValues[field.id] ?? ""}
                          onChange={(e) => handleResultValueChange(field.id, e.target.value)}
                          required={field.required}
                          min={field.validation?.min}
                          max={field.validation?.max}
                        />
                      )}
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                    <textarea
                      value={resultNotes}
                      onChange={(e) => setResultNotes(e.target.value)}
                      placeholder="Optional clinical notes"
                      className="h-24 w-full resize-none rounded-xl border-gray-200 bg-gray-50/50 p-2.5 text-sm text-gray-800 focus:border-blue-500"
                    />
                  </div>

                  <Button type="submit" variant="success" disabled={submittingResult || !selectedTemplate}>
                    {submittingResult ? "Submitting Result..." : "Save Laboratory Result"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}