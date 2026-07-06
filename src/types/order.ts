import type { CartLine } from "../cart";
import type { ShippingInfo } from "./shipping";

export type OrderStatus = "paid" | "making" | "preparing" | "delivered";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  paid: "결제완료",
  making: "제작중",
  preparing: "배송준비",
  delivered: "배송완료",
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "paid",
  "making",
  "preparing",
  "delivered",
];

export type StoredOrder = {
  id: string;
  order_id: string;
  user_id: string | null;
  status: OrderStatus;
  amount: number;
  order_name: string;
  shipping: ShippingInfo;
  items: CartLine[];
  payment_key: string;
  payment_method: string | null;
  approved_at: string;
  claim_token: string | null;
  claim_expires_at: string | null;
  claimed_at: string | null;
  created_at: string;
};

export type SocialProvider = "google" | "kakao" | "naver";

export const SOCIAL_PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: "Google",
  kakao: "카카오",
  naver: "네이버",
};
