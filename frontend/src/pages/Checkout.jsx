import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Checkout.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // 1. Auto-fill saved address on page load
  useEffect(() => {
    if (user && (user.id || user._id)) {
      const userId = user.id || user._id;
      console.log("[Checkout] Logged-in user found:", user);
      setFormData(prev => ({ 
        ...prev, 
        fullName: prev.fullName || user.name || '', 
        email: prev.email || user.email || '' 
      }));
      
      console.log("[Checkout] Fetching saved address for userId:", userId);
      axios.get(`${API_URL}/address/user/${userId}`)
        .then(res => { 
          if (res.data && res.data._id) { 
            console.log("[Checkout] Saved address found:", res.data);
            setFormData(prev => ({
              fullName: res.data.fullName || prev.fullName || user.name || '',
              email: res.data.email || prev.email || user.email || '',
              phone: res.data.phone || prev.phone || '',
              address: res.data.address || prev.address || '',
              city: res.data.city || prev.city || '',
              state: res.data.state || prev.state || '',
              pincode: res.data.pincode || prev.pincode || ''
            }));
          } else {
            console.log("[Checkout] No saved address returned from API.");
          }
        })
        .catch(err => console.log("[Checkout] Error fetching saved address:", err));
    } else {
      console.log("[Checkout] Waiting for user authentication data...");
    }
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If "Save Address" is checked, send to database
      if (saveAddress && user) {
        await axios.post(`${API_URL}/address/save`, { ...formData, userId: user.id || user._id });
      }
      
      // Navigate to Payment Page and pass address data
      setLoading(false);
      navigate('/payment', { state: { address: formData } });
      
    } catch (err) {
      console.error("Place Order / Save Address Error:", err);
      alert(err.response?.data?.message || "Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="checkout-page">
      <Navbar />
      
      <div className="checkout-container">
        <div className="checkout-card">
          <header className="checkout-header">
            <h2 className="checkout-title">Shipping Details</h2>
            <p>Enter your coordinates for delivery</p>
          </header>

          <form onSubmit={handlePlaceOrder} className="checkout-form">
            <div className="input-group">
              <label>Personal Information</label>
              <div className="input-grid">
                <input 
                  type="text" 
                  name="fullName"
                  placeholder="Full Name" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email Address" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <input 
                type="text" 
                name="phone"
                placeholder="Contact Number" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Delivery Address</label>
              <div className="address-wrapper">
                <textarea 
                  name="address"
                  className="address-textarea"
                  placeholder="House No, Society Name, Area, Street..." 
                  value={formData.address} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="input-grid">
                <input 
                  type="text" 
                  name="city"
                  placeholder="City" 
                  value={formData.city} 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="text" 
                  name="state"
                  placeholder="State" 
                  value={formData.state} 
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="text" 
                  name="pincode"
                  placeholder="Pincode" 
                  value={formData.pincode} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="checkout-options">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={saveAddress} 
                  onChange={e => setSaveAddress(e.target.checked)} 
                />
                <span className="checkmark"></span>
                Save this address for future orders
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-place-order" 
              disabled={loading}
            >
              {loading ? 'PROCESSING...' : 'CONFIRM & PLACE ORDER'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
