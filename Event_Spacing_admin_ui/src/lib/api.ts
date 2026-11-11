/**
 * @file api.ts
 * @description Centralized HTTP API client for Event Spacing Admin UI connecting to MongoDB Atlas backend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string; count?: number }> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  admin: {
    getMetrics: () => request<any>("/admin/metrics"),
    getTransactions: () => request<any[]>("/admin/transactions"),
    getVenues: () => request<any[]>("/admin/venues"),
    toggleVenueVerified: (id: string, data: { isVerified?: boolean; badge?: string; status?: string }) =>
      request(`/admin/venues/${id}/verify`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    getVenueApprovals: () => request<any[]>("/admin/venues/approvals"),
    approveVenue: (id: string) =>
      request(`/admin/venues/${id}/approve`, { method: "PUT" }),
    rejectVenue: (id: string) =>
      request(`/admin/venues/${id}/reject`, { method: "PUT" }),
  },
  venues: {
    getAll: () => request<any[]>("/venues"),
  },
  vendors: {
    getAll: () => request<any[]>("/vendors"),
  },
  bookings: {
    getPendingApprovals: () => request<any[]>("/bookings/pending-approvals"),
    approve: (id: string, notes?: string) =>
      request(`/bookings/${id}/approve`, {
        method: "PUT",
        body: JSON.stringify({ notes }),
      }),
    reject: (id: string, reason?: string) =>
      request(`/bookings/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      }),
  },
  settings: {
    getUpi: () => request<any>("/settings/upi"),
    updateUpi: (data: any) =>
      request("/settings/upi", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },
  categories: {
    getAll: () => request<any>("/categories"),
  },
};

