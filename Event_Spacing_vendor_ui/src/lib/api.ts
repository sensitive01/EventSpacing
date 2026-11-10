/**
 * @file api.ts
 * @description Centralized HTTP API client using Axios with Request & Response Interceptors for Event Spacing Vendor Hub.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://eventspacing.onrender.com/api";

/**
 * Configure dedicated Axios instance for Vendor Portal
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 1. REQUEST INTERCEPTOR:
 * Automatically injects the JWT Bearer token from localStorage (es_vendor_token) into Authorization headers.
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("es_vendor_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 2. RESPONSE INTERCEPTOR:
 * Extracts response data and handles global error codes (e.g. 401 Token Expiry).
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError<any>) => {
    if (typeof window !== "undefined" && error.response) {
      const status = error.response.status;
      if (status === 401) {
        console.warn("[Vendor Axios] Unauthorized request (401). Clearing vendor session.");
        localStorage.removeItem("es_vendor_token");
        localStorage.removeItem("es_vendor_user");
      }
    }

    const serverMessage =
      error.response?.data?.message ||
      (error.response?.data?.errors ? error.response.data.errors.map((e: any) => e.message).join(", ") : null) ||
      error.message ||
      "An unexpected network error occurred.";

    const customError = new Error(serverMessage);
    (customError as any).status = error.response?.status;
    (customError as any).data = error.response?.data;

    return Promise.reject(customError);
  }
);

/**
 * Type-safe API service methods for Event Spacing Vendor Hub
 */
export const api = {
  // Authentication & Partner Identity
  auth: {
    login: (data: { email?: string; password?: string; phone?: string }): Promise<any> =>
      httpClient.post("/auth/login", data),

    register: (data: {
      name: string;
      email: string;
      password?: string;
      phone?: string;
      role?: string;
      companyName?: string;
    }): Promise<any> => httpClient.post("/auth/register", { ...data, role: "vendor" }),

    sendOtp: (phone: string): Promise<any> =>
      httpClient.post("/auth/send-otp", { phone }),

    verifyOtp: (phone: string, otp: string): Promise<any> =>
      httpClient.post("/auth/verify-otp", { phone, otp, role: "vendor" }),

    getMe: (): Promise<any> => httpClient.get("/auth/me"),

    updateProfile: (data: any): Promise<any> => httpClient.put("/auth/profile", data),
  },

  // Vendor Portal Management Endpoints
  vendor: {
    getStats: (): Promise<any> => httpClient.get("/vendor-portal/stats"),

    getProfile: (): Promise<any> => httpClient.get("/vendor-portal/profile"),

    updateProfile: (data: any): Promise<any> => httpClient.put("/vendor-portal/profile", data),

    getVenues: (params?: Record<string, any>): Promise<any> =>
      httpClient.get("/vendor-portal/venues", { params }),

    getVenueById: (id: string): Promise<any> =>
      httpClient.get(`/vendor-portal/venues/${id}`),

    createVenue: (data: any): Promise<any> =>
      httpClient.post("/vendor-portal/venues", data),

    updateVenue: (id: string, data: any): Promise<any> =>
      httpClient.put(`/vendor-portal/venues/${id}`, data),

    deleteVenue: (id: string): Promise<any> =>
      httpClient.delete(`/vendor-portal/venues/${id}`),

    getLeads: (params?: Record<string, any>): Promise<any> =>
      httpClient.get("/vendor-portal/leads", { params }),

    updateLeadStatus: (id: string, status: string, notes?: string): Promise<any> =>
      httpClient.patch(`/vendor-portal/leads/${id}/status`, { status, notes }),

    getCalendar: (venueId?: string): Promise<any> =>
      httpClient.get("/vendor-portal/calendar", { params: { venueId } }),

    toggleDateBlock: (data: {
      venueId?: string;
      date: string;
      status: string;
      notes?: string;
      priceModifier?: number;
    }): Promise<any> => httpClient.post("/vendor-portal/calendar/slot", data),

    getPayouts: (): Promise<any> => httpClient.get("/vendor-portal/payouts"),
  },
};

export default api;
