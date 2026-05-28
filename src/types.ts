export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  categoryId: string;
  inventory: number;
}

export interface DeliveryBoy {
  id: string;
  name: string;
  mobile: string;
  username: string;
  password?: string;
  commissionRate: number; // default e.g. 10 for 10%
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerAddress: string;
  customerMobile: string;
  status: "Pending" | "Assigned" | "Delivered" | "Cancelled";
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  createdAt: string; // ISO String or human readable timestamp
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  active: boolean;
}

export interface AdminSettings {
  storeOpen: boolean;
  storeName: string;
  storePhone: string;
  deliveryCharge: number;
  deliveryLocations: string[];
  promoCodes: PromoCode[];
  adminUsername: string; // default e.g. "admin"
  adminPassword?: string; // default e.g. "admin123"
}
