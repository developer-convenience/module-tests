import type { CartLine } from "../cart";
import { getLineLabel } from "../cart";
import type { ShippingInfo } from "../types/shipping";

const PENDING_ORDER_KEY = "leather-shop:pending-order";

export type PendingOrder = {
  orderId: string;
  orderName: string;
  amount: number;
  shipping: ShippingInfo;
  cart: CartLine[];
  createdAt: string;
};

export function generateOrderId(): string {
  const stamp = Date.now().toString(36);
  const rand = crypto.randomUUID().slice(0, 8);
  return `order_${stamp}_${rand}`;
}

export function buildOrderName(cart: CartLine[]): string {
  if (cart.length === 0) return "Atelier 주문";
  const { title } = getLineLabel(cart[0]);
  if (cart.length === 1) return title;
  return `${title} 외 ${cart.length - 1}건`;
}

export function savePendingOrder(order: PendingOrder): void {
  try {
    sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  } catch {
    // private browsing — payment confirm still works without order metadata
  }
}

export function loadPendingOrder(): PendingOrder | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingOrder;
  } catch {
    return null;
  }
}

export function clearPendingOrder(): void {
  try {
    sessionStorage.removeItem(PENDING_ORDER_KEY);
  } catch {
    // ignore
  }
}
