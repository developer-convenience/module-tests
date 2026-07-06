import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { images } from "../assets";
import { useAuth } from "../context/AuthContext";
import type { Page } from "../routes";
import "./Header.css";

type HeaderProps = {
  onNavigate: (page: Page) => void;
  onLogin: () => void;
  onMyPage: () => void;
  cartCount?: number;
  overlay?: boolean;
};

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: "shop", label: "Shop" },
  { page: "custom", label: "Custom" },
  { page: "atelier", label: "Atelier" },
];

export default function Header({
  onNavigate,
  onLogin,
  onMyPage,
  cartCount = 0,
  overlay = false,
}: HeaderProps) {
  const { user, loading } = useAuth();
  const [logoFailed, setLogoFailed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleNavigate(page: Page) {
    setMenuOpen(false);
    onNavigate(page);
  }

  function handleAccount() {
    setMenuOpen(false);
    if (user) {
      onMyPage();
      return;
    }
    onLogin();
  }

  const accountLabel = loading ? "…" : user ? "My Page" : "Login";

  const mobileMenu =
    typeof document !== "undefined"
      ? createPortal(
          <div
            id="ls-mobile-nav"
            className={`ls-mobile-menu ${menuOpen ? "is-open" : ""}`}
            aria-hidden={!menuOpen}
          >
            <button
              type="button"
              className="ls-mobile-menu__backdrop"
              onClick={() => setMenuOpen(false)}
              aria-label="메뉴 닫기"
              tabIndex={menuOpen ? 0 : -1}
            />
            <nav className="ls-mobile-menu__panel" aria-label="모바일 메뉴">
              {NAV_ITEMS.map(({ page, label }) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handleNavigate(page)}
                  tabIndex={menuOpen ? 0 : -1}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleAccount}
                tabIndex={menuOpen ? 0 : -1}
              >
                {accountLabel}
              </button>
              <button
                type="button"
                className="ls-mobile-menu__cart"
                onClick={() => handleNavigate("cart")}
                tabIndex={menuOpen ? 0 : -1}
              >
                Cart ({cartCount})
              </button>
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header
        className={`ls-header ${overlay ? "ls-header--overlay" : ""} ${menuOpen ? "ls-header--menu-open" : ""}`}
      >
        <div className="ls-header__bar">
          <div className="ls-header__inner">
            <button
              type="button"
              className="ls-header__logo"
              onClick={() => handleNavigate("home")}
              aria-label="홈으로"
            >
              {!logoFailed ? (
                <img
                  src={images.logo}
                  alt="Atelier"
                  className="ls-header__logo-img"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <span className="ls-header__logo-text">Atelier</span>
              )}
            </button>

            <nav className="ls-header__nav" aria-label="주요 메뉴">
              {NAV_ITEMS.map(({ page, label }) => (
                <button key={page} type="button" onClick={() => handleNavigate(page)}>
                  {label}
                </button>
              ))}
            </nav>

            <div className="ls-header__actions">
              <button
                type="button"
                className="ls-header__account"
                onClick={handleAccount}
              >
                {accountLabel}
              </button>
              <button
                type="button"
                className="ls-header__cart"
                onClick={() => handleNavigate("cart")}
                aria-label={`장바구니 ${cartCount}개`}
              >
                Cart ({cartCount})
              </button>

              <button
                type="button"
                className="ls-header__menu-toggle"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="ls-mobile-nav"
                aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              >
                <span className="ls-header__menu-icon" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {mobileMenu}
    </>
  );
}
