import { EMPTY_ADDRESS, type ShippingAddress, type ShippingInfo } from "../types/shipping";

const SHIPPING_STORAGE_KEY = "leather-shop:shipping-info";

const EMPTY_SHIPPING: ShippingInfo = {
  name: "",
  phone: "",
  address: EMPTY_ADDRESS,
  note: "",
};

function isShippingAddress(value: unknown): value is ShippingAddress {
  if (!value || typeof value !== "object") return false;
  const addr = value as Record<string, unknown>;
  return (
    typeof addr.zonecode === "string" &&
    typeof addr.roadAddress === "string" &&
    typeof addr.jibunAddress === "string" &&
    typeof addr.detailAddress === "string"
  );
}

function isShippingInfo(value: unknown): value is ShippingInfo {
  if (!value || typeof value !== "object") return false;
  const info = value as Record<string, unknown>;
  return (
    typeof info.name === "string" &&
    typeof info.phone === "string" &&
    typeof info.note === "string" &&
    isShippingAddress(info.address)
  );
}

function isEmptyShipping(info: ShippingInfo): boolean {
  return (
    !info.name.trim() &&
    !info.phone.trim() &&
    !info.note.trim() &&
    !info.address.zonecode &&
    !info.address.roadAddress &&
    !info.address.jibunAddress &&
    !info.address.detailAddress.trim()
  );
}

export function loadShippingFromStorage(): ShippingInfo {
  try {
    const raw = localStorage.getItem(SHIPPING_STORAGE_KEY);
    if (!raw) return EMPTY_SHIPPING;
    const parsed: unknown = JSON.parse(raw);
    if (!isShippingInfo(parsed)) return EMPTY_SHIPPING;
    return parsed;
  } catch {
    return EMPTY_SHIPPING;
  }
}

export function saveShippingToStorage(info: ShippingInfo): void {
  try {
    if (isEmptyShipping(info)) {
      localStorage.removeItem(SHIPPING_STORAGE_KEY);
      return;
    }
    localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // storage quota or private browsing
  }
}
