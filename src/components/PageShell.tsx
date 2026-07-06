import { ReactNode } from "react";
import Footer from "./Footer";
import "./PageShell.css";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main className={`ls-page ${className}`}>
      <div className="ls-page__body">{children}</div>
      <Footer />
    </main>
  );
}
