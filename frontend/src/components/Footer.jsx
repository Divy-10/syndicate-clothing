import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      {/* Branding strip */}
      <div className="footer__branding">
        <div className="footer__branding-track">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="footer__branding-text">SYNDYCATE</span>
          ))}
        </div>
      </div>

      <div className="footer__content container">
        <div className="footer__grid">
          <div className="footer__col">
            <h4 className="footer__heading">Shop</h4>
            <ul className="footer__list">
              <li><Link to="/products">New Arrivals</Link></li>
              <li><Link to="/products">Essentials</Link></li>
              <li><Link to="/products">Outerwear</Link></li>
              <li><Link to="/products">Accessories</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Info</h4>
            <ul className="footer__list">
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/shipping-returns">Shipping & Returns</Link></li>
              <li><Link to="/size-guide">Size Guide</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Follow</h4>
            <ul className="footer__list">
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Pinterest</a></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Newsletter</h4>
            <p className="footer__newsletter-text">
              Be the first to know about new drops and exclusive offers.
            </p>
            <div className="footer__newsletter">
              <input
                type="email"
                placeholder="Your email"
                className="footer__newsletter-input"
              />
              <button className="footer__newsletter-btn">→</button>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2026 SYNDYCATE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
