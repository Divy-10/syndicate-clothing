import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PaymentPage.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart, appliedCoupon } = useContext(CartContext);
  const { user } = useAuth();
  
  // Get address from navigation state
  const address = location.state?.address;

  // ✅ Fix: Move navigation logic into useEffect
  useEffect(() => {
    if (!address || cart.length === 0) {
      console.log("Missing address or empty cart, redirecting...");
      navigate('/cart');
    }
  }, [address, cart.length, navigate]);

  if (!address || cart.length === 0) return null;

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let shipping = 0;
  if (cart.length > 0) {
    shipping = subtotal >= 5000 ? 0 : 500;
  }

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round(subtotal * (appliedCoupon.discount / 100));
    } else {
      discountAmount = appliedCoupon.discount;
    }
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }
  }

  const grandTotal = Math.max(0, subtotal - discountAmount) + shipping;

  const handleCOD = async () => {
    try {
      const userId = user?.id || user?._id;

      if (!userId) {
        alert("Session expired or user ID missing. Please login again.");
        return;
      }

      const orderData = {
        userId: userId,
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          size: item.size
        })),
        totalAmount: grandTotal,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        discountAmount: discountAmount,
        shippingAddress: address
      };

      console.log("Order Request Received:", orderData); // DEBUG LOG

      const res = await axios.post(`${API_URL}/orders/place`, orderData);
      
      if (res.data.success) {
        alert("Order Placed Successfully! You can pay upon delivery.");
        clearCart();
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      alert("Order failed. Please try again.");
    }
  };

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-container">
        <div className="payment-card animate-fade-in">
          <h2 className="payment-title">SELECT PAYMENT METHOD</h2>
          
          <div className="payment-options">
            {/* Razorpay - Disabled */}
            <div className="payment-method disabled">
              <span className="method-icon">💳</span>
              <div className="method-text">
                <strong>Online Payment (Razorpay)</strong>
                <p>COMING SOON — ENCRYPTED GATEWAY</p>
              </div>
            </div>

            {/* COD - Active */}
            <div className="payment-method active" onClick={handleCOD}>
              <span className="method-icon">🚚</span>
              <div className="method-text">
                <strong>Cash on Delivery (COD)</strong>
                <p>PAY IN CASH UPON ARRIVAL</p>
              </div>
            </div>
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Items Total</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div className="summary-row" style={{ color: '#2ed573' }}>
                <span>Discount ({appliedCoupon.code})</span>
                <span>- ₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={handleCOD} className="btn-confirm-payment">
            CONFIRM ORDER
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
