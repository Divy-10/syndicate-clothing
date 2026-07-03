import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminOrders.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

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

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setTracking(null);
    setTrackingError(null);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setTracking(null);
    setTrackingError(null);
  };

  const fetchTracking = async (orderId) => {
    setTrackingLoading(true);
    setTrackingError(null);
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}/track`);
      setTracking(res.data);
    } catch (err) {
      setTrackingError(err.response?.data?.message || 'Shipment tracking information is currently being processed by Delhivery. Please check back shortly.');
    } finally {
      setTrackingLoading(false);
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
        
        /* ADMIN DETAILS MODAL STYLING */
        .admin-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          padding: 20px;
        }
        .admin-modal-content {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
          color: #000;
          padding: 30px;
          position: relative;
          font-family: inherit;
          text-align: left;
        }
        .admin-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: #888;
          font-size: 24px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .admin-modal-close:hover {
          color: #000;
        }
        .admin-modal-title {
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 2px;
          margin-bottom: 20px;
          color: #000;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          text-transform: uppercase;
        }
        .admin-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
          font-size: 13px;
        }
        .admin-details-section h4 {
          color: #000;
          margin-bottom: 8px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 900;
        }
        .admin-details-section p {
          margin: 4px 0;
          color: #555;
        }
        .admin-modal-items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 12px;
        }
        .admin-modal-items-table th {
          text-align: left;
          padding: 10px;
          color: #999;
          border-bottom: 1px solid #eee;
          font-weight: 900;
          text-transform: uppercase;
        }
        .admin-modal-items-table td {
          padding: 10px;
          border-bottom: 1px solid #f9f9f9;
          color: #333;
        }
        .status-pill {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          padding: 4px 8px;
          border-radius: 2px;
          text-transform: uppercase;
          display: inline-block;
        }
        .status-pill.pending { background: #fffbe6; color: #856404; }
        .status-pill.confirmed { background: #e6fffa; color: #087f5b; }
        .status-pill.processing { background: #eef2ff; color: #4338ca; }
        .status-pill.dispatch { background: #fff5f5; color: #c53030; }
        .status-pill.transit { background: #f0f4f8; color: #243b53; }
        .status-pill.delivered { background: #f0fff4; color: #22543d; }
        .status-pill.cancelled { background: #f5f5f5; color: #666; }
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
              {orders.map(order => {
                const itemsTotal = Math.max(0, order.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) - (order.discountAmount || 0));
                return (
                  <tr key={order._id}>
                    <td className="id-col">#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                    <td className="customer-col">
                      <div className="customer-info">
                        <span className="customer-name">{order.userId?.name || 'Guest User'}</span>
                        <span className="customer-email">{order.userId?.email}</span>
                      </div>
                    </td>
                    <td className="total-col">₹{itemsTotal}</td>
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
                        <button className="btn-view-details" onClick={() => openOrderDetails(order)}>DETAILS</button>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={closeOrderDetails}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={closeOrderDetails}>&times;</button>
            <h3 className="admin-modal-title">ORDER DETAILS #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</h3>
            
            <div className="admin-details-grid">
              <div className="admin-details-section">
                <h4>Order Summary</h4>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'COD'}</p>
                <p><strong>Status:</strong> <span className={`status-pill ${selectedOrder.status.toLowerCase().replace(' ', '-')}`}>{selectedOrder.status}</span></p>
                <p><strong>Total (Products):</strong> ₹{Math.max(0, selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.qty), 0) - (selectedOrder.discountAmount || 0)).toLocaleString()}</p>
                <p><strong>Discount:</strong> ₹{(selectedOrder.discountAmount || 0).toLocaleString()}</p>
                <p><strong>Grand Total Paid:</strong> ₹{selectedOrder.totalAmount?.toLocaleString()}</p>
              </div>

              <div className="admin-details-section">
                <h4>Shipping Address</h4>
                <p><strong>{selectedOrder.shippingAddress?.fullName}</strong></p>
                <p>{selectedOrder.shippingAddress?.address}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
              </div>
            </div>

            <h4>Items Ordered</h4>
            <table className="admin-modal-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.size || item.selectedSize || 'N/A'}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.price?.toLocaleString()}</td>
                    <td>₹{(item.price * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* DELHIvery Shipping details & tracking */}
            <div className="admin-details-section" style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h4>Shipping Partner: Delhivery</h4>
              {selectedOrder.awb ? (
                <div>
                  <p><strong>AWB / Tracking Number:</strong> {selectedOrder.awb}</p>
                  <p><strong>Current Shipping Status:</strong> {selectedOrder.delhiveryStatus || 'Manifested'}</p>
                  
                  {!tracking && !trackingLoading && (
                    <button className="btn-admin-action sync-status" style={{ fontSize: '11px', marginTop: '10px' }} onClick={() => fetchTracking(selectedOrder._id)}>Track Shipment</button>
                  )}

                  {/* Render Live Tracking Scans */}
                  {(trackingLoading || tracking || trackingError) && (
                    <div className="admin-tracking-timeline" style={{ marginTop: '15px', background: '#fafafa', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
                      {trackingLoading && <div style={{ color: '#666', fontSize: '12px' }}>Fetching real-time scans from Delhivery...</div>}
                      {trackingError && <div style={{ color: '#c53030', fontSize: '12px' }}>{trackingError}</div>}
                      {tracking && (
                        <div>
                          <h5 style={{ margin: '0 0 10px 0', textTransform: 'uppercase', color: '#000', fontSize: '12px' }}>Scan History</h5>
                          {(!tracking.ShipmentData || tracking.ShipmentData.length === 0 || !tracking.ShipmentData[0]?.Shipment?.Scans || tracking.ShipmentData[0]?.Shipment?.Scans.length === 0) ? (
                            <p style={{ fontSize: '12px', margin: 0, color: '#888' }}>Manifested. Awaiting carrier pickup at our warehouse.</p>
                          ) : (
                            <div style={{ borderLeft: '2px solid #000', marginLeft: '10px', paddingLeft: '15px' }}>
                              {tracking.ShipmentData[0].Shipment.Scans.map((scanObj, sIdx) => {
                                const scan = scanObj.ScanDetail || scanObj;
                                return (
                                  <div key={sIdx} style={{ marginBottom: '15px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#000' }}></div>
                                    <div style={{ fontSize: '11px', color: '#888' }}>{new Date(scan.ScanDateTime || scan.DateTime).toLocaleString()}</div>
                                    <div style={{ fontSize: '12px', color: '#333', fontWeight: 'bold' }}>{scan.Scan || scan.Instructions}</div>
                                    {scan.ScannedLocation && <span style={{ fontSize: '10px', background: '#eee', padding: '2px 4px', borderRadius: '2px' }}>{scan.ScannedLocation}</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#888', margin: '5px 0' }}>
                  {selectedOrder.status === 'Cancelled' ? 'Order cancelled. Shipping is not applicable.' : 'Shipping label and tracking ID not generated yet.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

};

export default AdminOrders;
