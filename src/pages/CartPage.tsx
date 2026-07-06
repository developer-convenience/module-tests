import { formatPrice, getProduct } from "../assets";
import {
  type CartLine,
  getCartSubtotal,
  getCartTotal,
  getLineLabel,
  getLineTotal,
  SHIPPING_FEE,
} from "../cart";
import ImageSlot from "../components/ImageSlot";
import PageShell from "../components/PageShell";
import "./CartPage.css";

type CartPageProps = {
  cart: CartLine[];
  onBack: () => void;
  onCheckout: () => void;
  onUpdateQuantity: (lineId: string, delta: number) => void;
  onRemove: (lineId: string) => void;
};

export default function CartPage({
  cart,
  onBack,
  onCheckout,
  onUpdateQuantity,
  onRemove,
}: CartPageProps) {
  const subtotal = getCartSubtotal(cart);
  const total = getCartTotal(cart);
  const isEmpty = cart.length === 0;

  return (
    <PageShell className="ls-cart-page">
      <div className="ls-container ls-cart">
        <button type="button" className="ls-link ls-page__back" onClick={onBack}>
          ← Continue shopping
        </button>

        <header className="ls-cart__header">
          <p className="ls-eyebrow">Your bag</p>
          <h1 className="ls-page__title">Cart</h1>
        </header>

        {isEmpty ? (
          <div className="ls-cart__empty">
            <p>담긴 상품이 없습니다.</p>
            <button type="button" className="ls-btn ls-btn--filled" onClick={onBack}>
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          <div className="ls-cart__layout">
            <ul className="ls-cart__list">
              {cart.map((line) => {
                const product = getProduct(line.productId);
                const { title, subtitle } = getLineLabel(line);
                return (
                  <li key={line.lineId} className="ls-cart__item">
                    {product && (
                      <div className="ls-cart__thumb">
                        <ImageSlot
                          src={product.image}
                          alt={product.nameKo}
                          aspectRatio="3 / 4"
                          label={product.image.split("/").pop() ?? ""}
                        />
                      </div>
                    )}
                    <div className="ls-cart__info">
                      <p className="ls-cart__name">{title}</p>
                      {product && (
                        <p className="ls-cart__name-ko" lang="ko">
                          {product.nameKo}
                        </p>
                      )}
                      {subtitle && <p className="ls-cart__options">{subtitle}</p>}
                      <p className="ls-cart__line-price">{formatPrice(getLineTotal(line))}</p>

                      <div className="ls-cart__actions">
                        {line.kind === "standard" && (
                          <div className="ls-cart__qty" aria-label="수량">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(line.lineId, -1)}
                              aria-label="수량 감소"
                            >
                              −
                            </button>
                            <span>{line.quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(line.lineId, 1)}
                              aria-label="수량 증가"
                            >
                              +
                            </button>
                          </div>
                        )}
                        {line.kind === "custom" && (
                          <span className="ls-cart__qty-fixed">Qty: {line.quantity}</span>
                        )}
                        <button
                          type="button"
                          className="ls-cart__remove"
                          onClick={() => onRemove(line.lineId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <aside className="ls-cart__summary">
              <h2 className="ls-cart__summary-title">Order summary</h2>
              <dl className="ls-cart__summary-lines">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div>
                  <dt>Shipping</dt>
                  <dd>{formatPrice(SHIPPING_FEE)}</dd>
                </div>
                <div className="ls-cart__summary-total">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>
              <button type="button" className="ls-btn ls-btn--filled ls-cart__checkout" onClick={onCheckout}>
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </PageShell>
  );
}
