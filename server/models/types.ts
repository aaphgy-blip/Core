export type UserRole = 'customer' | 'restaurant' | 'driver' | 'master';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  phone: string;
  profile_image: string | null;
  birthday: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublicProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  profile_image: string | null;
  birthday: string | null;
  is_active: boolean;
}

export interface RestaurantSchedule {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface Restaurant {
  id: string;
  owner_id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  logo_url: string;
  banner_url: string;
  rating: number;
  is_active: boolean;
  delivery_fee: number; // in cents
  delivery_time_min: number | null;
  delivery_time_max: number | null;
  distance_km: number | null;
  min_order: number; // in cents
  schedule?: RestaurantSchedule;
  category_tags: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  sort_order: number;
}

export interface ProductVariantOption {
  id: string;
  name: string;
  price_delta: number; // in cents (can be 0 or positive)
}

export interface ProductVariantGroup {
  id: string;
  name: string;
  required: boolean;
  min_selections: number;
  max_selections: number;
  options: ProductVariantOption[];
}

export interface ProductTopping {
  id: string;
  name: string;
  price: number; // in cents
  is_available: boolean;
}

export interface Product {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number; // in cents
  category: string;
  image_url: string;
  is_available: boolean;
  variants: ProductVariantGroup[];
  toppings: ProductTopping[];
  createdAt: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string; // e.g. "Casa", "Trabajo"
  street: string;
  number: string;
  colony: string;
  city: string;
  state: string;
  postal_code: string;
  references: string;
  is_default: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

export type OrderType = 'delivery' | 'pickup';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'digital';
export type PaymentStatus = 'pending' | 'proof_uploaded' | 'approved' | 'rejected';

export interface OrderItemVariantSelection {
  group_id: string;
  group_name: string;
  option_id: string;
  option_name: string;
  price_delta: number; // in cents
}

export interface OrderItemToppingSelection {
  id: string;
  name: string;
  price: number; // in cents
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  unit_price: number; // in cents (Core validated)
  quantity: number;
  variants: OrderItemVariantSelection[];
  toppings: OrderItemToppingSelection[];
  notes?: string;
  subtotal: number; // in cents: (unit_price + sum(variant) + sum(toppings)) * quantity
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  actor_id?: string;
  actor_role?: string;
  notes?: string;
}

export interface Order {
  id: string;
  idempotency_key: string;
  restaurant_id: string;
  restaurant_name: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  order_type: OrderType;
  address_id: string | null;
  delivery_address: string | null;
  items: OrderItem[];
  subtotal: number; // in cents
  extras_total: number; // in cents
  delivery_fee: number; // in cents (0 if pickup)
  service_fee: number; // in cents
  tip_amount: number; // in cents
  discount_amount: number; // in cents
  total: number; // in cents
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  driver_id?: string | null;
  has_allergies: boolean;
  allergies?: string;
  notes?: string;
  promo_code?: string;
  status_history: OrderStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  event: string;
  entity_type: string;
  entity_id: string;
  actor_id?: string;
  actor_role?: string;
  details: Record<string, unknown>;
  timestamp: string;
}
