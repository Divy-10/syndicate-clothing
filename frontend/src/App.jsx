import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import AdminCreateProduct from './pages/AdminCreateProduct';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

// New Admin imports
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import POSScreen from './pages/admin/POSScreen';
import Inventory from './pages/admin/Inventory';
import BarcodeCenter from './pages/admin/BarcodeCenter';
import ProfilePage from './pages/ProfilePage';
import Orders from './pages/admin/Orders';
import CategoryPage from './pages/admin/CategoryPage';
import CouponPage from './pages/admin/CouponPage';

import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductsPage from './pages/ProductsPage';
import Checkout from './pages/Checkout';
import PaymentPage from './pages/PaymentPage';
import ShippingReturns from './pages/ShippingReturns';
import SizeGuide from './pages/SizeGuide';
import AdminMessages from './pages/admin/AdminMessages';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Protected route — requires admin role
function ProtectedAdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="product-detail__loading-spinner"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Protected route — requires admin OR employee role
function ProtectedEmployeeRoute({ children }) {
  const { user, loading, isAdmin, isEmployee } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="product-detail__loading-spinner"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isEmployee)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Protected route — requires any logged-in user
function ProtectedUserRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="product-detail__loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect if already logged in
function AuthRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'employee') return <Navigate to="/admin/pos" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/shipping-returns" element={<ShippingReturns />} />
      <Route path="/size-guide" element={<SizeGuide />} />

      {/* Protected storefront features */}
      <Route path="/products" element={
        <ProtectedUserRoute><ProductsPage /></ProtectedUserRoute>
      } />
      <Route path="/cart" element={
        <ProtectedUserRoute><Cart /></ProtectedUserRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedUserRoute><Checkout /></ProtectedUserRoute>
      } />
      <Route path="/payment" element={
        <ProtectedUserRoute><PaymentPage /></ProtectedUserRoute>
      } />
      <Route path="/profile" element={
        <ProtectedUserRoute><ProfilePage /></ProtectedUserRoute>
      } />
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* Auth pages — redirect if already logged in */}
      <Route path="/login" element={
        <AuthRoute><Login /></AuthRoute>
      } />
      <Route path="/register" element={
        <AuthRoute><Register /></AuthRoute>
      } />
      <Route path="/signup" element={
        <AuthRoute><Register /></AuthRoute>
      } />

      {/* Admin Layout — protected for admin and employee */}
      <Route path="/admin" element={
        <ProtectedEmployeeRoute><AdminLayout /></ProtectedEmployeeRoute>
      }>
        {/* Redirect /admin to /admin/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* POS is for both admin & employee */}
        <Route path="pos" element={<POSScreen />} />

        {/* Following routes are only for admin */}
        <Route path="dashboard" element={
          <ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>
        } />
        <Route path="inventory" element={
          <ProtectedAdminRoute><Inventory /></ProtectedAdminRoute>
        } />
        <Route path="barcodes" element={
          <ProtectedAdminRoute><BarcodeCenter /></ProtectedAdminRoute>
        } />
        <Route path="orders" element={
          <ProtectedAdminRoute><Orders /></ProtectedAdminRoute>
        } />
        <Route path="categories" element={
          <ProtectedAdminRoute><CategoryPage /></ProtectedAdminRoute>
        } />
        <Route path="messages" element={
          <ProtectedAdminRoute><AdminMessages /></ProtectedAdminRoute>
        } />
        <Route path="coupons" element={
          <ProtectedAdminRoute><CouponPage /></ProtectedAdminRoute>
        } />
      </Route>

      {/* Legacy/Standalone routes that might still be used */}
      <Route path="/admin/create" element={
        <ProtectedAdminRoute><AdminCreateProduct /></ProtectedAdminRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "681829681827-k5a940l814352 9b8v6s182r00s2v3l5g.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppRoutes />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}
