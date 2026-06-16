import { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingBag, User as UserIcon, Heart } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { cart } = useContext(CartContext);
  const { wishlist } = useWishlist();

  const cartItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`luxury-navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* LEFT SIDE: Navigation Links */}
      <div className="nav-left">
        <ul className="nav-links">
          <li><Link to="/">HOME</Link></li>
          <li><Link to="/products">COLLECTIONS</Link></li>
          <li><Link to="/about">ABOUT</Link></li>
          <li><Link to="/contact">CONTACT</Link></li>
        </ul>
      </div>

      {/* CENTER: Brand Logo */}
      <div className="nav-logo">
        <Link to="/">EL BRO SYNDICATE</Link>
      </div>

      {/* RIGHT SIDE: User Actions */}
      <div className="nav-right">
        {isAuthenticated ? (
          // Show this if user is LOGGED IN
          <Link to="/profile" className="profile-icon-link" aria-label="View Profile">
            <UserIcon size={18} />
          </Link>
        ) : (
          // Show this if user is LOGGED OUT
          <>
            <Link to="/login" className="login-btn-text">LOGIN</Link>
            <Link to="/login" className="login-btn-icon" aria-label="Login">
              <UserIcon size={18} />
            </Link>
          </>
        )}

        {isAdmin && <Link to="/admin" className="admin-link">ADMIN</Link>}

        <Link to="/profile" state={{ activeTab: 'wishlist' }} className="wishlist-icon-link" aria-label="View Wishlist">
          <Heart size={18} />
          {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
        </Link>

        <Link to="/cart" className="cart-icon" aria-label="View Shopping Bag">
          <ShoppingBag size={18} />
          {cartItemsCount > 0 && <span className="cart-count">{cartItemsCount}</span>}
        </Link>
      </div>

      {/* MOBILE HAMBURGER (Optional for luxury feel) */}
      <button
        className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
      </button>

      {/* MOBILE BACKDROP */}
      <div
        className={`navbar__mobile-backdrop ${menuOpen ? 'navbar__mobile-backdrop--open' : ''}`}
        onClick={() => setMenuOpen(false)}
      ></div>

      {/* MOBILE MENU */}
      <div className={`navbar__mobile-menu ${menuOpen ? 'navbar__mobile-menu--open' : ''}`}>
        <div className="navbar__mobile-menu-header">
          <span className="navbar__mobile-menu-title">SYNDYCATE</span>
        </div>
        <Link to="/" onClick={() => setMenuOpen(false)}>HOME</Link>
        <Link to="/products" onClick={() => setMenuOpen(false)}>COLLECTIONS</Link>
        <Link to="/profile" onClick={() => setMenuOpen(false)}>PROFILE</Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)}>BAG ({cartItemsCount})</Link>
      </div>
    </nav>
  );
}
