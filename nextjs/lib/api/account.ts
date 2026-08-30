import { apiFetch } from "./client";

export type AccountProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  address: string | null;
  created_at: string | null;
};

export type AccountOrderItem = {
  id: number;
  product_id: number;
  title: string;
  slug: string | null;
  thumbnail: string | null;
  qty: number;
  price: number;
  line_total: number;
};

export type AccountOrder = {
  id: number;
  order_number: string;
  status: "ordered" | "delivered" | "canceled" | string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string | null;
  address: string | null;
  delivery_type: "delivery" | "pickup";
  comment: string | null;
  items_count: number;
  subtotal: number;
  total: number;
  created_at: string | null;
  items?: AccountOrderItem[];
};

export type OrdersResponse = {
  data: {
    items: AccountOrder[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
};

export type CreateOrderPayload = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  delivery_type: "delivery" | "pickup";
  address?: string;
  comment?: string;
  items: Array<{ product_id: number; qty: number }>;
};

export type CreateOrderResponse = {
  data: {
    id: number;
    order_number: string;
    status: string;
    subtotal: number;
    total: number;
    account_created: boolean;
  };
};

export function createOrder(payload: CreateOrderPayload, token?: string | null) {
  return apiFetch<CreateOrderResponse>("orders", {
    method: "POST",
    body: payload,
    token: token || undefined,
    noStore: true,
  });
}

export function getAccountProfile(token: string) {
  return apiFetch<{ data: AccountProfile }>("account/profile", {
    token,
    noStore: true,
  });
}

export function updateAccountProfile(token: string, payload: Omit<AccountProfile, "id" | "created_at">) {
  return apiFetch<{ data: AccountProfile }>("account/profile", {
    method: "PUT",
    token,
    body: payload,
    noStore: true,
  });
}

export function updateAccountPassword(
  token: string,
  payload: { current_password: string; password: string; password_confirmation: string },
) {
  return apiFetch<{ ok: true }>("account/password", {
    method: "PUT",
    token,
    body: payload,
    noStore: true,
  });
}

export function getAccountOrders(token: string, page = 1, perPage = 10) {
  return apiFetch<OrdersResponse>("account/orders", {
    token,
    query: { page, per_page: perPage },
    noStore: true,
  });
}

export function getAccountOrder(token: string, id: number) {
  return apiFetch<{ data: AccountOrder }>(`account/orders/${id}`, {
    token,
    noStore: true,
  });
}
