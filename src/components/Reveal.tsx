import {
  createElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { observeReveal, unobserveReveal } from "../utils/revealObserver";
import "./Reveal.css";

type RevealVariant = "up" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
  as?: ElementType;
};

export default function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    observeReveal(element);
    return () => unobserveReveal(element);
  }, []);

  return createElement(
    Tag,
    {
      ref,
      className: ["ls-reveal", `ls-reveal--${variant}`, className].filter(Boolean).join(" "),
      style: { "--ls-reveal-delay": `${delay}s` } as CSSProperties,
    },
    children,
  );
}
