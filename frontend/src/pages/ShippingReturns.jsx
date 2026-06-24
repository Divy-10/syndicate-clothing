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
    customerName: '',
    phone: '',
    pickupAddress: '',
    city: '',
    state: '',
    pincode: '',
    productName: '',
    reason: 'size-issue',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(false);

  const handleLookupOrder = async () => {
    if (!formData.orderId || !formData.email) {
      alert("Please enter Order ID and Email Address to look up your details.");
      return;
    }
    setFetchingOrder(true);
    try {
      const response = await axios.get(`${API_URL}/returns/lookup-order`, {
        params: {
          orderId: formData.orderId,
          email: formData.email
        }
      });
      const data = response.data;
      setFormData(prev => ({
        ...prev,
        customerName: data.customerName,
        phone: data.phone,
        pickupAddress: data.pickupAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        productName: data.products
      }));
      alert("Order details imported successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Order not found. Please fill in details manually.");
    } finally {
      setFetchingOrder(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/returns/request`, formData);
      if (res.data.awb) {
        alert(`Your return request has been submitted. Waybill/AWB: ${res.data.awb}. Our pickup agent will visit you soon.`);
      } else {
        alert("Your return request has been submitted successfully for approval.");
      }
      setFormData({
        orderId: '',
        email: '',
        customerName: '',
        phone: '',
        pickupAddress: '',
        city: '',
        state: '',
        pincode: '',
        productName: '',
        reason: 'size-issue',
        message: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting request. Please try again.");
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
                    placeholder="e.g. 6a256fe73c3b..." 
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

              <button 
                type="button" 
                className="btn-luxury" 
                style={{ width: '100%', marginBottom: '24px', padding: '10px' }}
                onClick={handleLookupOrder}
                disabled={fetchingOrder}
              >
                {fetchingOrder ? 'FETCHING DETAILS...' : 'AUTO-FILL FROM ORDER'}
              </button>

              <div className="portal-header" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
                <h3 style={{ fontSize: '14px', letterSpacing: '2px' }}>PICKUP ADDRESS DETAILS</h3>
                <p>Verify or fill in where Delhivery should collect the return package.</p>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Customer Name" 
                    value={formData.customerName} 
                    onChange={e => setFormData({...formData, customerName: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. 9876543210" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Pickup Street Address</label>
                <input 
                  type="text" 
                  placeholder="Flat No, Building, Area" 
                  value={formData.pickupAddress} 
                  onChange={e => setFormData({...formData, pickupAddress: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    placeholder="City" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    placeholder="State" 
                    value={formData.state} 
                    onChange={e => setFormData({...formData, state: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-group">
                  <label>Pincode</label>
                  <input 
                    type="text" 
                    placeholder="6-digit Pincode" 
                    value={formData.pincode} 
                    onChange={e => setFormData({...formData, pincode: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginTop: '10px' }}>
                <label>Product Name (Items returning)</label>
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

              <button type="submit" className="btn-submit-return" style={{ marginTop: '20px' }} disabled={loading}>
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
