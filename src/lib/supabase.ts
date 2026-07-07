import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getAuthRedirectUrl(): string {
  return `${window.location.origin}/login`;
}

/** OAuth/PKCE 콜백 후 URL에 남은 토큰·code 파라미터 제거 */
export function clearAuthParamsFromUrl(): boolean {
  const { pathname, search, hash } = window.location;
  const hasAuthHash =
    hash.includes("access_token") ||
    hash.includes("refresh_token") ||
    hash.includes("error=") ||
    hash.includes("error_description");

  const params = new URLSearchParams(search);
  const hasAuthQuery = params.has("code") || params.has("error");

  if (!hasAuthHash && !hasAuthQuery) {
    return false;
  }

  if (hasAuthHash) {
    window.history.replaceState(window.history.state, "", pathname + search);
    return true;
  }

  params.delete("code");
  params.delete("error");
  params.delete("error_description");
  const nextSearch = params.toString();
  window.history.replaceState(
    window.history.state,
    "",
    pathname + (nextSearch ? `?${nextSearch}` : ""),
  );
  return true;
}

export const AUTH_URL_CLEANED_EVENT = "leather-shop:auth-url-cleaned";
