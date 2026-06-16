import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Cart.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Cart = () => {
  const { cart, removeFromCart, updateQty, appliedCoupon, setAppliedCoupon } = useContext(CartContext);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [activeCoupons, setActiveCoupons] = useState([]);
  
  // Load active coupons from backend
  useEffect(() => {
    const fetchActiveCoupons = async () => {
      try {
        const res = await axios.get(`${API_URL}/coupons/active`);
        setActiveCoupons(res.data || []);
      } catch (err) {
        console.error("Error fetching active coupons:", err);
      }
    };
    fetchActiveCoupons();
  }, []);

  // Calculate Subtotal (Sum of all products)
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);


  // Validate coupon when subtotal changes
  useEffect(() => {
    if (appliedCoupon && subtotal < appliedCoupon.minOrderAmount) {
      setAppliedCoupon(null);
      setCouponError(`Coupon removed: Subtotal fell below the minimum order amount of ₹${appliedCoupon.minOrderAmount.toLocaleString()}`);
      setCouponSuccess('');
    }
  }, [subtotal, appliedCoupon, setAppliedCoupon]);

  // Calculate Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round(subtotal * (appliedCoupon.discount / 100));
    } else {
      discountAmount = appliedCoupon.discount;
    }
    // Cap discount at subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  // Calculate Shipping Logic
  let shipping = 0;
  if (cart.length > 0) {
    // If there are items, check if they qualify for free shipping (above 5000)
    shipping = subtotal >= 5000 ? 0 : 500;
  } else {
    // If the cart is empty, shipping MUST be 0
    shipping = 0;
  }

  // Calculate Final Total
  const total = Math.max(0, subtotal - discountAmount) + shipping;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await axios.post(`${API_URL}/coupons/validate`, {
        code: couponCode.trim(),
        orderAmount: subtotal
      });

      if (res.data.success) {
        setAppliedCoupon({
          code: res.data.code,
          discount: res.data.discount,
          discountType: res.data.discountType,
          minOrderAmount: res.data.minOrderAmount || 0
        });
        setCouponSuccess(res.data.message);
        setCouponCode('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const applyCouponDirectly = async (code) => {
    if (!code) return;
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await axios.post(`${API_URL}/coupons/validate`, {
        code: code.trim(),
        orderAmount: subtotal
      });

      if (res.data.success) {
        setAppliedCoupon({
          code: res.data.code,
          discount: res.data.discount,
          discountType: res.data.discountType,
          minOrderAmount: res.data.minOrderAmount || 0
        });
        setCouponSuccess(res.data.message);
        setCouponCode('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };


  return (
    <div className="page-cart">
      <Navbar />
      
      <main className="cart container section-spacing">
        <h1 className="cart__title">YOUR SHOPPING BAG</h1>
        
        <div className="cart__layout">
          <div className="cart__items-section">
            {cart.length === 0 ? (
              <div className="cart__empty">
                <p>Your bag is empty.</p>
                <Link to="/products" className="btn-luxury-outline">GO SHOPPING</Link>
              </div>
            ) : (
              <div className="cart__items-list">
                {cart.map(item => (
                  <div key={`${item._id}-${item.size}`} className="cart-item-row">
                    <div className="cart-item-row__image">
                      {item.images?.length > 0 ? (
                        <img 
                          src={item.images[0].startsWith('/uploads/') ? `${API_URL.replace('/api', '')}${item.images[0]}` : item.images[0]} 
                          alt={item.name} 
                        />
                      ) : (
                        <div className="cart-item-row__image-placeholder">
                          <span>{item.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="cart-item-row__info">
                      <div className="cart-item-row__header">
                        <h3>{item.name}</h3>
                        <button onClick={() => removeFromCart(item._id, item.size)} className="cart-item-row__remove">
                          REMOVE
                        </button>
                      </div>
                      
                      <p className="cart-item-row__meta">Size: {item.size}</p>
                      
                      <div className="cart-item-row__footer">
                        <div className="cart-item-row__qty">
                          <button onClick={() => updateQty(item._id, item.size, -1)}>-</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item._id, item.size, 1)}>+</button>
                        </div>
                        <p className="cart-item-row__price">₹{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
 
          <div className="cart__summary-section">
            {/* Standalone Coupon Card */}
            {cart.length > 0 && (
              <div className="cart__coupon-card animate-fade-in-up">
                <h3>APPLY COUPON</h3>
                <div className="cart__coupon-form-wrapper">
                  <form onSubmit={handleApplyCoupon} className="cart__coupon-form">
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={appliedCoupon ? appliedCoupon.code : couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="cart__coupon-input"
                    />
                    {appliedCoupon ? (
                      <button 
                        type="button" 
                        className="cart__coupon-btn"
                        onClick={handleRemoveCoupon}
                        style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', borderColor: '#ff4d4d' }}
                      >
                        REMOVE
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        className="cart__coupon-btn"
                        disabled={!couponCode.trim()}
                      >
                        APPLY
                      </button>
                    )}
                  </form>
                  {couponError && <p className="cart__coupon-msg error">{couponError}</p>}
                  {couponSuccess && <p className="cart__coupon-msg success">{couponSuccess}</p>}
                  {appliedCoupon && !couponSuccess && (
                    <p className="cart__coupon-msg success">Coupon {appliedCoupon.code} applied!</p>
                  )}
                  
                  {/* Available Coupons list */}
                  {activeCoupons.length > 0 && (
                    <div className="cart__available-coupons">
                      <div className="cart__available-coupons-title">Available Coupons</div>
                      <div className="cart__available-coupons-list">
                        {activeCoupons.map(coupon => {
                          const isEligible = subtotal >= coupon.minOrderAmount;
                          const isCurrentlyApplied = appliedCoupon?.code === coupon.code;
                          const difference = coupon.minOrderAmount - subtotal;
                          
                          return (
                            <div 
                              key={coupon._id} 
                              className={`cart__available-coupon-item ${isCurrentlyApplied ? 'applied' : ''} ${!isEligible ? 'locked' : ''}`}
                            >
                              <div className="coupon-info">
                                <span className="coupon-code">{coupon.code}</span>
                                <span className="coupon-desc">
                                  Get {coupon.discountType === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount.toLocaleString()}`} off
                                  {coupon.minOrderAmount > 0 && ` on orders above ₹${coupon.minOrderAmount.toLocaleString()}`}
                                  {!isEligible && (
                                    <span className="coupon-lock-msg">
                                      (Add ₹{difference.toLocaleString()} more to unlock)
                                    </span>
                                  )}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="coupon-apply-action-btn"
                                onClick={() => applyCouponDirectly(coupon.code)}
                                disabled={!!appliedCoupon || !isEligible}
                              >
                                {isCurrentlyApplied ? '✓' : 'APPLY'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}


            <div className="cart__summary-card">
              <h3>ORDER SUMMARY</h3>
              <div className="cart__summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {appliedCoupon && (
                <div className="cart__summary-row cart__summary-row--discount">
                  <span className="discount-label">
                    Discount ({appliedCoupon.code})
                    <button type="button" className="remove-coupon-btn" onClick={handleRemoveCoupon}>×</button>
                  </span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="cart__summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="cart__summary-divider"></div>
              <div className="cart__summary-row cart__summary-row--total">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              
              <Link to="/checkout" style={{ textDecoration: 'none' }}>
                <button className="btn-luxury-filled cart__checkout-btn" disabled={cart.length === 0} style={{ width: '100%', marginTop: '15px' }}>
                  PROCEED TO CHECKOUT
                </button>
              </Link>
              
              <div className="cart__shipping-perks">
                <p>✓ Free shipping on orders above ₹5,000</p>
                <p>✓ Easy 14-day returns</p>
              </div>
            </div>
          </div>
        </div>
      </main>
 
      <Footer />
    </div>
  );
};
 
export default Cart;
