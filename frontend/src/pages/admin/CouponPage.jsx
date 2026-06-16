import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './CouponPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons`);
      setCoupons(res.data);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discount) {
      setError('Please fill out all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        code: code.toUpperCase().trim(),
        discount: Number(discount),
        discountType,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        expiryDate: expiryDate || null
      };

      await axios.post(`${API_URL}/coupons`, payload);
      setSuccess('Coupon created successfully!');
      
      // Reset form
      setCode('');
      setDiscount('');
      setDiscountType('percentage');
      setMinOrderAmount('');
      setExpiryDate('');
      
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating coupon');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_URL}/coupons/${id}/status`, { isActive: !currentStatus });
      fetchCoupons();
    } catch (err) {
      alert('Error updating coupon status');
    }
  };

  const deleteCoupon = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this coupon?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#0a0a0a',
      color: '#E1DCC9',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#B8B1A1'
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/coupons/${id}`);
      fetchCoupons();
      Swal.fire({
        title: 'Deleted!',
        text: 'Coupon has been deleted.',
        icon: 'success',
        background: '#0a0a0a',
        color: '#E1DCC9',
        confirmButtonColor: '#B8B1A1'
      });
    } catch (err) {
      alert('Error deleting coupon');
    }
  };

  return (
    <div className="coupon-admin-container animate-fade-in-up">
      <div className="page-header">
        <h1>Coupon Management</h1>
        <p>Create and manage discount codes for checkout</p>
      </div>

      <div className="coupon-grid-layout">
        {/* Creation Form */}
        <div className="coupon-form-card">
          <h2>Create Coupon</h2>
          <form onSubmit={handleAddCoupon} className="coupon-form">
            <div className="form-group-coupon">
              <label>Coupon Code *</label>
              <input
                type="text"
                placeholder="e.g. WELCOME10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="form-row-coupon">
              <div className="form-group-coupon">
                <label>Discount Value *</label>
                <input
                  type="number"
                  placeholder="e.g. 10"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                  min="0"
                />
              </div>

              <div className="form-group-coupon">
                <label>Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>
            </div>

            <div className="form-group-coupon">
              <label>Min Order Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1500 (optional)"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                min="0"
              />
            </div>

            <div className="form-group-coupon">
              <label>Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-create-coupon" disabled={loading}>
              {loading ? 'Creating...' : 'Create Coupon'}
            </button>
          </form>

          {error && <p className="coupon-error">{error}</p>}
          {success && <p className="coupon-success">{success}</p>}
        </div>

        {/* Coupon Listing */}
        <div className="coupon-list-card">
          <h2>Active Coupons</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">No coupons created yet.</td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="font-bold">{coupon.code}</td>
                      <td>
                        {coupon.discountType === 'percentage' 
                          ? `${coupon.discount}%` 
                          : `₹${coupon.discount.toLocaleString()}`}
                      </td>
                      <td>₹{coupon.minOrderAmount?.toLocaleString()}</td>
                      <td>
                        {coupon.expiryDate 
                          ? new Date(coupon.expiryDate).toLocaleDateString() 
                          : 'Never'}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleStatus(coupon._id, coupon.isActive)}
                          className={`btn-status ${coupon.isActive ? 'active' : 'inactive'}`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="text-right">
                        <button 
                          className="btn-delete" 
                          onClick={() => deleteCoupon(coupon._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponPage;
