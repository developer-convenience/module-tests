export type Page =
  | "home"
  | "shop"
  | "product"
  | "custom"
  | "atelier"
  | "cart"
  | "checkout"
  | "checkout-success"
  | "checkout-fail"
  | "login"
  | "mypage"
  | "order-detail"
  | "admin";

export type PaymentCallback = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
  code?: string;
  message?: string;
};

export type AppRoute = {
  page: Page;
  productId?: string;
  orderId?: string;
  payment?: PaymentCallback;
  pendingClaim?: { orderId: string; claimToken: string };
};

export const leatherSwatches = [
  { id: "cognac", name: "Cognac", hex: "#8B4513" },
  { id: "olive", name: "Olive", hex: "#556B2F" },
  { id: "black", name: "Black", hex: "#1A1410" },
  { id: "natural", name: "Natural", hex: "#C4A77D" },
] as const;

export const stitchColors = [
  { id: "cream", name: "Cream", hex: "#F5F0E8" },
  { id: "brown", name: "Brown", hex: "#5C4033" },
  { id: "navy", name: "Navy", hex: "#1E2A3A" },
] as const;
