import axios from "axios";
import type {
  AllergyTag,
  Booking,
  MealDetail,
  MealList,
  PaginatedResponse,
  Payment,
  User,
} from "./types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth 

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<{ access: string; refresh: string }>("/auth/login/", { email, password }),
  refresh: (refresh: string) =>
    api.post<{ access: string }>("/auth/token/refresh/", { refresh }),
  me: () => api.get("/auth/me/"),
};

// Meals

export interface MealFilters {
  status?: string;
  min_price?: number;
  max_price?: number;
  allergy_tag?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

export const mealsAPI = {
  list: (params?: MealFilters) =>
    api.get<PaginatedResponse<MealList>>("/meals/", { params }),
  detail: (id: number) => api.get<MealDetail>(`/meals/${id}/`),
  create: (data: FormData) => api.post<MealDetail>("/meals/", data),
  update: (id: number, data: FormData) => api.patch<MealDetail>(`/meals/${id}/`, data),
  delete: (id: number) => api.delete(`/meals/${id}/`),
  publish: (id: number) => api.post(`/meals/${id}/publish/`),
  cancel: (id: number) => api.post(`/meals/${id}/cancel/`),
  allergyTags: () => api.get<AllergyTag[]>("/meals/allergy-tags/"),
};

// Bookings

export const bookingsAPI = {
  list: (params?: { page?: number }) =>
    api.get<PaginatedResponse<Booking>>("/bookings/", { params }),
  detail: (id: number) => api.get<Booking>(`/bookings/${id}/`),
  create: (meal: number, quantity: number) =>
    api.post<Booking>("/bookings/", { meal, quantity }),

  // Student actions
  confirmReceived: (id: number) =>
    api.post<{ status: string }>(`/bookings/${id}/confirm_received/`),

  // Business actions
  confirmPayment: (id: number) =>
    api.post<{ status: string }>(`/bookings/${id}/confirm_payment/`),
  markReady: (id: number) =>
    api.post<{ status: string }>(`/bookings/${id}/mark_ready/`),
  finish: (id: number) =>
    api.post<{ status: string }>(`/bookings/${id}/finish/`),
  cancel: (id: number, reason?: string) =>
    api.post<{ status: string }>(`/bookings/${id}/cancel/`, { reason }),
};

// Payments 

export const paymentsAPI = {
  list: (params?: { page?: number }) =>
    api.get<PaginatedResponse<Payment>>("/payments/", { params }),
  detail: (id: number) => api.get<Payment>(`/payments/${id}/`),
  upload: (booking: number, slipImage: File) => {
    const form = new FormData();
    form.append("booking", String(booking));
    form.append("slip_image", slipImage);
    return api.post<Payment>("/payments/", form);
  },
  verify: (id: number) => api.post<{ status: string }>(`/payments/${id}/verify/`),
  reject: (id: number, reason: string) =>
    api.post<{ status: string }>(`/payments/${id}/reject/`, { reason }),
};

// Users 

export const usersAPI = {
  list: (params?: { page?: number }) =>
    api.get<PaginatedResponse<User>>("/auth/users/", { params }),
  detail: (id: number) => api.get<User>(`/auth/users/${id}/`),
  delete: (id: number) => api.delete(`/auth/users/${id}/`),
};
