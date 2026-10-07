export type UserRole = 'customer' | 'restaurant' | 'driver' | 'master';

export interface User {
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
  price_delta: number; // in cents
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
}

export interface CartItemVariant {
  group_id: string;
  group_name: string;
  option_id: string;
  option_name: string;
  price_delta: number;
}

export interface CartItemTopping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart entry key
  product: Product;
  quantity: number;
  selectedVariants: CartItemVariant[];
  selectedToppings: CartItemTopping[];
  notes?: string;
  unitPrice: number; // product.price + sum(variants) + sum(toppings)
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  number: string;
  colony: string;
  city: string;
  state: string;
  postal_code: string;
  references: string;
  is_default: boolean;
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

export interface OrderItem {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  variants: {
    group_id: string;
    group_name: string;
    option_id: string;
    option_name: string;
    price_delta: number;
  }[];
  toppings: {
    id: string;
    name: string;
    price: number;
  }[];
  notes?: string;
  subtotal: number;
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
  subtotal: number;
  extras_total: number;
  delivery_fee: number;
  service_fee: number;
  tip_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  has_allergies: boolean;
  allergies?: string;
  notes?: string;
  status_history: {
    status: OrderStatus;
    timestamp: string;
    actor_id?: string;
    actor_role?: string;
    notes?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface FeesInfo {
  service_fee: number;
  default_delivery_fee: number;
  minimum_order: number;
  currency: string;
}
