import Footer from "../components/Footer";
import "./CheckoutSuccessPage.css";

type PaymentFailParams = {
  code?: string;
  message?: string;
  orderId?: string;
};

type CheckoutFailPageProps = {
  payment?: PaymentFailParams;
  onRetry: () => void;
  onHome: () => void;
};

export default function CheckoutFailPage({ payment, onRetry, onHome }: CheckoutFailPageProps) {
  const message = payment?.message ?? "결제가 취소되었거나 실패했습니다.";

  return (
    <main className="ls-checkout-result">
      <div className="ls-container ls-checkout-result__inner">
        <h1 className="ls-checkout-result__title ls-checkout-result__title--error">결제 실패</h1>
        <p className="ls-checkout-result__text">{message}</p>
        {payment?.code ? (
          <p className="ls-checkout-result__code">오류 코드: {payment.code}</p>
        ) : null}
        <div className="ls-checkout-result__actions">
          <button type="button" className="ls-btn ls-btn--filled" onClick={onRetry}>
            다시 결제하기
          </button>
          <button type="button" className="ls-btn" onClick={onHome}>
            홈으로
          </button>
        </div>
      </div>
      <Footer />
    </main>
  );
}
