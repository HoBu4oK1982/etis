import { apiFetch } from "./client";

export type OrderFieldErrors = Record<string, string[]>;

export type CreateOrderPayload = {
  checkout_token: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  city: string;
  delivery_type: "delivery" | "pickup";
  address?: string;
  comment?: string;
  items: Array<{
    product_id: number;
    qty: number;
  }>;
};

export type CreateOrderResponse = {
  data: {
    id: number;
    order_number: string;
    status: string;
    subtotal: number;
    total: number;
    account_created: boolean;
    replayed: boolean;
  };
};

/**
 * Создаёт заказ в Laravel API.
 *
 * В запрос отправляются только ID товаров и количество. Цена из корзины
 * намеренно не передаётся: Laravel повторно получает товары из БД и сам
 * рассчитывает итоговую сумму.
 */
export function createOrder(
  payload: CreateOrderPayload,
  token?: string | null,
) {
  return apiFetch<CreateOrderResponse>("orders", {
    method: "POST",
    body: payload,
    token: token || undefined,
    noStore: true,
  });
}
