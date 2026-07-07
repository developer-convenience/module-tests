import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import CartStrip from "../components/CartStrip";

type CartFeedbackContextValue = {
  announceAdded: () => void;
  onViewCart: () => void;
};

const CartFeedbackContext = createContext<CartFeedbackContextValue | null>(null);

type CartFeedbackProviderProps = {
  children: ReactNode;
  onViewCart: () => void;
};

export function CartFeedbackProvider({ children, onViewCart }: CartFeedbackProviderProps) {
  const [liveMessage, setLiveMessage] = useState("");
  const [stripVisible, setStripVisible] = useState(false);

  const dismissStrip = useCallback(() => {
    setStripVisible(false);
  }, []);

  const announceAdded = useCallback(() => {
    setLiveMessage("Added to bag");
    setStripVisible(true);
    window.setTimeout(() => setLiveMessage(""), 1500);
  }, []);

  const value = useMemo(
    () => ({ announceAdded, onViewCart }),
    [announceAdded, onViewCart],
  );

  return (
    <CartFeedbackContext.Provider value={value}>
      {children}
      <CartStrip visible={stripVisible} onViewCart={onViewCart} onDismiss={dismissStrip} />
      <div className="ls-sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
    </CartFeedbackContext.Provider>
  );
}

export function useCartFeedback(): CartFeedbackContextValue {
  const ctx = useContext(CartFeedbackContext);
  if (!ctx) {
    throw new Error("useCartFeedback must be used within CartFeedbackProvider");
  }
  return ctx;
}
