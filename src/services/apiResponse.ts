export interface ApiResponse<T = unknown> {
    data?: T;
    links?: Record<string, unknown>;
    meta?: {
        current_page?: number;
        currentPage?: number;
        last_page?: number;
        lastPage?: number;
        per_page?: number;
        perPage?: number;
        total?: number;
    };
}

export interface AxiosResponse<T = unknown> {
    data?: T;
}

/**
 * Extracts the array payload from a list response, regardless of the wrapper key.
 *
 * @param {AxiosResponse} response - Axios response object.
 * @returns {Array} The list of records (empty array if none found).
 */
export function extractList<T = unknown>(response?: AxiosResponse<ApiResponse<T> | T[] | Record<string, unknown>> | null): T[] {
    let raw = response?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    if (typeof raw === "object") {
        const typedRaw = raw as ApiResponse<T>;
        if (Array.isArray(typedRaw.data)) return typedRaw.data as T[];
        // Unwrap the outer { data: {...} } envelope Laravel adds around collections.
        if (typedRaw.data && typeof typedRaw.data === "object" && !Array.isArray(typedRaw.data)) {
            const nestedData = typedRaw.data as Record<string, unknown>;
            const key = Object.keys(nestedData).find(
                (k) => k !== "links" && k !== "meta" && Array.isArray(nestedData[k]),
            );
            if (key) return (nestedData[key] as T[]) || [];
        }
        // Check top-level resource key in raw (e.g. { users: [...], links: ..., meta: ... })
        const rawObj = raw as Record<string, unknown>;
        const key = Object.keys(rawObj).find(
            (k) => k !== "links" && k !== "meta" && Array.isArray(rawObj[k]),
        );
        if (key) return (rawObj[key] as T[]) || [];
    }
    return [];
}


export function extractMeta(response?: AxiosResponse<ApiResponse | unknown[] | Record<string, unknown>> | null, fallbackCount: number = 0): {
    totalPages: number;
    totalItems: number;
} {
    let raw = response?.data;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const typedRaw = raw as ApiResponse;
        if (typedRaw.data && typeof typedRaw.data === "object" && !Array.isArray(typedRaw.data)) {
            const nestedData = typedRaw.data as ApiResponse;
            if (nestedData.meta) {
                raw = nestedData;
            }
        }
    }
    const meta = (raw as ApiResponse)?.meta;
    if (meta) {
        return {
            totalPages: meta.last_page || meta.lastPage || 1,
            totalItems: meta.total ?? fallbackCount,
        };
    }
    return {totalPages: 1, totalItems: fallbackCount};
}


export function extractRecord<T = unknown>(response?: AxiosResponse<ApiResponse<T> | T | T[]> | null): T | null {
    const raw = response?.data;
    if (raw == null) return null;
    if (Array.isArray(raw)) return (raw[0] as T) ?? null;
    if (typeof raw === "object") {
        const typedRaw = raw as ApiResponse<T>;
        if ("data" in typedRaw && typedRaw.data !== undefined) {
            return (typedRaw.data as T) ?? null;
        }
        return raw as T;
    }
    return (raw as unknown as T) ?? null;
}
