import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MonitorPlay,
  Package,
  Barcode,
  ShoppingBag,
  Tags,
  Mail,
  Percent
} from 'lucide-react';
import './AdminSidebar.css';

export default function AdminSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="admin-sidebar">
      <div className="admin-sidebar__header">
        <h2>EL BRO SYNDICATE</h2>
        <span>Admin Panel</span>
      </div>

      <div className="admin-sidebar__menu">
        {/* Visible to everyone (admin & employee) */}
        <Link
          to="/admin/pos"
          className={`admin-sidebar__link ${isActive('/admin/pos') ? 'active' : ''}`}
        >
          <MonitorPlay size={20} />
          <span>POS System</span>
        </Link>

        {/* Visible ONLY to admin */}
        {user?.role === 'admin' && (
          <>
            <Link
              to="/admin/dashboard"
              className={`admin-sidebar__link ${isActive('/admin/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/admin/inventory"
              className={`admin-sidebar__link ${isActive('/admin/inventory') ? 'active' : ''}`}
            >
              <Package size={20} />
              <span>Inventory</span>
            </Link>

            <Link
              to="/admin/barcodes"
              className={`admin-sidebar__link ${isActive('/admin/barcodes') ? 'active' : ''}`}
            >
              <Barcode size={20} />
              <span>Barcode Center</span>
            </Link>

            <Link
              to="/admin/orders"
              className={`admin-sidebar__link ${isActive('/admin/orders') ? 'active' : ''}`}
            >
              <ShoppingBag size={20} />
              <span>Orders</span>
            </Link>

            <Link
              to="/admin/categories"
              className={`admin-sidebar__link ${isActive('/admin/categories') ? 'active' : ''}`}
            >
              <Tags size={20} />
              <span>Categories</span>
            </Link>

            <Link
              to="/admin/messages"
              className={`admin-sidebar__link ${isActive('/admin/messages') ? 'active' : ''}`}
            >
              <Mail size={20} />
              <span>Messages</span>
            </Link>

            <Link
              to="/admin/coupons"
              className={`admin-sidebar__link ${isActive('/admin/coupons') ? 'active' : ''}`}
            >
              <Percent size={20} />
              <span>Coupons</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
