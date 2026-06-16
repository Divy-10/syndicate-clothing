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

  if (loading) return <div className="loader-container"><div className="loader">Loading Orders...</div></div>;

  return (
    <div className="orders-page-container">
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
                  </td>
                  <td className="action-col">
                    <button className="btn-view-details">DETAILS</button>
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
