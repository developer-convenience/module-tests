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

export const HOME_ROUTE: AppRoute = { page: "home" };

const PAYMENT_COMPLETE_KEY = "leather-shop:paymentComplete";

export function markPaymentComplete() {
  sessionStorage.setItem(PAYMENT_COMPLETE_KEY, "1");
}

export function consumePaymentCompleteGuard(): boolean {
  if (sessionStorage.getItem(PAYMENT_COMPLETE_KEY) !== "1") {
    return false;
  }
  sessionStorage.removeItem(PAYMENT_COMPLETE_KEY);
  return true;
}

export function routesEqual(a: AppRoute, b: AppRoute): boolean {
  return a.page === b.page && a.productId === b.productId && a.orderId === b.orderId;
}

export function routeToPath(route: AppRoute): string {
  switch (route.page) {
    case "home":
      return "/";
    case "shop":
      return "/shop";
    case "product":
      return `/product/${encodeURIComponent(route.productId ?? "")}`;
    case "custom":
      return route.productId
        ? `/custom/${encodeURIComponent(route.productId)}`
        : "/custom";
    case "atelier":
      return "/atelier";
    case "cart":
      return "/cart";
    case "checkout":
      return "/checkout";
    case "checkout-success": {
      const payment = route.payment;
      if (!payment?.paymentKey || !payment.orderId || !payment.amount) {
        return "/checkout/success";
      }
      const params = new URLSearchParams({
        paymentKey: payment.paymentKey,
        orderId: payment.orderId,
        amount: payment.amount,
      });
      return `/checkout/success?${params}`;
    }
    case "checkout-fail": {
      const params = new URLSearchParams();
      if (route.payment?.code) params.set("code", route.payment.code);
      if (route.payment?.message) params.set("message", route.payment.message);
      if (route.payment?.orderId) params.set("orderId", route.payment.orderId);
      const query = params.toString();
      return query ? `/checkout/fail?${query}` : "/checkout/fail";
    }
    case "login":
      return "/login";
    case "mypage":
      return "/mypage";
    case "order-detail":
      return `/order/${encodeURIComponent(route.orderId ?? "")}`;
    case "admin":
      return "/admin";
  }
}

function parseLegacyQueryRoute(search: string): AppRoute | null {
  const params = new URLSearchParams(search);
  const page = params.get("page");

  if (page === "checkout-success") {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");
    if (paymentKey && orderId && amount) {
      return {
        page: "checkout-success",
        payment: { paymentKey, orderId, amount },
      };
    }
  }

  if (page === "checkout-fail") {
    return {
      page: "checkout-fail",
      payment: {
        code: params.get("code") ?? undefined,
        message: params.get("message") ?? undefined,
        orderId: params.get("orderId") ?? undefined,
      },
    };
  }

  if (page === "admin") {
    return { page: "admin" };
  }

  return null;
}

export function parseLocation(
  pathname: string = window.location.pathname,
  search: string = window.location.search,
): AppRoute {
  const legacyRoute = parseLegacyQueryRoute(search);
  if (legacyRoute) {
    return legacyRoute;
  }

  const params = new URLSearchParams(search);
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return HOME_ROUTE;
  if (path === "/shop") return { page: "shop" };
  if (path === "/custom") return { page: "custom" };
  if (path === "/atelier") return { page: "atelier" };
  if (path === "/cart") return { page: "cart" };
  if (path === "/checkout") return { page: "checkout" };
  if (path === "/login") return { page: "login" };
  if (path === "/mypage") return { page: "mypage" };
  if (path === "/admin") return { page: "admin" };

  const productMatch = path.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    return { page: "product", productId: decodeURIComponent(productMatch[1]) };
  }

  const customMatch = path.match(/^\/custom\/([^/]+)$/);
  if (customMatch) {
    return { page: "custom", productId: decodeURIComponent(customMatch[1]) };
  }

  const orderMatch = path.match(/^\/order\/([^/]+)$/);
  if (orderMatch) {
    return { page: "order-detail", orderId: decodeURIComponent(orderMatch[1]) };
  }

  if (path === "/checkout/success") {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");
    if (paymentKey && orderId && amount) {
      return {
        page: "checkout-success",
        payment: { paymentKey, orderId, amount },
      };
    }
    return { page: "checkout-success" };
  }

  if (path === "/checkout/fail") {
    return {
      page: "checkout-fail",
      payment: {
        code: params.get("code") ?? undefined,
        message: params.get("message") ?? undefined,
        orderId: params.get("orderId") ?? undefined,
      },
    };
  }

  return HOME_ROUTE;
}

export function syncHistory(route: AppRoute, replace = false) {
  const path = routeToPath(route);
  const state = { route };
  if (replace) {
    window.history.replaceState(state, "", path);
  } else {
    window.history.pushState(state, "", path);
  }
}

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
