import CheckoutForm from "../components/CheckoutForm";
import Footer from "../components/Footer";
import type { CartLine } from "../cart";
import { getCartCount } from "../cart";
import { useEffect } from "react";
import "./CheckoutPage.css";

type CheckoutPageProps = {
  cart: CartLine[];
  onBack: () => void;
  onEmptyCart: () => void;
};

export default function CheckoutPage({ cart, onBack, onEmptyCart }: CheckoutPageProps) {
  useEffect(() => {
    if (getCartCount(cart) === 0) {
      onEmptyCart();
    }
  }, [cart, onEmptyCart]);

  if (getCartCount(cart) === 0) {
    return null;
  }

  return (
    <main className="ls-checkout-page">
      <div className="ls-container">
        <button type="button" className="ls-link ls-checkout-page__back" onClick={onBack}>
          ← Back to cart
        </button>
        <h1 className="ls-checkout-page__title">Checkout</h1>
        <CheckoutForm cart={cart} />
      </div>
      <Footer />
    </main>
  );
}
