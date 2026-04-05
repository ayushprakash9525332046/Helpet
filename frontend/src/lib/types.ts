export interface User {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  role: "customer" | "provider" | "admin";
  status: "active" | "inactive" | "banned";
  is_verified: boolean;
  created_at: string;
  profile_picture?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  image?: string;
  category: ServiceCategory;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id?: string;
  service_id: string;
  service: {
    id: string;
    name: string;
    duration_minutes: number;
    category: { id: string; name: string };
  };
  status: "pending" | "confirmed" | "ongoing" | "completed" | "cancelled";
  scheduled_at: string;
  address: string;
  total_amount: number;
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  status: "pending" | "success" | "failed" | "refunded";
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "booking" | "payment" | "review" | "general";
  is_read: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
