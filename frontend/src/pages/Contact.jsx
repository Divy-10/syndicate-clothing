import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Contact.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Contact = () => {
  const [msg, setMsg] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });
  const [loaded, setLoaded] = useState(false);
  const [activeService, setActiveService] = useState('styling');

  useEffect(() => {
    setLoaded(true);
  }, []);

  const serviceConfig = {
    styling: {
      title: "BESPOKE STYLING",
      bgImage: "/assets/images/model-silk-shirt.jpg",
      description: "Consult with our house designers for custom tailoring, sizing, and fabric selection.",
      placeholder: "Describe your desired silhouette, fabric choices (silk, heavy cotton), and custom fit details..."
    },
    orders: {
      title: "PRIVATE ORDERS",
      bgImage: "/assets/images/luxury-shop.png",
      description: "Direct assistance for vault orders, logistics, global priority courier shipments, and returns.",
      placeholder: "Specify order details, tracking reference, or priority shipping queries..."
    },
    press: {
      title: "PRESS & MEDIA",
      bgImage: "/assets/images/luxury-shop1.png",
      description: "Inquiries regarding global editorials, collection previews, showroom samples, and collaborations.",
      placeholder: "Detail your publication, launch timelines, or collaboration proposals..."
    }
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    
    try {
      // Append selected service prefix to message for backend reference
      const payload = {
        name: msg.name,
        email: msg.email,
        message: `[SERVICE: ${serviceConfig[activeService].title}] ${msg.message}`
      };
      
      const response = await axios.post(`${API_URL}/contact/send`, payload);
      if (response.status === 200) {
        alert(`✅ ${serviceConfig[activeService].title} request transmitted successfully.`);
        setStatus({ loading: false, success: true, error: null });
        setMsg({ name: '', email: '', message: '' });
      }
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Transmission failed.' });
      alert("❌ Transmission failed. Please try again.");
    }
  };

  return (
    <div className="contact-luxury-page">
      <Navbar />
      
      <div className={`contact-luxury-split ${loaded ? 'is-loaded' : ''}`}>
        
        {/* LEFT SIDE: Dynamic Cross-Fading Background Visuals */}
        <div className="contact-visual-side">
          {Object.entries(serviceConfig).map(([key, value]) => (
            <div 
              key={key}
              className={`bg-layer ${activeService === key ? 'active' : ''}`}
              style={{ backgroundImage: `url('${value.bgImage}')` }}
            />
          ))}
          
          <div className="visual-shimmer-overlay"></div>
          
          <div className="visual-caption">
            <span className="visual-preheading">SYNDYCATE CONCIERGE</span>
            <div className="dynamic-title-wrapper">
              <h2 className="dynamic-visual-title">{serviceConfig[activeService].title}</h2>
            </div>
            <p className="dynamic-visual-desc">{serviceConfig[activeService].description}</p>
          </div>
          
          {/* Members Seal Stamp */}
          <div className="concierge-seal">
            <svg viewBox="0 0 100 100">
              <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="none" />
              <text>
                <textPath href="#circlePath">
                  SYNDYCATE CONCIERGE • MEMBERS ACCESS •
                </textPath>
              </text>
            </svg>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Concierge Form */}
        <div className="contact-form-side">
          <div className="form-header">
            <span className="form-pre-label">SERVICE SELECTION</span>
            <h1>DIRECT INQUIRY</h1>
            
            {/* Service Buttons Tab Selectors */}
            <div className="concierge-tabs">
              {Object.entries(serviceConfig).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  className={`tab-btn ${activeService === key ? 'active' : ''}`}
                  onClick={() => setActiveService(key)}
                >
                  {value.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <form className="luxury-contact-form" onSubmit={sendMsg}>
            <div className="form-group">
              <label>FULL NAME</label>
              <input 
                type="text" 
                placeholder="Enter your full name" 
                value={msg.name}
                onChange={e => setMsg({...msg, name: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                value={msg.email}
                onChange={e => setMsg({...msg, email: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>{serviceConfig[activeService].title} INQUIRY</label>
              <textarea 
                placeholder={serviceConfig[activeService].placeholder}
                value={msg.message}
                onChange={e => setMsg({...msg, message: e.target.value})}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn-send" disabled={status.loading}>
              {status.loading ? 'TRANSMITTING...' : 'INITIATE CONTACT'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
