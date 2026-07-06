import type { Session } from "@supabase/supabase-js";

import { apiUrl } from "./apiBase";

async function parseApiResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    const trimmed = text.trimStart();
    if (trimmed.startsWith("<!") || trimmed.startsWith("<!DOCTYPE")) {
      throw new Error(
        "API 서버에 연결할 수 없습니다. 로컬에서는 npm run dev:all, 배포 환경에서는 VITE_API_BASE_URL을 확인해 주세요.",
      );
    }
    throw new Error("서버 응답 형식이 올바르지 않습니다.");
  }

  let data: { message?: string };
  try {
    data = JSON.parse(text) as { message?: string };
  } catch {
    throw new Error("서버 응답을 해석할 수 없습니다.");
  }

  if (!res.ok) {
    throw new Error(data.message ?? "요청에 실패했습니다.");
  }

  return data as T;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  return parseApiResponse<T>(res);
}

export async function getAccessToken(session: Session | null): Promise<string | null> {
  return session?.access_token ?? null;
}

export async function adminFetch<T>(
  path: string,
  password: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Password": password,
      ...options.headers,
    },
  });

  return parseApiResponse<T>(res);
}

const PENDING_CLAIM_KEY = "leather-shop:pending-claim";

export type PendingClaim = {
  orderId: string;
  claimToken: string;
};

export function savePendingClaim(claim: PendingClaim): void {
  try {
    sessionStorage.setItem(PENDING_CLAIM_KEY, JSON.stringify(claim));
  } catch {
    // ignore
  }
}

export function loadPendingClaim(): PendingClaim | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CLAIM_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingClaim;
  } catch {
    return null;
  }
}

export function clearPendingClaim(): void {
  try {
    sessionStorage.removeItem(PENDING_CLAIM_KEY);
  } catch {
    // ignore
  }
}

export async function claimPendingOrder(token: string): Promise<boolean> {
  const pending = loadPendingClaim();
  if (!pending) return false;

  try {
    await apiFetch(`/api/orders/${encodeURIComponent(pending.orderId)}/claim`, {
      method: "POST",
      token,
      body: JSON.stringify({ claimToken: pending.claimToken }),
    });
    clearPendingClaim();
    return true;
  } catch {
    return false;
  }
}

const ADMIN_PASSWORD_KEY = "leather-shop:admin-password";

export function saveAdminPassword(password: string): void {
  try {
    sessionStorage.setItem(ADMIN_PASSWORD_KEY, password);
  } catch {
    // ignore
  }
}

export function loadAdminPassword(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_PASSWORD_KEY);
  } catch {
    return null;
  }
}

export function clearAdminPassword(): void {
  try {
    sessionStorage.removeItem(ADMIN_PASSWORD_KEY);
  } catch {
    // ignore
  }
}
