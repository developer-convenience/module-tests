import { createElement, useEffect, useRef, type ElementType, type ReactNode } from "react";
import { observeRevealGroup, unobserveReveal } from "../utils/revealObserver";
import "./Reveal.css";

type RevealGroupProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

export default function RevealGroup({
  children,
  className = "",
  as: Tag = "div",
}: RevealGroupProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    observeRevealGroup(element);
    return () => unobserveReveal(element);
  }, []);

  return createElement(
    Tag,
    {
      ref,
      className: ["ls-reveal-group", className].filter(Boolean).join(" "),
    },
    children,
  );
}
