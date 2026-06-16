import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Simple breadcrumb logic based on pathname
  const generateBreadcrumb = () => {
    const path = location.pathname.split('/').pop();
    if (!path) return 'Admin';
    // Capitalize first letter
    return `Admin > ${path.charAt(0).toUpperCase() + path.slice(1)}`;
  };

  return (
    <div className="admin-layout">
      <div className="no-print">
        <AdminSidebar />
      </div>
      
      <div className="admin-main">
        <header className="admin-header no-print">
          <div className="admin-breadcrumb">
            {generateBreadcrumb()}
          </div>
          <div className="admin-profile">
            <span>{user?.name || 'Admin'} ({user?.email || 'admin@syndycate.com'})</span>
            <button className="admin-logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
