import { useEffect, useRef, useState, type ReactNode } from "react";

import { useCartFeedback } from "../context/CartFeedbackContext";
import "./AddToCartButton.css";

type ButtonState = "idle" | "adding" | "added" | "error";

type AddToCartButtonProps = {
  onAdd: () => void | Promise<void>;
  className?: string;
  filled?: boolean;
  label?: string;
};

const ADDED_DISPLAY_MS = 1500;
const ERROR_DISPLAY_MS = 2000;
const MIN_ADDING_MS = 200;

function Spinner() {
  return (
    <svg className="ls-add-to-cart__spinner" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="ls-add-to-cart__check" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AddToCartButton({
  onAdd,
  className = "",
  filled = true,
  label = "Add to Cart",
}: AddToCartButtonProps) {
  const { announceAdded } = useCartFeedback();
  const [state, setState] = useState<ButtonState>("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  function scheduleReset(next: ButtonState, delay: number) {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
    }
    resetTimer.current = window.setTimeout(() => {
      setState(next);
      resetTimer.current = null;
    }, delay);
  }

  async function handleClick() {
    if (state !== "idle") return;

    setState("adding");
    const started = Date.now();

    try {
      await Promise.resolve(onAdd());
      const elapsed = Date.now() - started;
      if (elapsed < MIN_ADDING_MS) {
        await new Promise((resolve) => window.setTimeout(resolve, MIN_ADDING_MS - elapsed));
      }
      announceAdded();
      setState("added");
      scheduleReset("idle", ADDED_DISPLAY_MS);
    } catch {
      setState("error");
      scheduleReset("idle", ERROR_DISPLAY_MS);
    }
  }

  const isBusy = state === "adding" || state === "added";

  let content: ReactNode;
  let ariaLabel: string;

  switch (state) {
    case "adding":
      content = (
        <>
          <Spinner />
          Adding…
        </>
      );
      ariaLabel = "Adding to cart";
      break;
    case "added":
      content = (
        <>
          <CheckIcon />
          Added
        </>
      );
      ariaLabel = "Added to cart";
      break;
    case "error":
      content = "Try Again";
      ariaLabel = "Try again";
      break;
    default:
      content = label;
      ariaLabel = label;
  }

  const btnClass = [
    "ls-btn",
    filled ? "ls-btn--filled" : "",
    "ls-add-to-cart",
    state === "added" ? "ls-add-to-cart--added" : "",
    state === "error" ? "ls-add-to-cart--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={btnClass}
      onClick={handleClick}
      disabled={isBusy}
      aria-label={ariaLabel}
      aria-busy={state === "adding"}
    >
      {content}
    </button>
  );
}
