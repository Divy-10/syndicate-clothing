import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminOrders.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/admin/orders/${orderId}/status`, { status: newStatus });
      alert(`Order updated to ${newStatus}`);
      fetchOrders(); // Refresh the list to update the UI
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const syncDelhiveryStatus = async (orderId) => {
    try {
      const res = await axios.post(`${API_URL}/admin/orders/${orderId}/delhivery-sync`);
      if (res.data.success) {
        alert(`Status updated to ${res.data.status} (Delhivery: ${res.data.delhiveryStatus})`);
        fetchOrders();
      } else {
        alert("Failed to sync status with Delhivery");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to sync status");
    }
  };

  if (loading) return <div className="loader-container"><div className="loader">Loading Orders...</div></div>;

  return (
    <div className="orders-page-container">
      <style>{`
        .admin-shipping-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
        }
        .btn-admin-action {
          font-size: 9px;
          padding: 6px 10px;
          letter-spacing: 1px;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
          text-align: center;
          font-weight: 700;
          transition: all 0.3s;
          display: inline-block;
          box-sizing: border-box;
        }
        .btn-admin-action.print-label {
          background: transparent;
          border: 1px solid #ffb74d;
          color: #ffb74d !important;
        }
        .btn-admin-action.print-label:hover {
          background: #ffb74d;
          color: #120c08 !important;
        }
        .btn-admin-action.sync-status {
          background: transparent;
          border: 1px solid #90caf9;
          color: #90caf9 !important;
        }
        .btn-admin-action.sync-status:hover {
          background: #90caf9;
          color: #0d47a1 !important;
        }
        .awb-display {
          font-size: 10px;
          color: #ffb74d;
          margin-top: 8px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-align: left;
        }
      `}</style>
      <div className="orders-header">
        <h1>CUSTOMER ORDERS</h1>
        <p>MANAGE AND TRACK ONLINE SHIPMENTS</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">NO ORDERS FOUND IN THE SYSTEM.</div>
      ) : (
        <div className="table-wrapper">
          <table className="luxury-admin-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>TOTAL</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td className="id-col">#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                  <td className="customer-col">
                    <div className="customer-info">
                      <span className="customer-name">{order.userId?.name || 'Guest User'}</span>
                      <span className="customer-email">{order.userId?.email}</span>
                    </div>
                  </td>
                  <td className="total-col">₹{order.totalAmount}</td>
                  <td className="payment-col">
                    <span className="payment-badge">{order.paymentMethod}</span>
                  </td>
                  <td className="status-col">
                    <select 
                       className={`status-select ${order.status.toLowerCase().replace(' ', '-')}`}
                      value={order.status} 
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Dispatch">Dispatch</option>
                      <option value="Transit">Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {order.awb && (
                      <div className="awb-display">
                        AWB: {order.awb}
                        <br />
                        ({order.delhiveryStatus || 'Manifested'})
                      </div>
                    )}
                  </td>
                  <td className="action-col">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button className="btn-view-details">DETAILS</button>
                      {order.awb && (
                        <div className="admin-shipping-actions">
                          <a 
                            href={order.delhiveryLabelUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn-admin-action print-label"
                          >
                            Print Label
                          </a>
                          <button 
                            onClick={() => syncDelhiveryStatus(order._id)} 
                            className="btn-admin-action sync-status"
                          >
                            Sync Delivery
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

};

export default AdminOrders;
