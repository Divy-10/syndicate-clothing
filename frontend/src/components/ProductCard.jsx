import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { Heart } from 'lucide-react';
import './ProductCard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

export default function ProductCard({ product, size = 'normal' }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const productId = product._id || product.id;
  const liked = isInWishlist(productId);

  let displayImage = product.images?.[0] || product.image;

  if (displayImage && displayImage.startsWith('/uploads/')) {
    displayImage = `${BASE_URL}${displayImage}`;
  }

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link
      to={`/product/${productId}`}
      className={`product-card product-card--${size}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="product-card__image-container product-image-container">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
          />
        ) : (
          <div className="product-card__placeholder">
            <span>{product.name?.charAt(0) || 'S'}</span>
          </div>
        )}

        {/* HOVER OVERLAY (QUICK VIEW / VIEW DETAILS) */}
        <div className="product-card__hover-overlay">
          <span className="btn-luxury product-card__quick-view">VIEW DETAILS</span>
        </div>

        {/* LUXURY WISHLIST BUTTON */}
        <button 
          className={`product-card__wishlist-btn ${liked ? 'product-card__wishlist-btn--active' : ''}`}
          onClick={handleWishlistClick}
          aria-label="Toggle Wishlist"
        >
          <Heart 
            size={14} 
            className="wishlist-icon"
            fill={liked ? '#E1DCC9' : 'none'} 
            stroke={liked ? '#E1DCC9' : '#B8B1A1'} 
          />
        </button>

        {product.stock !== undefined && product.stock <= 3 && product.stock > 0 && (
          <div className="product-card__badge">
            Only {product.stock} left
          </div>
        )}
      </div>

      <div className={`product-card__info ${hovered ? 'product-card__info--visible' : ''}`}>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">
          {product.price !== undefined ? `₹${product.price.toLocaleString()}` : ''}
        </p>
      </div>
    </Link>
  );
}
