import { useNavigate } from "../context/NavContext";
import type { Page } from "../routes";
import "./Footer.css";

const FOOTER_COLUMNS: {
  heading: string;
  items: { label: string; page: Page }[];
}[] = [
  {
    heading: "Categories",
    items: [
      { label: "Shop", page: "shop" },
      { label: "Custom Order", page: "custom" },
    ],
  },
  {
    heading: "Services",
    items: [{ label: "Personalisation", page: "custom" }],
  },
  {
    heading: "La Maison",
    items: [{ label: "Our Atelier", page: "atelier" }],
  },
];

export default function Footer() {
  const onNavigate = useNavigate();

  return (
    <footer className="ls-footer">
      <div className="ls-footer__inner ls-container">
        <div className="ls-footer__columns">
          {FOOTER_COLUMNS.map(({ heading, items }) => (
            <div key={heading} className="ls-footer__col">
              <h4>{heading}</h4>
              <ul>
                {items.map(({ label, page }) => (
                  <li key={label}>
                    <button type="button" onClick={() => onNavigate(page)}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="ls-footer__copy">
          © 2026 Atelier. Handmade leather goods.
        </p>
      </div>
    </footer>
  );
}
