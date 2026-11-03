/**
 * @file api.ts
 * @description Centralized HTTP API client using Axios with Request & Response Interceptors for Event Spacing.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://eventspacing.onrender.com/api";

/**
 * Configure dedicated Axios instance
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
 * Automatically injects the JWT Bearer token from localStorage into Authorization headers.
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("es_auth_token");
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
 * Extracts response data and handles global error codes (e.g. 401 Token Expiry, 403, 500).
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwraps response payload directly
    return response.data;
  },
  (error: AxiosError<any>) => {
    if (typeof window !== "undefined" && error.response) {
      const status = error.response.status;

      // Token expired or invalid session
      if (status === 401) {
        console.warn("[Axios Interceptor] Unauthorized request (401). Clearing stored auth token.");
        localStorage.removeItem("es_auth_token");
        localStorage.removeItem("es_user");

        // Optional: redirect to signin if user was attempting a protected action
        if (!window.location.pathname.includes("/signin")) {
          // Allow caller to catch before redirect or handle gracefully
        }
      }
    }

    // Standardize error message for frontend toast/error banners
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
 * Type-safe API service methods for Event Spacing
 */
export const api = {
  // Venues API
  venues: {
    getAll: (params?: Record<string, any>): Promise<any> =>
      httpClient.get("/venues", { params }),

    getFeatured: (): Promise<any> =>
      httpClient.get("/venues/featured"),

    getBySlug: (slugOrId: string): Promise<any> =>
      httpClient.get(`/venues/${slugOrId}`),

    inquire: (
      venueId: string,
      data: {
        name: string;
        email: string;
        phone: string;
        eventType?: string;
        eventDate?: string;
        guestCount?: any;
        message?: string;
      }
    ): Promise<any> => httpClient.post(`/venues/${venueId}/inquire`, data),

    onboard: (wizardData: any): Promise<any> =>
      httpClient.post("/venues/onboard", wizardData),
  },

  // Auth API
  auth: {
    login: (credentials: { email?: string; phone?: string; password: string }): Promise<any> =>
      httpClient.post("/auth/login", credentials),

    register: (userData: {
      name: string;
      email?: string;
      phone?: string;
      password: string;
      role?: string;
      companyName?: string;
    }): Promise<any> => httpClient.post("/auth/register", userData),

    sendOtp: (phone: string): Promise<any> =>
      httpClient.post("/auth/send-otp", { phone }),

    verifyOtp: (phone: string, otp: string, name?: string): Promise<any> =>
      httpClient.post("/auth/verify-otp", { phone, otp, name }),

    getMe: (): Promise<any> => httpClient.get("/auth/me"),

    updateProfile: (data: {
      name?: string;
      email?: string;
      phone?: string;
      companyName?: string;
      avatarUrl?: string;
    }): Promise<any> => httpClient.put("/auth/profile", data),

    changePassword: (data: {
      currentPassword?: string;
      newPassword: string;
    }): Promise<any> => httpClient.put("/auth/change-password", data),
  },

  // Bookings API
  bookings: {
    create: (bookingData: any): Promise<any> =>
      httpClient.post("/bookings", bookingData),

    getMyBookings: (): Promise<any> =>
      httpClient.get("/bookings/my-bookings"),

    getById: (id: string): Promise<any> =>
      httpClient.get(`/bookings/${id}`),

    cancel: (id: string): Promise<any> =>
      httpClient.post(`/bookings/${id}/cancel`),
  },

  // Inquiries / Leads API
  inquiries: {
    submitConcierge: (data: {
      name: string;
      email: string;
      phone: string;
      eventType?: string;
      eventDate?: string;
      guestCount?: any;
      budget?: number;
      message?: string;
    }): Promise<any> => httpClient.post("/inquiries/concierge", data),

    submitCorporate: (data: {
      name: string;
      email: string;
      phone: string;
      companyName: string;
      eventType?: string;
      eventDate?: string;
      guestCount?: any;
      budget?: number;
      message?: string;
    }): Promise<any> => httpClient.post("/inquiries/corporate", data),
  },

  // Vendor Marketplace API
  vendors: {
    getAll: (params?: {
      category?: string;
      locality?: string;
      q?: string;
      page?: number;
      limit?: number;
    }): Promise<any> => httpClient.get("/vendors", { params }),

    getById: (id: string): Promise<any> =>
      httpClient.get(`/vendors/${id}`),

    inquire: (
      vendorId: string,
      data: {
        name: string;
        email: string;
        phone: string;
        eventDate?: string;
        message?: string;
      }
    ): Promise<any> => httpClient.post(`/vendors/${vendorId}/inquire`, data),
  },

  // Taxonomies API
  categories: {
    getAll: (): Promise<any> => httpClient.get("/categories"),
    getLocalities: (): Promise<any> => httpClient.get("/categories/localities"),
  },
};
