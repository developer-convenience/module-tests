import { useEffect } from "react";
import { createPortal } from "react-dom";

type CartStripProps = {
  visible: boolean;
  onViewCart: () => void;
  onDismiss: () => void;
};

const AUTO_DISMISS_MS = 3500;

export default function CartStrip({ visible, onViewCart, onDismiss }: CartStripProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible || typeof document === "undefined") return null;

  function handleViewCart() {
    onDismiss();
    onViewCart();
  }

  return createPortal(
    <div className="ls-strip" role="status">
      <div className="ls-strip__inner">
        <p className="ls-eyebrow">Added to bag</p>
        <span className="ls-strip__sep" aria-hidden="true">
          ·
        </span>
        <button type="button" className="ls-link" onClick={handleViewCart}>
          View cart
        </button>
      </div>
    </div>,
    document.body,
  );
}
