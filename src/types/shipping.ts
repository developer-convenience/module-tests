export type ShippingAddress = {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  detailAddress: string;
};

export type ShippingInfo = {
  name: string;
  phone: string;
  address: ShippingAddress;
  note: string;
};

export const EMPTY_ADDRESS: ShippingAddress = {
  zonecode: "",
  roadAddress: "",
  jibunAddress: "",
  detailAddress: "",
};

export function formatFullAddress(address: ShippingAddress): string {
  const base = address.roadAddress || address.jibunAddress;
  if (!base) return "";
  const parts = [base, address.detailAddress].filter(Boolean);
  return parts.join(" ");
}

export function isAddressComplete(address: ShippingAddress): boolean {
  return Boolean(address.zonecode && (address.roadAddress || address.jibunAddress) && address.detailAddress.trim());
}
