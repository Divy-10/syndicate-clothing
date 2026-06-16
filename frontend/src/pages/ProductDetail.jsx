import { useContext, useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import { io } from 'socket.io-client';
import { CartContext } from '../context/CartContext';
import SizeGuideTable from '../components/SizeGuideTable';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './ProductDetail.css';
import { useWishlist } from '../context/WishlistContext';
import { Heart } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Demo product for when backend is not available
const demoProduct = {
  id: 'demo',
  name: 'Noir Oversized Tee',
  price: 2999,
  description: 'A premium oversized tee crafted from 300GSM heavyweight cotton. Features a relaxed drop-shoulder silhouette with a clean, minimalist finish. Designed for those who appreciate understated luxury.',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Gray', hex: '#888888' },
  ],
  images: [],
  stock: 12,
  category: 'Essentials',
};

export default function ProductDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart } = useContext(CartContext);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }

    let sizeStock = 0;
    const currentStock = product.stock;
    if (currentStock) {
      if (typeof currentStock.get === 'function') {
        sizeStock = currentStock.get(selectedSize) || 0;
      } else {
        sizeStock = currentStock[selectedSize] || 0;
      }
    }

    if (sizeStock <= 0) {
      alert("Size " + selectedSize + " is sold out!");
      return;
    }

    addToCart(product, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch {
        setProduct(demoProduct);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    // Fetch all products for recommendations (style-with)
    const fetchSuggested = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`);
        const list = res.data || [];
        // Exclude the current product
        const filtered = list.filter(p => p._id !== id);
        setSuggestedProducts(filtered);
      } catch (err) {
        console.error("Error fetching suggested products:", err);
      }
    };
    fetchSuggested();

    const fetchActiveCoupons = async () => {
      try {
        const res = await axios.get(`${API_URL}/coupons/active`);
        setActiveCoupons(res.data || []);
      } catch (err) {
        console.error("Error fetching active coupons:", err);
      }
    };
    fetchActiveCoupons();

    // Listen for real-time stock updates
    const socket = io(API_URL.replace('/api', ''));
    socket.on('stockUpdate', (updatedData) => {
      if (updatedData.productId === id) {
        setProduct((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            stock: updatedData.stock
          };
        });
      }
    });

    return () => socket.disconnect();
  }, [id]);



  if (loading) {
    return (
      <>
        <Navbar />
        <div className="product-detail__loading">
          <div className="product-detail__loading-spinner"></div>
        </div>
      </>
    );
  }

  if (!product) return null;

  const totalStock = product.stock
    ? (product.stock instanceof Map
       ? Array.from(product.stock.values()).reduce((a, b) => a + b, 0)
       : (typeof product.stock === 'object'
          ? Object.values(product.stock).reduce((a, b) => a + b, 0)
          : Number(product.stock) || 0))
    : 0;

  const sizeStock = (() => {
    if (!selectedSize) return 0;
    const currentStock = product.stock;
    if (currentStock) {
      if (typeof currentStock.get === 'function') {
        return currentStock.get(selectedSize) || 0;
      }
      return currentStock[selectedSize] || 0;
    }
    return 0;
  })();

  return (
    <div className="page-product-detail">
      <Navbar />

      <main className="product-detail container">
        {/* Breadcrumb */}
        <div className="product-detail__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail__layout">
          {/* Left: Horizontal scroll of product images */}
          <div className="product-detail__gallery-slider">
            {product.images?.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="main-product-gallery-swiper"
              >
                {product.images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <div className="product-detail__gallery-image product-image-container">
                      <img
                        src={img.startsWith('/') ? `${API_URL.replace('/api', '')}${img}` : img}
                        alt={`${product.name} view ${i + 1}`}
                        loading="lazy"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="product-detail__gallery-image product-image-container">
                <div className="product-detail__image-placeholder">
                  <span>{product.name?.charAt(0) || 'S'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="product-detail__info">
            <div className="product-detail__info-sticky">
              {product.category && (
                <p className="product-detail__category">{product.category}</p>
              )}
              <h1 className="product-detail__name">{product.name}</h1>
              <p className="product-detail__price">₹{product.price?.toLocaleString()}</p>

              <p className="product-detail__description">{product.description}</p>

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div className="product-detail__option-group">
                  <div className="product-detail__option-header">
                    <label className="product-detail__label">Size</label>
                    <button 
                      type="button" 
                      className="product-detail__size-guide-link"
                      onClick={() => setShowSizeGuide(true)}
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="product-detail__sizes">
                    {product.sizes.map((size) => {
                      let sizeStockVal = 0;
                      const currentStock = product.stock;
                      if (currentStock) {
                        if (typeof currentStock.get === 'function') {
                          sizeStockVal = currentStock.get(size) || 0;
                        } else {
                          sizeStockVal = currentStock[size] || 0;
                        }
                      }
                      const isOutOfStock = sizeStockVal <= 0;
                      return (
                        <button
                          key={size}
                          className={`product-detail__size-btn ${selectedSize === size ? 'product-detail__size-btn--active' : ''} ${isOutOfStock ? 'product-detail__size-btn--disabled' : ''}`}
                          onClick={() => setSelectedSize(size)}
                          disabled={isOutOfStock}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors?.length > 0 && (
                <div className="product-detail__option-group">
                  <label className="product-detail__label">
                    Color {selectedColor && `— ${selectedColor}`}
                  </label>
                  <div className="product-detail__colors">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        className={`product-detail__color-swatch ${selectedColor === color.name ? 'product-detail__color-swatch--active' : ''}`}
                        style={{ background: color.hex }}
                        onClick={() => setSelectedColor(color.name)}
                        title={color.name}
                      ></button>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Coupons */}
              {activeCoupons.length > 0 && (
                <div className="product-detail__option-group">
                  <label className="product-detail__label">Available Offers</label>
                  <div className="product-detail__coupons-list">
                    {activeCoupons.map((coupon) => (
                      <div key={coupon._id} className="product-detail__coupon-item">
                        <div className="coupon-badge-wrapper">
                          <span className="coupon-code-badge">{coupon.code}</span>
                          <button 
                            type="button"
                            className="coupon-copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              alert(`Code ${coupon.code} copied!`);
                            }}
                          >
                            Copy
                          </button>
                        </div>
                        <p className="coupon-desc">
                          Get {coupon.discountType === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount.toLocaleString()}`} off
                          {coupon.minOrderAmount > 0 && ` on orders above ₹${coupon.minOrderAmount.toLocaleString()}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="product-detail__availability">
                {selectedSize ? (
                  sizeStock > 0 && sizeStock <= 5 ? (
                    <span className="product-detail__low-stock">
                      Only {sizeStock} pieces remaining in size {selectedSize}
                    </span>
                  ) : sizeStock > 0 ? (
                    <span className="product-detail__in-stock">Size {selectedSize} is Available</span>
                  ) : (
                    <span className="product-detail__out-of-stock">Size {selectedSize} is Sold Out</span>
                  )
                ) : (
                  totalStock > 0 ? (
                    <span className="product-detail__in-stock">Please select a size to view availability</span>
                  ) : (
                    <span className="product-detail__out-of-stock">Sold Out</span>
                  )
                )}
              </div>

              {/* Add to Cart & Wishlist */}
              <div className="product-detail__action-buttons" style={{ marginBottom: '24px' }}>
                <button
                  className={`btn-luxury-filled product-detail__add-to-cart ${addedToCart ? 'product-detail__add-to-cart--added' : ''}`}
                  disabled={totalStock === 0 || addedToCart || (selectedSize && sizeStock <= 0)}
                  onClick={handleAddToCart}
                  style={{ marginBottom: 0 }}
                >
                  {totalStock === 0 ? 'Sold Out' : addedToCart ? 'Added!' : (selectedSize && sizeStock <= 0) ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  className={`product-detail__wishlist-btn ${isInWishlist(product._id || product.id) ? 'product-detail__wishlist-btn--active' : ''}`}
                  onClick={() => toggleWishlist(product)}
                  title={isInWishlist(product._id || product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart size={20} fill={isInWishlist(product._id || product.id) ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Details accordion */}
              <div className="product-detail__details">
                <div className="product-detail__detail-item">
                  <span>Free shipping on orders above ₹5,000</span>
                </div>
                <div className="product-detail__detail-item">
                  <span>Easy 14-day returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Style With Section */}
        {suggestedProducts.length > 0 && (
          <section className="product-detail__style-with section-spacing">
            <h2 className="product-detail__style-with-title">Style With</h2>
            
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={12}
              slidesPerView={2.2}
              navigation={window.innerWidth > 768}
              pagination={{ clickable: true }}
              breakpoints={{
                480: { slidesPerView: 2.5, spaceBetween: 15 },
                768: { slidesPerView: 3.5, spaceBetween: 20 },
                1024: { slidesPerView: 5, spaceBetween: 20 },
                1400: { slidesPerView: 6, spaceBetween: 24 }
              }}
              className="product-slider"
            >
              {suggestedProducts.map(item => (
                <SwiperSlide key={item._id}>
                  <Link to={`/product/${item._id}`} className="suggested-card">
                    <div className="image-wrapper">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0].startsWith('/') ? `${API_URL.replace('/api', '')}${item.images[0]}` : item.images[0]} 
                          alt={item.name} 
                        />
                      ) : (
                        <div className="product-detail__image-placeholder" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span>{item.name?.charAt(0) || 'S'}</span>
                        </div>
                      )}
                    </div>
                    <div className="suggested-info">
                      <p className="s-name">{item.name}</p>
                      <p className="s-price">₹{item.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
      </main>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="size-guide-modal-backdrop" onClick={() => setShowSizeGuide(false)}>
          <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <button className="size-guide-modal-close" onClick={() => setShowSizeGuide(false)}>×</button>
            <h3 className="size-guide-modal-title">MEN'S SIZE CHART</h3>
            <SizeGuideTable />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
