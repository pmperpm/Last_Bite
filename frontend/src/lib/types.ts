// Auth / User

export type UserRole = "student_worker" | "business_owner" | "admin";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  business_name?: string;
  avatar?: string;
  created_at: string;
}

// Allergy Tags

export interface AllergyTag {
  id: number;
  name: string;
}

// Meals

export type MealStatus = "draft" | "available" | "sold_out" | "expired" | "cancelled";

export interface MealList {
  id: number;
  title: string;
  image: string | null;
  discounted_price: string;
  original_price: string;
  discount_percent: number;
  quantity_remaining: number;
  pickup_start: string;
  pickup_end: string;
  status: MealStatus;
  posted_by_name: string;
  allergy_tags: AllergyTag[];
}

export interface MealDetail extends MealList {
  posted_by_id: number;
  description: string;
  quantity_total: number;
  calories?: number;
  protein_g?: string;
  carbs_g?: string;
  fat_g?: string;
  allergy_notes: string;
  expiry_time: string;
  created_at: string;
  updated_at: string;
}

// Bookings

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export interface Booking {
  id: number;
  user_email: string;
  user_full_name: string;
  meal: MealList;
  quantity: number;
  total_price: string;
  status: BookingStatus;
  confirmed_at: string | null;
  ready_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string;
  user_confirmed_received: boolean;
  business_marked_finished: boolean;
  created_at: string;
  updated_at: string;
}

// Payments

export type PaymentStatus = "uploaded" | "verified" | "rejected";

export interface Payment {
  id: number;
  booking_id: number;
  meal_title: string;
  user_email: string;
  amount: string;
  slip_image: string;
  status: PaymentStatus;
  rejection_reason: string;
  verified_by_email: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// API Responses

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
