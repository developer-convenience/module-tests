import "./Footer.css";

export default function Footer() {
  return (
    <footer className="ls-footer">
      <div className="ls-footer__inner ls-container">
        <div className="ls-footer__columns">
          <div className="ls-footer__col">
            <h4>Categories</h4>
            <ul>
              <li>All Bags</li>
              <li>Wallets</li>
              <li>Custom Order</li>
              <li>Small Leather Goods</li>
            </ul>
          </div>
          <div className="ls-footer__col">
            <h4>Services</h4>
            <ul>
              <li>Personalisation</li>
              <li>Care Instructions</li>
              <li>Client Support</li>
              <li>Boutique Appointment</li>
            </ul>
          </div>
          <div className="ls-footer__col">
            <h4>La Maison</h4>
            <ul>
              <li>Our Atelier</li>
              <li>Craft Stories</li>
              <li>Sustainability</li>
              <li>Contact</li>
            </ul>
          </div>
        </div>
        <p className="ls-footer__copy">
          © 2026 Atelier. Handmade leather goods.
        </p>
      </div>
    </footer>
  );
}
