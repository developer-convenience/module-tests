import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { Provider, Session, User } from "@supabase/supabase-js";

import { claimPendingOrder } from "../lib/api";
import {
  AUTH_URL_CLEANED_EVENT,
  clearAuthParamsFromUrl,
  getAuthRedirectUrl,
  supabase,
  supabaseConfigured,
} from "../lib/supabase";
import type { SocialProvider } from "../types/order";

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signInWithProvider: (provider: SocialProvider) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SUPABASE_OAUTH_PROVIDERS: Record<SocialProvider, Provider> = {
  google: "google",
  kakao: "kakao",
  naver: "custom:naver" as Provider,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session);
        setLoading(false);
        if (data.session && clearAuthParamsFromUrl()) {
          window.dispatchEvent(new CustomEvent(AUTH_URL_CLEANED_EVENT));
        }
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (nextSession && clearAuthParamsFromUrl()) {
        window.dispatchEvent(new CustomEvent(AUTH_URL_CLEANED_EVENT));
      }

      if (nextSession?.access_token) {
        await claimPendingOrder(nextSession.access_token);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = useCallback(async (provider: SocialProvider) => {
    if (!supabase) {
      alert("Supabase가 설정되지 않았습니다. .env 파일을 확인해주세요.");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: SUPABASE_OAUTH_PROVIDERS[provider],
      options: {
        redirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) {
      alert(error.message || "로그인에 실패했습니다.");
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: supabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      signInWithProvider,
      signOut,
    }),
    [loading, session, signInWithProvider, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
