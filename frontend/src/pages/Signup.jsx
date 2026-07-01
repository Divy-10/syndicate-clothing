import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', 
    phone: '',
    whatsapp: '',
    gender: 'Male',
    dob: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState('');

  // VALIDATION: Ensure email is only @gmail.com or @icloud.com
  const isValidEmail = (emailVal) => {
    const allowedDomains = ['gmail.com', 'icloud.com'];
    const domain = emailVal.split('@')[1];
    return allowedDomains.includes(domain?.toLowerCase());
  };

  const handleSendOtp = async () => {
    if (!formData.phone) {
      setError("Please enter your contact number first.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError("Membership is exclusive to @gmail.com and @icloud.com users.");
      return;
    }
    setError('');
    setOtpLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/send-otp`, { phone: formData.phone });
      alert(res.data?.message || "Verification code sent successfully.");
      setOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(formData.email)) {
      setError("Membership is exclusive to @gmail.com and @icloud.com users.");
      return;
    }

    if (!otpSent) {
      await handleSendOtp();
      return;
    }

    if (!otp) {
      setError("Please enter the verification code.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/signup`, { ...formData, otp });
      alert(res.data?.message || "Application Submitted. Welcome to the Syndicate.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please check your entries.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-title" style={{ display: 'block', textDecoration: 'none', marginBottom: '8px' }}>EL BRO SYNDICATE</Link>
          <p className="auth-subtitle">Complete your application for elite membership.</p>
        </div>

        {error && <div className="auth-card__error">{error}</div>}

        <form onSubmit={handleSignup} className="luxury-signup-form">
          {/* ROW 1: Name & Email */}
          <div className="form-row">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="user@gmail.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          {/* ROW 2: Phone & WhatsApp */}
          <div className="form-row">
            <div className="input-group">
              <label>Contact Number</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="tel" 
                  required 
                  placeholder="+91 ..." 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  disabled={otpSent}
                />
                {!otpSent && (
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={otpLoading || !formData.phone}
                    className="btn-send-otp"
                    style={{ padding: '0 12px', fontSize: '12px', whiteSpace: 'nowrap', backgroundColor: '#111', color: '#fff', border: '1px solid #333', cursor: 'pointer' }}
                  >
                    {otpLoading ? 'SENDING...' : 'SEND OTP'}
                  </button>
                )}
              </div>
            </div>
            <div className="input-group">
              <label>WhatsApp Number</label>
              <input 
                type="tel" 
                placeholder="+91 ..." 
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
              />
            </div>
          </div>

          {/* Verification Code field (conditional) */}
          {otpSent && (
            <div className="input-group full-width animate-fade-in" style={{ marginBottom: '16px' }}>
              <label>Verification Code (OTP)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter 6-digit OTP" 
                  value={otp}
                  onChange={e => setOtp(e.target.value)} 
                  maxLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => { setOtpSent(false); setOtp(''); }} 
                  className="btn-change-phone"
                  style={{ padding: '0 12px', fontSize: '12px', whiteSpace: 'nowrap', backgroundColor: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  CHANGE PHONE
                </button>
              </div>
            </div>
          )}

          {/* ROW 3: Gender & DOB */}
          <div className="form-row">
            <div className="input-group">
              <label>Gender</label>
              <select 
                className="luxury-select" 
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                required 
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})} 
              />
            </div>
          </div>

          {/* ROW 4: Password */}
          <div className="input-group full-width">
            <label>Create Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <button type="submit" className="btn-submit-app" disabled={loading || otpLoading}>
            {loading ? 'SUBMITTING...' : otpSent ? 'VERIFY & SUBMIT APPLICATION' : 'SEND OTP & SUBMIT'}
          </button>
        </form>
        
        <p className="auth-footer">Already a member? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}
