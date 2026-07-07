import { useEffect, useRef, useState } from "react";
import { ANONYMOUS, loadTossPayments, type TossPaymentsWidgets } from "@tosspayments/tosspayments-sdk";
import { formatPrice } from "../assets";
import type { CartLine } from "../cart";
import {
  getCartTotal,
  getLineLabel,
  getLineTotal,
  SHIPPING_FEE,
} from "../cart";
import { buildOrderName, generateOrderId, savePendingOrder } from "../lib/order";
import { loadShippingFromStorage, saveShippingToStorage } from "../lib/shipping-storage";
import { isAddressComplete, type ShippingAddress, type ShippingInfo } from "../types/shipping";
import AddressFields from "./AddressFields";
import "./CheckoutForm.css";

const CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined;

type CheckoutFormProps = {
  cart: CartLine[];
};

let cachedInitialShipping: ShippingInfo | undefined;

function getInitialShipping(): ShippingInfo {
  if (!cachedInitialShipping) {
    cachedInitialShipping = loadShippingFromStorage();
  }
  return cachedInitialShipping;
}

export default function CheckoutForm({ cart }: CheckoutFormProps) {
  const [name, setName] = useState(() => getInitialShipping().name);
  const [phone, setPhone] = useState(() => getInitialShipping().phone);
  const [address, setAddress] = useState<ShippingAddress>(() => getInitialShipping().address);
  const [note, setNote] = useState(() => getInitialShipping().note);
  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetError, setWidgetError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  const total = getCartTotal(cart);

  useEffect(() => {
    saveShippingToStorage({ name, phone, address, note });
  }, [name, phone, address, note]);

  useEffect(() => {
    if (!CLIENT_KEY || total <= 0) return;

    let cancelled = false;
    const paymentMethodEl = paymentMethodRef.current;
    const agreementEl = agreementRef.current;
    if (!paymentMethodEl || !agreementEl) return;

    setWidgetReady(false);
    setWidgetError(null);
    paymentMethodEl.innerHTML = "";
    agreementEl.innerHTML = "";

    (async () => {
      try {
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        if (cancelled) return;

        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        await widgets.setAmount({ currency: "KRW", value: total });
        await widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        });
        await widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        });

        if (cancelled) return;
        widgetsRef.current = widgets;
        setWidgetReady(true);
      } catch {
        if (!cancelled) {
          setWidgetError("결제 위젯을 불러오지 못했습니다. 클라이언트 키를 확인해주세요.");
        }
      }
    })();

    return () => {
      cancelled = true;
      widgetsRef.current = null;
      paymentMethodEl.innerHTML = "";
      agreementEl.innerHTML = "";
    };
  }, [total]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isAddressComplete(address)) {
      alert("주소 검색 후 상세주소까지 입력해주세요.");
      return;
    }

    if (!CLIENT_KEY) {
      alert("결제 키가 설정되지 않았습니다. .env 파일에 VITE_TOSS_CLIENT_KEY를 추가해주세요.");
      return;
    }

    if (!widgetsRef.current || !widgetReady) {
      alert("결제 수단을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const orderId = generateOrderId();
    const orderName = buildOrderName(cart);
    const origin = `${window.location.origin}${window.location.pathname}`;

    savePendingOrder({
      orderId,
      orderName,
      amount: total,
      shipping: { name, phone, address, note },
      cart,
      createdAt: new Date().toISOString(),
    });

    setPaying(true);
    try {
      await widgetsRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${origin}/checkout/success`,
        failUrl: `${origin}/checkout/fail`,
        customerName: name,
        customerMobilePhone: phone.replace(/\D/g, ""),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "결제 요청 중 오류가 발생했습니다.";
      alert(message);
    } finally {
      setPaying(false);
    }
  }

  return (
    <form className="ls-checkout-form" onSubmit={handleSubmit}>
      <div className="ls-checkout-form__main">
        <section className="ls-checkout-form__section">
          <h2 className="ls-checkout-form__heading">배송 정보</h2>
          <div className="ls-checkout-form__field">
            <label htmlFor="name">이름</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="ls-checkout-form__field">
            <label htmlFor="phone">연락처</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <AddressFields value={address} onChange={setAddress} />
          <div className="ls-checkout-form__field">
            <label htmlFor="note">배송 메모</label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="문 앞에 놓아주세요"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </section>

        <section className="ls-checkout-form__section ls-checkout-form__section--payment">
          <h2 className="ls-checkout-form__heading">결제 수단</h2>
          {!CLIENT_KEY ? (
            <p className="ls-checkout-form__notice ls-checkout-form__notice--warn">
              <code>VITE_TOSS_CLIENT_KEY</code>가 설정되지 않았습니다. 토스페이먼츠 개발자센터에서
              테스트 클라이언트 키를 발급받아 <code>.env</code>에 추가해주세요.
            </p>
          ) : null}
          {widgetError ? (
            <p className="ls-checkout-form__notice ls-checkout-form__notice--warn">{widgetError}</p>
          ) : null}
          <div id="payment-method" ref={paymentMethodRef} className="ls-checkout-form__widget" />
          <div id="agreement" ref={agreementRef} className="ls-checkout-form__widget" />
        </section>
      </div>

      <aside className="ls-checkout-form__summary">
        <h2 className="ls-checkout-form__heading">주문 요약</h2>
        <dl className="ls-checkout-form__lines">
          {cart.map((line) => {
            const { title, subtitle } = getLineLabel(line);
            const label = subtitle ? `${title} (${subtitle})` : title;
            const qtyLabel = line.quantity > 1 ? ` × ${line.quantity}` : "";
            return (
              <div key={line.lineId}>
                <dt>
                  {label}
                  {qtyLabel}
                </dt>
                <dd>{formatPrice(getLineTotal(line))}</dd>
              </div>
            );
          })}
          <div>
            <dt>배송비</dt>
            <dd>{formatPrice(SHIPPING_FEE)}</dd>
          </div>
          <div className="ls-checkout-form__total">
            <dt>합계</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        <p className="ls-checkout-form__notice">
          주문제작 상품은 결제 후 2–3주 제작 기간이 소요됩니다.
        </p>
        <button
          type="submit"
          className="ls-btn ls-btn--filled ls-checkout-form__submit"
          disabled={paying || !widgetReady || !CLIENT_KEY}
        >
          {paying ? "결제 진행 중…" : widgetReady ? "결제하기" : "결제 수단 로딩 중…"}
        </button>
      </aside>
    </form>
  );
}
