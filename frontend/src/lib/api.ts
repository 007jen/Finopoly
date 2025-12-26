// src/lib/api.ts

// 1. Determine the Base URL based on environment
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

type RequestOptions = RequestInit & {
    headers?: Record<string, string>;
};

// 2. The Internal Helper function
async function internalFetch<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const config: RequestInit = {
        ...options,
        headers,
        credentials: "include", // CRITICAL: This sends cookies/sessions to the backend
    };

    try {
        const response = await fetch(fullUrl, config);

        // 3. Handle 4xx and 5xx errors (Fetch doesn't do this automatically!)
        if (!response.ok) {
            // Try to parse JSON error, fallback to empty object if fails
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }

        // 4. Handle Empty Responses (like 204 No Content)
        if (response.status === 204) {
            return {} as T;
        }

        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error; // Re-throw so your UI knows something went wrong
    }
}

// 3. The Public API Object (Mimics Axios syntax)
export const api = {
    get: <T>(url: string, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "GET" }),

    post: <T>(url: string, body: any, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),

    put: <T>(url: string, body: any, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) }),

    delete: <T>(url: string, options?: RequestOptions) =>
        internalFetch<T>(url, { ...options, method: "DELETE" }),
};