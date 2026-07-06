import { createElement, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useInView } from "../hooks/useInView";
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
  const { ref, inView } = useInView();

  return createElement(
    Tag,
    {
      ref,
      className: [
        "ls-reveal",
        `ls-reveal--${variant}`,
        inView ? "ls-reveal--visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" "),
      style: { "--ls-reveal-delay": `${delay}s` } as CSSProperties,
    },
    children,
  );
}
