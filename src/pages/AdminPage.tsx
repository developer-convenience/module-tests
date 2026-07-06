import { useEffect, useState } from "react";

import { formatPrice } from "../assets";
import Footer from "../components/Footer";
import { OrderStatusBadge } from "../components/OrderStatusProgress";
import {
  adminFetch,
  clearAdminPassword,
  loadAdminPassword,
  saveAdminPassword,
} from "../lib/api";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STEPS,
  type OrderStatus,
  type StoredOrder,
} from "../types/order";
import "./AdminPage.css";

type AdminPageProps = {
  onBack: () => void;
};

export default function AdminPage({ onBack }: AdminPageProps) {
  const [password, setPassword] = useState(() => loadAdminPassword() ?? "");
  const [authenticated, setAuthenticated] = useState(() => Boolean(loadAdminPassword()));
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadOrders(adminPassword: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<{ orders: StoredOrder[] }>("/api/admin/orders", adminPassword);
      setOrders(data.orders);
      setAuthenticated(true);
      saveAdminPassword(adminPassword);
    } catch (err) {
      setAuthenticated(false);
      clearAdminPassword();
      setError(err instanceof Error ? err.message : "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = loadAdminPassword();
    if (saved) {
      loadOrders(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    await loadOrders(password.trim());
  }

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    const adminPassword = loadAdminPassword();
    if (!adminPassword) return;

    setUpdatingId(orderId);
    try {
      const data = await adminFetch<{ order: StoredOrder }>(
        `/api/admin/orders/${encodeURIComponent(orderId)}/status`,
        adminPassword,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      setOrders((prev) =>
        prev.map((order) => (order.order_id === orderId ? data.order : order)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
    } finally {
      setUpdatingId(null);
    }
  }

  function handleLogout() {
    clearAdminPassword();
    setAuthenticated(false);
    setOrders([]);
    setPassword("");
  }

  return (
    <main className="ls-admin">
      <div className="ls-container ls-admin__inner">
        <button type="button" className="ls-link ls-admin__back" onClick={onBack}>
          ← 돌아가기
        </button>

        <p className="ls-eyebrow">Admin</p>
        <h1 className="ls-admin__title">주문 관리</h1>

        {!authenticated ? (
          <form className="ls-admin__login" onSubmit={handleLogin}>
            <label>
              관리자 비밀번호
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error ? <p className="ls-admin__error">{error}</p> : null}
            <button type="submit" className="ls-btn ls-btn--filled" disabled={loading}>
              {loading ? "확인 중…" : "로그인"}
            </button>
          </form>
        ) : (
          <>
            <div className="ls-admin__toolbar">
              <p className="ls-admin__count">총 {orders.length}건</p>
              <button type="button" className="ls-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </div>

            <div className="ls-admin__table-wrap">
              <table className="ls-admin__table">
                <thead>
                  <tr>
                    <th>주문일</th>
                    <th>주문명</th>
                    <th>받는 분</th>
                    <th>금액</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{new Date(order.approved_at).toLocaleDateString("ko-KR")}</td>
                      <td>
                        <span className="ls-admin__order-name">{order.order_name}</span>
                        <span className="ls-admin__order-id">{order.order_id}</span>
                      </td>
                      <td>{order.shipping.name}</td>
                      <td>{formatPrice(order.amount)}</td>
                      <td>
                        <div className="ls-admin__status-cell">
                          <OrderStatusBadge status={order.status} />
                          <select
                            value={order.status}
                            disabled={updatingId === order.order_id}
                            onChange={(e) =>
                              handleStatusChange(order.order_id, e.target.value as OrderStatus)
                            }
                            aria-label={`${order.order_name} 상태 변경`}
                          >
                            {ORDER_STATUS_STEPS.map((step) => (
                              <option key={step} value={step}>
                                {ORDER_STATUS_LABELS[step]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
