import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ShippingReturns.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ShippingReturns = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    email: '',
    productName: '',
    reason: 'size-issue',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send return request to Node.js backend
      await axios.post(`${API_URL}/returns/request`, formData);
      alert("Your return request has been submitted. El Bro Syndicate will contact you shortly.");
      setFormData({ orderId: '', email: '', productName: '', reason: 'size-issue', message: '' });
    } catch (err) {
      alert("Error submitting request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-page">
      <Navbar />
      
      <div className="sr-container">
        {/* HERO SECTION */}
        <header className="sr-header">
          <h1>SHIPPING & RETURNS</h1>
          <div className="sr-divider"></div>
          <p className="sr-subtitle">Guidelines for the El Bro Syndicate experience</p>
        </header>

        <div className="sr-content">
          {/* POLICIES SECTION */}
          <section className="policies-grid">
            <div className="policy-card">
              <h3>SHIPPING POLICY</h3>
              <p>Every piece from <strong>El Bro Syndicate</strong> is handled with extreme care. We ensure our global luxury brands reach you in pristine condition.</p>
              <ul className="policy-list">
                <li><span>Express Delivery:</span> 3-5 Business Days.</li>
                <li><span>Free Shipping:</span> Complimentary on all orders above ₹5,000.</li>
                <li><span>Global Sourcing:</span> We ship our foreign luxury collections worldwide.</li>
                <li><span>Tracking:</span> A unique tracking ID is provided upon dispatch.</li>
              </ul>
            </div>

            <div className="policy-card">
              <h3>RETURN POLICY</h3>
              <p>We maintain a strict quality standard. If you are not satisfied with your purchase, we offer a seamless return process.</p>
              <ul className="policy-list">
                <li><span>Window:</span> Returns are accepted within 14 days of delivery.</li>
                <li><span>Condition:</span> Items must be unworn, with original tags and packaging.</li>
                <li><span>Process:</span> Our team inspects the item before approving a refund.</li>
                <li><span>Exclusions:</span> Custom-tailored items are non-refundable.</li>
              </ul>
            </div>
          </section>

          {/* RETURN REQUEST FORM */}
          <section className="return-portal">
            <div className="portal-header">
              <h2>RETURN PORTAL</h2>
              <p>Initiate a return request for your order below.</p>
            </div>

            <form className="return-form" onSubmit={handleReturnSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label>Order ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SYN-12345" 
                    value={formData.orderId} 
                    onChange={e => setFormData({...formData, orderId: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  placeholder="Which item are you returning?" 
                  value={formData.productName} 
                  onChange={e => setFormData({...formData, productName: e.target.value})} 
                  required 
                />
              </div>

              <div className="input-group">
                <label>Reason for Return</label>
                <select 
                  value={formData.reason} 
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                >
                  <option value="size-issue">Size/Fit Issue</option>
                  <option value="quality-issue">Quality Concern</option>
                  <option value="wrong-item">Wrong Item Received</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Additional Notes</label>
                <textarea 
                  placeholder="Tell us more about the issue..." 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="btn-submit-return" disabled={loading}>
                {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
              </button>
            </form>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShippingReturns;
