import { getProduct } from "./assets";
import { leatherSwatches, stitchColors } from "./routes";

export type CartLineStandard = {
  kind: "standard";
  lineId: string;
  productId: string;
  quantity: number;
};

export type CartLineCustom = {
  kind: "custom";
  lineId: string;
  productId: string;
  quantity: number;
  leatherId: string;
  stitchId: string;
  monogram: string;
};

export type CartLine = CartLineStandard | CartLineCustom;

export const MONOGRAM_FEE = 15_000;
export const SHIPPING_FEE = 3_000;

const CART_STORAGE_KEY = "leather-shop:cart";

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  if (typeof line.lineId !== "string" || typeof line.productId !== "string") return false;
  if (typeof line.quantity !== "number" || line.quantity < 1) return false;
  if (line.kind === "standard") return true;
  if (line.kind !== "custom") return false;
  return (
    typeof line.leatherId === "string" &&
    typeof line.stitchId === "string" &&
    typeof line.monogram === "string"
  );
}

function sanitizeCart(cart: CartLine[]): CartLine[] {
  return cart.filter((line) => {
    if (!getProduct(line.productId)) return false;
    if (line.kind === "standard") return true;
    const leatherOk = leatherSwatches.some((s) => s.id === line.leatherId);
    const stitchOk = stitchColors.some((s) => s.id === line.stitchId);
    return leatherOk && stitchOk;
  });
}

export function loadCartFromStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sanitizeCart(parsed.filter(isCartLine));
  } catch {
    return [];
  }
}

export function saveCartToStorage(cart: CartLine[]): void {
  try {
    if (cart.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // storage quota or private browsing — in-memory cart still works
  }
}

export function newLineId() {
  return crypto.randomUUID();
}

export function getLineUnitPrice(line: CartLine): number {
  const product = getProduct(line.productId);
  if (!product) return 0;
  if (line.kind === "standard") return product.price;
  return product.price + (line.monogram ? MONOGRAM_FEE : 0);
}

export function getLineTotal(line: CartLine): number {
  return getLineUnitPrice(line) * line.quantity;
}

export function getCartCount(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

export function getCartSubtotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + getLineTotal(line), 0);
}

export function getCartTotal(cart: CartLine[]): number {
  const subtotal = getCartSubtotal(cart);
  return subtotal > 0 ? subtotal + SHIPPING_FEE : 0;
}

export function addStandardToCart(cart: CartLine[], productId: string): CartLine[] {
  const existing = cart.find(
    (l): l is CartLineStandard => l.kind === "standard" && l.productId === productId,
  );
  if (existing) {
    return cart.map((l) =>
      l.lineId === existing.lineId ? { ...l, quantity: l.quantity + 1 } : l,
    );
  }
  return [...cart, { kind: "standard", lineId: newLineId(), productId, quantity: 1 }];
}

export function addCustomToCart(
  cart: CartLine[],
  item: Omit<CartLineCustom, "kind" | "lineId" | "quantity">,
): CartLine[] {
  const monogram = item.monogram ?? "";
  const match = cart.find(
    (l): l is CartLineCustom =>
      l.kind === "custom" &&
      l.productId === item.productId &&
      l.leatherId === item.leatherId &&
      l.stitchId === item.stitchId &&
      l.monogram === monogram,
  );
  if (match) {
    return cart.map((l) =>
      l.lineId === match.lineId ? { ...l, quantity: l.quantity + 1 } : l,
    );
  }
  return [
    ...cart,
    {
      kind: "custom",
      lineId: newLineId(),
      quantity: 1,
      ...item,
      monogram,
    },
  ];
}

export function updateLineQuantity(cart: CartLine[], lineId: string, delta: number): CartLine[] {
  return cart
    .map((l) =>
      l.lineId === lineId && l.kind === "standard"
        ? { ...l, quantity: l.quantity + delta }
        : l,
    )
    .filter((l) => l.quantity > 0);
}

export function removeLine(cart: CartLine[], lineId: string): CartLine[] {
  return cart.filter((l) => l.lineId !== lineId);
}

export function getLineLabel(line: CartLine): { title: string; subtitle?: string } {
  const product = getProduct(line.productId);
  const title = product?.name ?? "Unknown product";
  if (line.kind === "standard") return { title };

  const leather = leatherSwatches.find((s) => s.id === line.leatherId);
  const stitch = stitchColors.find((s) => s.id === line.stitchId);
  const parts = [
    leather?.name,
    stitch ? `${stitch.name} stitch` : undefined,
    line.monogram ? `Monogram: ${line.monogram}` : undefined,
    "Custom order",
  ].filter(Boolean);

  return { title, subtitle: parts.join(" · ") };
}
