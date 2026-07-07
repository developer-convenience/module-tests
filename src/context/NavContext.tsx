import { createContext, useContext, type ReactNode } from "react";

import type { Page } from "../routes";

type NavContextValue = (page: Page) => void;

const NavContext = createContext<NavContextValue | null>(null);

export function NavProvider({
  onNavigate,
  children,
}: {
  onNavigate: NavContextValue;
  children: ReactNode;
}) {
  return <NavContext.Provider value={onNavigate}>{children}</NavContext.Provider>;
}

export function useNavigate() {
  const navigate = useContext(NavContext);
  if (!navigate) {
    throw new Error("useNavigate must be used within NavProvider");
  }
  return navigate;
}
