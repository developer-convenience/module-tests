import { useEffect } from "react";

import Footer from "../components/Footer";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { useAuth } from "../context/AuthContext";
import { savePendingClaim } from "../lib/api";
import "./LoginPage.css";

type LoginPageProps = {
  onBack: () => void;
  onSuccess: () => void;
  pendingClaim?: { orderId: string; claimToken: string } | null;
};

export default function LoginPage({ onBack, onSuccess, pendingClaim }: LoginPageProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      onSuccess();
    }
  }, [loading, user, onSuccess]);

  function handleBeforeLogin() {
    if (pendingClaim) {
      savePendingClaim(pendingClaim);
    }
  }

  return (
    <main className="ls-login-page">
      <div className="ls-container ls-login-page__inner">
        <button type="button" className="ls-link ls-login-page__back" onClick={onBack}>
          ← 돌아가기
        </button>

        <p className="ls-eyebrow">Account</p>
        <h1 className="ls-login-page__title">로그인</h1>
        <p className="ls-login-page__text">
          {pendingClaim
            ? "로그인하면 방금 주문한 내역을 마이페이지에서 확인할 수 있습니다."
            : "소셜 계정으로 로그인하고 주문 내역을 확인하세요."}
        </p>

        <SocialLoginButtons onBeforeLogin={handleBeforeLogin} />

        <p className="ls-login-page__hint">
          쇼핑과 결제는 로그인 없이도 가능합니다. 주문 조회만 로그인이 필요합니다.
        </p>
      </div>
      <Footer />
    </main>
  );
}
