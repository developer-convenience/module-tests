import { useEffect, useState } from "react";

import { formatPrice } from "../assets";
import { getLineLabel, getLineTotal } from "../cart";
import Footer from "../components/Footer";
import OrderStatusProgress from "../components/OrderStatusProgress";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { formatFullAddress } from "../types/shipping";
import type { StoredOrder } from "../types/order";
import "./OrderDetailPage.css";

type OrderDetailPageProps = {
  orderId: string;
  onBack: () => void;
  onLogin: () => void;
};

export default function OrderDetailPage({ orderId, onBack, onLogin }: OrderDetailPageProps) {
  const { user, session, loading } = useAuth();
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      onLogin();
      return;
    }

    let cancelled = false;
    setFetching(true);
    setError(null);

    apiFetch<{ order: StoredOrder }>(`/api/orders/${encodeURIComponent(orderId)}`, {
      token: session?.access_token,
    })
      .then((data) => {
        if (!cancelled) setOrder(data.order);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "주문 정보를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user, session, orderId, onLogin]);

  return (
    <main className="ls-order-detail">
      <div className="ls-container ls-order-detail__inner">
        <button type="button" className="ls-link ls-order-detail__back" onClick={onBack}>
          ← 주문 목록
        </button>

        {fetching ? <p className="ls-order-detail__status">불러오는 중…</p> : null}
        {error ? <p className="ls-order-detail__error">{error}</p> : null}

        {order ? (
          <>
            <p className="ls-eyebrow">Order</p>
            <h1 className="ls-order-detail__title">{order.order_name}</h1>
            <p className="ls-order-detail__meta">
              주문번호 <span>{order.order_id}</span>
            </p>

            <section className="ls-order-detail__section">
              <h2>제작 · 배송 상태</h2>
              <OrderStatusProgress status={order.status} />
            </section>

            <section className="ls-order-detail__section">
              <h2>주문 상품</h2>
              <ul className="ls-order-detail__items">
                {order.items.map((line) => {
                  const { title, subtitle } = getLineLabel(line);
                  return (
                    <li key={line.lineId}>
                      <div>
                        <p className="ls-order-detail__item-title">{title}</p>
                        {subtitle ? (
                          <p className="ls-order-detail__item-sub">{subtitle}</p>
                        ) : null}
                      </div>
                      <div className="ls-order-detail__item-right">
                        <span>× {line.quantity}</span>
                        <span>{formatPrice(getLineTotal(line))}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="ls-order-detail__section">
              <h2>배송 정보</h2>
              <dl className="ls-order-detail__dl">
                <div>
                  <dt>받는 분</dt>
                  <dd>{order.shipping.name}</dd>
                </div>
                <div>
                  <dt>연락처</dt>
                  <dd>{order.shipping.phone}</dd>
                </div>
                <div>
                  <dt>주소</dt>
                  <dd>
                    ({order.shipping.address.zonecode}) {formatFullAddress(order.shipping.address)}
                  </dd>
                </div>
                {order.shipping.note ? (
                  <div>
                    <dt>요청사항</dt>
                    <dd>{order.shipping.note}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="ls-order-detail__section">
              <h2>결제 정보</h2>
              <dl className="ls-order-detail__dl">
                <div>
                  <dt>결제금액</dt>
                  <dd>{formatPrice(order.amount)}</dd>
                </div>
                <div>
                  <dt>결제수단</dt>
                  <dd>{order.payment_method ?? "—"}</dd>
                </div>
                <div>
                  <dt>결제일시</dt>
                  <dd>{new Date(order.approved_at).toLocaleString("ko-KR")}</dd>
                </div>
              </dl>
            </section>
          </>
        ) : null}
      </div>
      <Footer />
    </main>
  );
}
