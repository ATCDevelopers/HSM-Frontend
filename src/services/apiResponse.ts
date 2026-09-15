/**
 * Helpers for reading Laravel API responses.
 *
 * List endpoints return a resource collection shaped like:
 *   { <resourceKey>: [...], links: {...}, meta: { current_page, last_page, per_page, total } }
 * where <resourceKey> is the resource name (e.g. "users", "unit_statuses").
 * Some endpoints may instead return a bare array or a { data: [...] } wrapper.
 */

interface ApiResponse<T = unknown> {
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

interface AxiosResponse<T = unknown> {
    data?: T;
}

/**
 * Extracts the array payload from a list response, regardless of the wrapper key.
 *
 * @param {AxiosResponse} response - Axios response object.
 * @returns {Array} The list of records (empty array if none found).
 */
export function extractList<T = unknown>(response: AxiosResponse<ApiResponse<T> | T[]>): T[] {
    let raw = response?.data;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") {
        const typedRaw = raw as ApiResponse<T>;
        if (Array.isArray(typedRaw.data)) return typedRaw.data;
        // Unwrap the outer { data: {...} } envelope Laravel adds around collections.
        if (typedRaw.data && typeof typedRaw.data === "object" && !Array.isArray(typedRaw.data)) {
            const nestedData = typedRaw.data as Record<string, unknown>;
            const key = Object.keys(nestedData).find(
                (k) => k !== "links" && k !== "meta" && Array.isArray(nestedData[k]),
            );
            if (key) return nestedData[key] as T[];
        }
    }
    return [];
}

/**
 * Extracts pagination info from a list response.
 *
 * @param {AxiosResponse} response - Axios response object.
 * @param {number} [fallbackCount=0] - Item count to use when no meta is present.
 * @returns {{ totalPages: number, totalItems: number }}
 */
export function extractMeta(response: AxiosResponse<ApiResponse | unknown[]>, fallbackCount: number = 0): {
    totalPages: number;
    totalItems: number;
} {
    let raw = response?.data;
    if (raw && typeof raw === "object") {
        const typedRaw = raw as ApiResponse;
        if (typedRaw.data && typeof typedRaw.data === "object" && !Array.isArray(typedRaw.data)) {
            raw = typedRaw.data;
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

/**
 * Extracts a single record from a show/detail response
 * (handles { data: {...} }, a bare object, or a single-element array).
 *
 * @param {AxiosResponse} response - Axios response object.
 * @returns {Object|null}
 */
export function extractRecord<T = unknown>(response: AxiosResponse<ApiResponse<T> | T[]>): T | null {
    const raw = response?.data;
    if (Array.isArray(raw)) return raw[0] ?? null;
    if (raw && typeof raw === "object") {
        const typedRaw = raw as ApiResponse<T>;
        return (typedRaw.data as T) ?? (raw as T);
    }
    return raw ?? null;
}
