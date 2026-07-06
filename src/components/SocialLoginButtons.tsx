import { useAuth } from "../context/AuthContext";
import type { SocialProvider } from "../types/order";
import { SOCIAL_PROVIDER_LABELS } from "../types/order";
import "./SocialLoginButtons.css";

type SocialLoginButtonsProps = {
  onBeforeLogin?: () => void;
};

const PROVIDERS: SocialProvider[] = ["kakao", "naver", "google"];

export default function SocialLoginButtons({ onBeforeLogin }: SocialLoginButtonsProps) {
  const { signInWithProvider, configured } = useAuth();

  async function handleLogin(provider: SocialProvider) {
    onBeforeLogin?.();
    await signInWithProvider(provider);
  }

  if (!configured) {
    return (
      <p className="ls-social-login__notice">
        로그인 기능을 사용하려면 Supabase 환경변수를 설정해주세요.
      </p>
    );
  }

  return (
    <div className="ls-social-login">
      {PROVIDERS.map((provider) => (
        <button
          key={provider}
          type="button"
          className={`ls-social-login__btn ls-social-login__btn--${provider}`}
          onClick={() => handleLogin(provider)}
        >
          {SOCIAL_PROVIDER_LABELS[provider]}로 계속하기
        </button>
      ))}
    </div>
  );
}
