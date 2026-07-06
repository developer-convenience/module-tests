import { useEffect, useState } from "react";

import { formatPrice, getProduct } from "../assets";
import Footer from "../components/Footer";
import { OrderStatusBadge } from "../components/OrderStatusProgress";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import {
  fetchUserProfile,
  resolveAvatarUrl,
  resolveDisplayName,
  type UserProfile,
} from "../lib/profile";
import type { StoredOrder } from "../types/order";
import "./MyPage.css";

type MyPageProps = {
  onLogin: () => void;
  onOrderSelect: (orderId: string) => void;
  onBack: () => void;
};

function getOrderItemSummary(order: StoredOrder) {
  const items = order.items ?? [];
  const totalQty = items.reduce((sum, line) => sum + line.quantity, 0);
  const firstProduct = items[0] ? getProduct(items[0].productId) : null;
  const extraCount = totalQty > 1 ? totalQty - 1 : 0;

  return {
    thumbnail: firstProduct?.image ?? null,
    label:
      extraCount > 0
        ? `${order.order_name} 외 ${extraCount}건`
        : order.order_name,
    totalQty,
  };
}

export default function MyPage({ onLogin, onOrderSelect, onBack }: MyPageProps) {
  const { user, session, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
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

    Promise.all([
      fetchUserProfile(user.id),
      apiFetch<{ orders: StoredOrder[] }>("/api/orders/me", {
        token: session?.access_token,
      }),
    ])
      .then(([nextProfile, data]) => {
        if (cancelled) return;
        setProfile(nextProfile);
        setOrders(data.orders);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "주문 목록을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loading, user, session, onLogin]);

  const displayName = resolveDisplayName(profile, user);
  const avatarUrl = resolveAvatarUrl(profile, user);

  return (
    <main className="ls-mypage">
      <div className="ls-container ls-mypage__inner">
        <button type="button" className="ls-link ls-mypage__back" onClick={onBack}>
          ← 돌아가기
        </button>

        <header className="ls-mypage__page-head">
          <p className="ls-eyebrow">My Page</p>
          <h1 className="ls-mypage__page-title">마이페이지</h1>
        </header>

        <section className="ls-mypage__profile" aria-label="회원 정보">
          <div className="ls-mypage__profile-main">
            <div className="ls-mypage__avatar" aria-hidden={!avatarUrl}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" />
              ) : (
                <span>{displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="ls-mypage__profile-text">
              <p className="ls-mypage__greeting">
                안녕하세요, <strong>{displayName}</strong>님
              </p>
              {user?.email ? <p className="ls-mypage__email">{user.email}</p> : null}
            </div>
          </div>
          <button type="button" className="ls-btn ls-mypage__logout" onClick={() => signOut()}>
            로그아웃
          </button>
        </section>

        <section className="ls-mypage__section">
          <div className="ls-mypage__section-head">
            <h2>주문 내역</h2>
            {!fetching && !error ? (
              <span className="ls-mypage__count">총 {orders.length}건</span>
            ) : null}
          </div>

          {fetching ? <p className="ls-mypage__empty">불러오는 중…</p> : null}

          {error ? (
            <div className="ls-mypage__error-box" role="alert">
              <p className="ls-mypage__error">{error}</p>
            </div>
          ) : null}

          {!fetching && !error && orders.length === 0 ? (
            <div className="ls-mypage__empty-box">
              <p className="ls-mypage__empty">아직 주문 내역이 없습니다.</p>
              <button type="button" className="ls-btn ls-btn--filled" onClick={onBack}>
                쇼핑하러 가기
              </button>
            </div>
          ) : null}

          <ul className="ls-mypage__list">
            {orders.map((order) => {
              const summary = getOrderItemSummary(order);
              return (
                <li key={order.id}>
                  <button
                    type="button"
                    className="ls-mypage__card"
                    onClick={() => onOrderSelect(order.order_id)}
                  >
                    <div className="ls-mypage__card-top">
                      <span className="ls-mypage__date">
                        {new Date(order.approved_at).toLocaleDateString("ko-KR")}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="ls-mypage__card-body">
                      <div className="ls-mypage__thumb">
                        {summary.thumbnail ? (
                          <img src={summary.thumbnail} alt="" />
                        ) : (
                          <span className="ls-mypage__thumb-fallback" aria-hidden="true" />
                        )}
                      </div>
                      <div className="ls-mypage__card-info">
                        <p className="ls-mypage__name">{summary.label}</p>
                        <p className="ls-mypage__order-id">주문번호 {order.order_id}</p>
                        <p className="ls-mypage__amount">{formatPrice(order.amount)}</p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <Footer />
    </main>
  );
}
