import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import './Profile.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, setUser: setAuthUser, logout } = useAuth();
  
  // Set initial tab from navigation state if available
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
  const [tabMenuOpen, setTabMenuOpen] = useState(false);
  
  // Update active tab if navigation state changes (e.g. user clicks Wishlist icon while already on Profile page)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || authUser);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Synchronize local user state when authUser loads asynchronously
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    setAuthUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  useEffect(() => {
    const fetchData = async () => {
      const userId = user?.id || user?._id;
      console.log("[ProfilePage] User object:", user);
      console.log("[ProfilePage] Extracted userId:", userId);
      if (!userId) {
        console.log("[ProfilePage] No userId found, returning early.");
        return;
      }

      try {
        console.log("[ProfilePage] Fetching orders and addresses from:", API_URL);
        const [userOrders, userAddrs] = await Promise.all([
          axios.get(`${API_URL}/orders/user/${userId}`),
          axios.get(`${API_URL}/address/user/${userId}`)
        ]);
        console.log("[ProfilePage] Fetched orders:", userOrders.data);
        console.log("[ProfilePage] Fetched address response:", userAddrs.data);
        setOrders(userOrders.data);
        const processedAddress = userAddrs.data && userAddrs.data._id ? [userAddrs.data] : [];
        console.log("[ProfilePage] Processed address array:", processedAddress);
        setAddresses(processedAddress);
      } catch (err) {
        console.error("[ProfilePage] Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-page-wrapper">
      <Navbar />
      <div className="profile-portal">
        {/* LEFT SIDEBAR */}
        <aside className="profile-sidebar">
          <div className="sidebar-brand">
            <h2>EL BRO SYNDICATE</h2>
            <p>CLIENT PORTAL</p>
          </div>

          {/* DESKTOP SIDEBAR NAV */}
          <nav className="sidebar-nav">
            <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
              <span className="icon">⌂</span> Dashboard
            </button>
            <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              <span className="icon">📦</span> My Orders
            </button>
            <button className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>
              <span className="icon">📍</span> Address Book
            </button>
            <button className={activeTab === 'wishlist' ? 'active' : ''} onClick={() => setActiveTab('wishlist')}>
              <span className="icon">♥</span> Wishlist
            </button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <span className="icon">⚙</span> Settings
            </button>
          </nav>

          {/* MOBILE TAB DROPDOWN SELECTOR */}
          <div className="profile-tab-dropdown">
            <button 
              className="tab-dropdown-toggle" 
              onClick={() => setTabMenuOpen(!tabMenuOpen)}
            >
              <span className="current-tab-label">
                {activeTab === 'dashboard' && <><span className="icon">⌂</span> Dashboard</>}
                {activeTab === 'orders' && <><span className="icon">📦</span> My Orders</>}
                {activeTab === 'address' && <><span className="icon">📍</span> Address Book</>}
                {activeTab === 'wishlist' && <><span className="icon">♥</span> Wishlist</>}
                {activeTab === 'settings' && <><span className="icon">⚙</span> Settings</>}
              </span>
              <span className="dropdown-arrow">{tabMenuOpen ? '▲' : '▼'}</span>
            </button>
            
            {tabMenuOpen && (
              <div className="tab-dropdown-menu">
                {activeTab !== 'dashboard' && (
                  <button onClick={() => { setActiveTab('dashboard'); setTabMenuOpen(false); }}>
                    <span className="icon">⌂</span> Dashboard
                  </button>
                )}
                {activeTab !== 'orders' && (
                  <button onClick={() => { setActiveTab('orders'); setTabMenuOpen(false); }}>
                    <span className="icon">📦</span> My Orders
                  </button>
                )}
                {activeTab !== 'address' && (
                  <button onClick={() => { setActiveTab('address'); setTabMenuOpen(false); }}>
                    <span className="icon">📍</span> Address Book
                  </button>
                )}
                {activeTab !== 'wishlist' && (
                  <button onClick={() => { setActiveTab('wishlist'); setTabMenuOpen(false); }}>
                    <span className="icon">♥</span> Wishlist
                  </button>
                )}
                {activeTab !== 'settings' && (
                  <button onClick={() => { setActiveTab('settings'); setTabMenuOpen(false); }}>
                    <span className="icon">⚙</span> Settings
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            <button onClick={handleLogout} className="logout-btn">LOGOUT</button>
          </div>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <main className="profile-main">
          {loading ? (
            <div className="loader-container">
              <div className="loader">Loading your portal...</div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView user={user} orders={orders} />}
              {activeTab === 'orders' && <OrdersView orders={orders} />}
              {activeTab === 'address' && <AddressView addresses={addresses} />}
              {activeTab === 'wishlist' && <WishlistView />}
              {activeTab === 'settings' && <SettingsView user={user} onUpdateUser={handleUpdateUser} />}
            </>
          )}
        </main>

        {/* MOBILE ONLY LOGOUT BUTTON AT THE BOTTOM */}
        <div className="profile-mobile-logout">
          <button onClick={handleLogout} className="logout-btn">LOGOUT</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const DashboardView = ({ user, orders }) => {
  const { wishlist } = useWishlist();
  return (
    <div className="fade-in">
      <div className="user-welcome">
        <div className="avatar-circle">{user?.name?.charAt(0) || 'U'}</div>
        <div className="welcome-text">
          <h1>Welcome, {user?.name}</h1>
          <span className="status-badge">ELITE CLIENT</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <h3>{orders.length}</h3>
          <p>Orders Placed</p>
        </div>
        <div className="stat-box">
          <h3>{orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}</h3>
          <p>Active Shipments</p>
        </div>
        <div className="stat-box">
          <h3>{wishlist.length}</h3>
          <p>Wishlist Items</p>
        </div>
      </div>

      <div className="recent-activity">
          <h3>Recent Activity</h3>
          <p>Your syndicate journey is being tracked. Stay exclusive.</p>
      </div>
    </div>
  );
};

const OrdersView = ({ orders }) => (
  <div className="fade-in">
    <h2 className="section-title">ORDER HISTORY</h2>
    {orders.length === 0 ? (
      <div className="empty-state">
        <p>Your syndicate wardrobe is empty. Begin your journey.</p>
        <button className="btn-luxury-filled" onClick={() => window.location.href='/products'}>GO SHOPPING</button>
      </div>
    ) : (
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td data-label="Order ID" className="order-id-cell">#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td data-label="Total" className="order-total-cell">₹{order.totalAmount?.toLocaleString()}</td>
                <td data-label="Status">
                  <span className={`status-pill ${order.status.toLowerCase()}`}>{order.status}</span>
                </td>
                <td data-label="Actions">
                  <button className="btn-detail-small">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const AddressView = ({ addresses }) => (
  <div className="fade-in">
    <div className="address-header">
      <h2 className="section-title">ADDRESS BOOK</h2>
      <button className="btn-add-addr">+ Add New Address</button>
    </div>
    <div className="address-grid">
      {addresses.map((addr, index) => (
        <div key={index} className="addr-card">
          <div className="addr-info">
            <strong>{addr.fullName}</strong>
            <p>{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
            <p className="phone">{addr.phone}</p>
          </div>
          <div className="addr-actions">
            <button className="btn-edit">Edit</button>
          </div>
        </div>
      ))}
      {addresses.length === 0 && (
          <p className="empty-msg">No addresses saved yet.</p>
      )}
    </div>
  </div>
);

const formatDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

const SettingsView = ({ user, onUpdateUser }) => {
  console.log("[SettingsView] Rendered with user:", user);
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [dob, setDob] = useState(formatDate(user?.dob));
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Synchronize internal state when user prop updates
  useEffect(() => {
    if (user) {
      console.log("[SettingsView] Syncing form with user data:", user);
      setName(user.name || '');
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || '');
      setGender(user.gender || 'Male');
      setDob(formatDate(user.dob));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="loader-container">
        <div className="loader">Loading your account settings...</div>
      </div>
    );
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.put(`${API_URL}/auth/profile`, {
        name,
        phone,
        whatsapp,
        gender,
        dob,
        password: password || undefined
      });
      setMessage("Profile updated successfully!");
      if (onUpdateUser) {
        onUpdateUser(res.data.user);
      }
      setPassword('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="section-title">ACCOUNT & SECURITY</h2>
      
      {message && <div style={{ color: 'var(--text-primary)', border: '1px solid rgba(76, 175, 80, 0.4)', background: 'rgba(76, 175, 80, 0.1)', padding: '12px 18px', margin: '15px 0', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600', borderRadius: '4px' }}>{message}</div>}
      {error && <div style={{ color: '#ff8a80', border: '1px solid rgba(244, 67, 54, 0.4)', background: 'rgba(244, 67, 54, 0.1)', padding: '12px 18px', margin: '15px 0', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600', borderRadius: '4px' }}>{error}</div>}

      <form className="settings-form" onSubmit={handleUpdate}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={user.email || ''} readOnly disabled />
        </div>
        <div className="form-group">
          <label>Contact Number (Phone)</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 ..." />
        </div>
        <div className="form-group">
          <label>WhatsApp Number</label>
          <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91 ..." />
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select value={gender} onChange={e => setGender(e.target.value)}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} />
        </div>
        <div className="form-group">
          <label>New Password (leave blank to keep current)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password" />
        </div>
        <button type="submit" className="btn-save-settings" disabled={loading}>
          {loading ? 'SAVING...' : 'UPDATE PROFILE'}
        </button>
      </form>
    </div>
  );
};

const WishlistView = () => {
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      <h2 className="section-title">MY VAULT</h2>
      {wishlist.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 0' }}>
          <p className="empty-msg" style={{ marginBottom: '25px', color: '#888' }}>
            Your vault is empty. Begin your journey.
          </p>
          <button className="btn-luxury-outline" onClick={() => navigate('/shop')}>
            EXPLORE COLLECTION
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
