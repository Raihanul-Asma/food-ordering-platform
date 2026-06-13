export type UserRole = "customer" | "restaurant_owner" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Restaurant = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  address: string;
  city: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MenuItem = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  menu_item_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
};

export type CartLineItem = {
  id: string;
  quantity: number;
  menu_item: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    is_available: boolean;
    restaurant_id: string;
    restaurants: {
      name: string;
      is_active: boolean;
    } | null;
  } | null;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type Order = {
  id: string;
  customer_id: string;
  restaurant_id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  unit_price: number;
  quantity: number;
  created_at: string;
};

export type OrderWithRestaurant = Order & {
  restaurants: {
    name: string;
    owner_id: string;
  } | null;
};

export type OrderWithDetails = Order & {
  restaurants: {
    name: string;
    owner_id: string;
    address: string;
    city: string;
  } | null;
  order_items: OrderItem[];
};
