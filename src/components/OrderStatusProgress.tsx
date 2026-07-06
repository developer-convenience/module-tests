import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS, type OrderStatus } from "../types/order";
import "./OrderStatusProgress.css";

type OrderStatusProgressProps = {
  status: OrderStatus;
};

export default function OrderStatusProgress({ status }: OrderStatusProgressProps) {
  const currentIndex = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <div className="ls-order-status">
      <ol className="ls-order-status__steps">
        {ORDER_STATUS_STEPS.map((step, index) => {
          const done = index <= currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={step}
              className={`ls-order-status__step ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}
            >
              <span className="ls-order-status__dot" aria-hidden="true" />
              <span className="ls-order-status__label">{ORDER_STATUS_LABELS[step]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`ls-order-status__badge ls-order-status__badge--${status}`}>{ORDER_STATUS_LABELS[status]}</span>;
}
