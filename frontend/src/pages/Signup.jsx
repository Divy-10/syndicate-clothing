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
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // VALIDATION: Ensure email is only @gmail.com or @icloud.com
  const isValidEmail = (emailVal) => {
    const allowedDomains = ['gmail.com', 'icloud.com'];
    const domain = emailVal.split('@')[1];
    return allowedDomains.includes(domain?.toLowerCase());
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(formData.email)) {
      setError("Membership is exclusive to @gmail.com and @icloud.com users.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/signup`, formData);
      alert(res.data?.message || "Verification OTP has been sent. Please verify your email.");
      setShowOtpScreen(true);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please check your entries.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp: otpCode
      });
      alert(res.data?.message || "Email verified successfully! You can now log in.");
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Invalid or expired OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      const res = await axios.post(`${API_URL}/auth/resend-otp`, {
        email: formData.email
      });
      alert(res.data?.message || "OTP resent successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Resend failed. Please try again.");
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

        {showOtpScreen ? (
          <form onSubmit={handleVerifyOtp} className="luxury-signup-form">
            <p className="auth-subtitle" style={{ textAlign: 'center', marginBottom: '24px', fontSize: '14px', lineHeight: '1.6' }}>
              We have sent a 6-digit verification code to <strong style={{ color: '#fff' }}>{formData.email}</strong>. Please enter it below to verify your email.
            </p>
            <div className="input-group full-width" style={{ marginBottom: '24px' }}>
              <label style={{ textAlign: 'center', display: 'block', marginBottom: '8px' }}>Enter 6-Digit OTP Code</label>
              <input 
                type="text" 
                maxLength="6"
                required 
                placeholder="000000" 
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)} 
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '24px', fontFamily: 'monospace', color: '#fff', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            <button type="submit" className="btn-submit-app" disabled={otpLoading}>
              {otpLoading ? 'VERIFYING...' : 'VERIFY EMAIL'}
            </button>
            <button 
              type="button" 
              onClick={handleResendOtp} 
              className="btn-auth-link" 
              style={{ display: 'block', margin: '16px auto 0 auto', background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}
            >
              Resend OTP
            </button>
          </form>
        ) : (
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
                <input 
                  type="tel" 
                  required 
                  placeholder="+91 ..." 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
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

            <button type="submit" className="btn-submit-app" disabled={loading}>
              {loading ? 'SUBMITTING APPLICATION...' : 'SUBMIT APPLICATION'}
            </button>
          </form>
        )}
        
        <p className="auth-footer">Already a member? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}
