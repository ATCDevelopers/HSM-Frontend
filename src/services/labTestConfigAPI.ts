import API from "./api";

// 1. Core Model Definitions mapping to your PostgreSQL Drizzle jsonb schema columns
export interface FormFieldValidation {
  min?: number;
  max?: number;
}

export interface FormFieldSchema {
  id: string;
  type: "number" | "text" | "select";
  label: string;
  required: boolean;
  options?: string[];
  validation?: FormFieldValidation;
}

export interface LabTest {
  id: string;
  name: string;
  category: string;
  description: string | null;
  formSchema: FormFieldSchema[]; // Strong structural typing mapping for your dynamic jsonb column
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy: string;
  updatedBy: string;
}

// 2. Request Payloads mirroring RegisterPatientPayload pattern
export interface CreateLabTestPayload {
  name: string;
  category: string;
  description?: string;
  formSchema: FormFieldSchema[];
  createdBy: string;
}

export interface UpdateLabTestPayload {
  name?: string;
  category?: string;
  description?: string;
  formSchema?: FormFieldSchema[];
  updatedBy: string;
}

export interface CreateLabTestResultPayload {
  labTestTemplateId: string;
  patientId: string;
  values: Record<string, string | number>;
  notes?: string;
}

export interface LabTestResult {
  id?: string;
  labTestTemplateId: string;
  patientId: string;
  values: Record<string, string | number>;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 3. Normalizer to gracefully catch any raw DB jsonb payload parsing variations
function normalizeLabTest(test: any): LabTest {
  if (!test) return test;
  
  let processedSchema: FormFieldSchema[] = [];
  if (Array.isArray(test.formSchema)) {
    processedSchema = test.formSchema;
  } else if (typeof test.formSchema === "string") {
    try {
      processedSchema = JSON.parse(test.formSchema);
    } catch {
      processedSchema = [];
    }
  }

  return {
    ...test,
    formSchema: processedSchema,
    description: test.description ?? null,
  };
}

// 4. API Service Hook Layer Matching Express Base URL Context Rules
export const labTestAPI = {
  /**
   * GET /api/v1/labtest
   * Fetches all dynamic test frameworks currently deployed in the hospital catalog
   */
  list: async (): Promise<LabTest[]> => {
    // Explicitly targets 'labtest' to map with app.use("/api/v1/labtest", labTestConfigRoutes)
    const response = await API.get<ApiResponse<LabTest[]>>("labtest");
    const rawList = response.data.data ?? (Array.isArray(response.data) ? response.data : []);
    return rawList.map(normalizeLabTest);
  },

  /**
   * GET /api/v1/labtest/:id
   * Fetches a specific configuration matrix blueprint using its UUID
   */
  get: async (id: string): Promise<LabTest> => {
    const response = await API.get<ApiResponse<LabTest>>(`labtest/${id}`);
    if (!response.data.data) throw new Error(response.data.message ?? "Lab test schema configuration not found");
    return normalizeLabTest(response.data.data);
  },

  /**
   * POST /api/v1/labtest
   * Publishes a new dynamic schema array canvas framework into PostgreSQL
   */
  create: async (payload: CreateLabTestPayload): Promise<LabTest> => {
    const response = await API.post<ApiResponse<LabTest>>("labtest", payload);
    if (!response.data.data) throw new Error(response.data.message ?? "Failed to publish lab test configurations");
    return normalizeLabTest(response.data.data);
  },

  /**
   * PUT /api/v1/labtest/:id
   * Alters an active master schema catalog layout block on demand
   */
  update: async (id: string, payload: UpdateLabTestPayload): Promise<LabTest> => {
    const response = await API.put<ApiResponse<LabTest>>(`labtest/${id}`, payload);
    if (!response.data.data) throw new Error(response.data.message ?? "Failed to adjust dynamic test configurations");
    return normalizeLabTest(response.data.data);
  },

  /**
   * DELETE /api/v1/labtest/:id
   * Disables template availability tracking using active soft-deletion records
   */
  remove: async (id: string): Promise<void> => {
    await API.delete(`labtest/${id}`);
  },
};

export const labTestResultAPI = {
  /** POST /api/v1/test-results */
  create: async (payload: CreateLabTestResultPayload): Promise<LabTestResult> => {
    const response = await API.post<ApiResponse<LabTestResult>>("test-results", payload);
    const result = response.data.data ?? (response.data as unknown as LabTestResult);
    if (!result) throw new Error(response.data.message ?? "Failed to submit lab result");
    return result;
  },
};
