import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import SocialLoginButtons from "../components/SocialLoginButtons";
import { formatPrice } from "../assets";
import type { PendingOrder } from "../lib/order";
import { useAuth } from "../context/AuthContext";
import { clearPendingOrder, loadPendingOrder } from "../lib/order";
import { savePendingClaim } from "../lib/api";
import { formatFullAddress } from "../types/shipping";
import "./CheckoutSuccessPage.css";

type PaymentParams = {
  paymentKey: string;
  orderId: string;
  amount: string;
};

type CheckoutSuccessPageProps = {
  payment: PaymentParams;
  onComplete: () => void;
  onHome: () => void;
  onLogin: (claim?: { orderId: string; claimToken: string }) => void;
  onMyPage: () => void;
};

type ConfirmState =
  | { status: "loading" }
  | { status: "success"; method: string; approvedAt: string; claimToken?: string | null }
  | { status: "error"; message: string };

export default function CheckoutSuccessPage({
  payment,
  onComplete,
  onHome,
  onLogin,
  onMyPage,
}: CheckoutSuccessPageProps) {
  const { session, user } = useAuth();
  const [state, setState] = useState<ConfirmState>({ status: "loading" });
  const [orderSnapshot, setOrderSnapshot] = useState<PendingOrder | null>(null);

  useEffect(() => {
    let cancelled = false;
    const pending = loadPendingOrder();

    (async () => {
      if (!pending) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              "주문 정보를 찾을 수 없습니다. 결제는 완료되었을 수 있으니 고객센터에 문의해주세요.",
          });
        }
        return;
      }

      setOrderSnapshot(pending);

      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            paymentKey: payment.paymentKey,
            orderId: payment.orderId,
            amount: Number(payment.amount),
            shipping: pending.shipping,
            items: pending.cart,
            orderName: pending.orderName,
          }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setState({
            status: "error",
            message: data.message ?? "결제 승인에 실패했습니다.",
          });
          return;
        }

        setState({
          status: "success",
          method: data.method ?? "카드",
          approvedAt: data.approvedAt ?? new Date().toISOString(),
          claimToken: data.claimToken ?? null,
        });
        clearPendingOrder();
        onComplete();
      } catch {
        if (!cancelled) {
          setState({
            status: "error",
            message: "서버와 통신하지 못했습니다. 백엔드 서버가 실행 중인지 확인해주세요.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [payment.paymentKey, payment.orderId, payment.amount, onComplete, session?.access_token]);

  const claimInfo =
    state.status === "success" && state.claimToken
      ? { orderId: payment.orderId, claimToken: state.claimToken }
      : null;

  function handleSaveToAccount() {
    if (claimInfo) {
      savePendingClaim(claimInfo);
      onLogin(claimInfo);
      return;
    }
    onLogin();
  }

  return (
    <main className="ls-checkout-result">
      <div className="ls-container ls-checkout-result__inner">
        {state.status === "loading" ? (
          <>
            <h1 className="ls-checkout-result__title">결제 확인 중…</h1>
            <p className="ls-checkout-result__text">잠시만 기다려주세요.</p>
          </>
        ) : null}

        {state.status === "success" ? (
          <>
            <h1 className="ls-checkout-result__title">주문이 완료되었습니다</h1>
            <p className="ls-checkout-result__text">
              결제가 정상적으로 승인되었습니다. 제작이 시작되면 연락드리겠습니다.
            </p>
            <dl className="ls-checkout-result__details">
              <div>
                <dt>주문번호</dt>
                <dd>{payment.orderId}</dd>
              </div>
              <div>
                <dt>결제금액</dt>
                <dd>{formatPrice(Number(payment.amount))}</dd>
              </div>
              <div>
                <dt>결제수단</dt>
                <dd>{state.method}</dd>
              </div>
              {orderSnapshot ? (
                <>
                  <div>
                    <dt>받는 분</dt>
                    <dd>{orderSnapshot.shipping.name}</dd>
                  </div>
                  <div>
                    <dt>배송지</dt>
                    <dd>
                      ({orderSnapshot.shipping.address.zonecode}){" "}
                      {formatFullAddress(orderSnapshot.shipping.address)}
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>

            <div className="ls-checkout-result__actions">
              {user ? (
                <button type="button" className="ls-btn ls-btn--filled" onClick={onMyPage}>
                  주문 내역 보기
                </button>
              ) : claimInfo ? (
                <>
                  <button
                    type="button"
                    className="ls-btn ls-btn--filled"
                    onClick={handleSaveToAccount}
                  >
                    로그인하고 주문 내역에 저장
                  </button>
                  <div className="ls-checkout-result__social">
                    <SocialLoginButtons
                      onBeforeLogin={() => {
                        if (claimInfo) savePendingClaim(claimInfo);
                      }}
                    />
                  </div>
                </>
              ) : null}
              <button type="button" className="ls-btn" onClick={onHome}>
                쇼핑 계속하기
              </button>
            </div>
          </>
        ) : null}

        {state.status === "error" ? (
          <>
            <h1 className="ls-checkout-result__title ls-checkout-result__title--error">
              결제 승인 실패
            </h1>
            <p className="ls-checkout-result__text">{state.message}</p>
            <button type="button" className="ls-btn" onClick={onHome}>
              홈으로
            </button>
          </>
        ) : null}
      </div>
      <Footer />
    </main>
  );
}
