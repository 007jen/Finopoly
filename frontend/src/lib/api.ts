// src/lib/api.ts

// 1. Determine the Base URL based on environment
// Force Re-deploy V2
const isProduction = import.meta.env.MODE === 'production';
const BASE_URL = isProduction
    ? "https://api.tryfinopoly.com"
    : (import.meta.env.VITE_API_URL || "http://localhost:5000");

type RequestOptions = RequestInit & {
    headers?: Record<string, string>;
};

// 2. NEW HELPER: Get the Clerk Token from the browser window (Global Access)
/**
 * Retrieves the Clerk JWT token directly from the window object.
 * This allows our API utility to stay "authenticated" without being 
 * deeply tied to the React lifecycle.
 */
const getClerkToken = async () => {
    if (typeof window !== 'undefined' && (window as any).Clerk) {
        const session = (window as any).Clerk.session;
        if (session) {
            return await session.getToken();
        }
    }
    return null;
};

// 3. The Internal Helper function
async function internalFetch<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

    // 🛑 FETCH TOKEN: Get valid session token
    const token = await getClerkToken();

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
    };

    // 📧 STAMP HEADER: Add Bearer token if session exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // If body is FormData, remove Content-Type to let browser set boundary
    if (options.body instanceof FormData) {
        delete headers["Content-Type"];
    }

    const config: RequestInit = {
        ...options,
        headers,
        credentials: "include", // Essential for cookie/session support
    };

    try {
        const startTime = performance.now();
        const response = await fetch(fullUrl, config);
        const duration = (performance.now() - startTime).toFixed(2);

        console.log(`⏱️ [API] ${options.method || 'GET'} ${url} - ${duration}ms`);

        // 4. Handle 4xx and 5xx errors
        if (!response.ok) {
            // Specialized 401 logging
            if (response.status === 401) {
                console.warn("🔐 API 401: Unauthorized - Token might be expired or missing.");
            }

            const errorData = await response.json().catch(() => ({}));

            // Extract and format the error message
            let rawError = errorData.error || errorData.message || `API Error: ${response.statusText}`;
            if (typeof rawError === 'object') {
                rawError = JSON.stringify(rawError);
            }

            throw new Error(rawError);
        }

        // 5. Handle Empty Responses (like 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}

// 3. The Public API Object (Mimics Axios syntax)
export const api = {
    get: <T>(url: string, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "GET" }),

    post: <T>(url: string, body: any, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),

    // New: Handle Multipart Form Data
    postMultipart: <T>(url: string, formData: FormData, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "POST", body: formData }),

    put: <T>(url: string, body: any, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) }),

    delete: <T>(url: string, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "DELETE" }),

    // Audit Admin
    createAuditCase: (data: any) =>
        api.post('/api/audit/create', data),
    listAdminAuditCases: () =>
        api.get<any[]>('/api/audit/list'),
    updateAuditCase: (id: string, data: any) =>
        api.put(`/api/audit/${id}`, data),
    deleteAuditCase: (id: string) =>
        api.delete(`/api/audit/${id}`),

    /* --- AZURE CLOUD START --- */
    // Azure AI Endpoints
    analyzeInvoice: (invoiceData: any) =>
        api.post('/api/audit/analyze-invoice', { invoiceData }),
    /* --- AZURE CLOUD END --- */
};
