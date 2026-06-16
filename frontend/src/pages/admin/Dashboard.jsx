import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [exportDate, setExportDate] = useState({ 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear() 
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/dashboard-data`);
        setData(res.data);
      } catch (err) {
        console.error("Dashboard data error:", err);
      }
    };
    fetchDashboardData();
  }, []);

  // THE FIX: This effect runs every time the month or year changes
  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/admin/print-report?month=${exportDate.month}&year=${exportDate.year}`);
        setReportData(res.data);
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [exportDate]);

  if (!data) {
    return (
      <div className="loader-container">
        <div className="loader">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dash-title">DASHBOARD</h1>
          <p className="dash-subtitle">EL BRO SYNDICATE PERFORMANCE ANALYTICS</p>
        </div>
        
        {/* REMOVED PRINT BUTTON, KEPT INPUTS FOR FILTERING */}
        <div className="filter-tool">
          <div className="input-group">
            <label>MONTH</label>
            <input 
              type="number" 
              min="1"
              max="12"
              value={exportDate.month} 
              onChange={e => setExportDate({...exportDate, month: e.target.value})} 
            />
          </div>
          <div className="input-group">
            <label>YEAR</label>
            <input 
              type="number" 
              min="2020"
              max="2035"
              value={exportDate.year} 
              onChange={e => setExportDate({...exportDate, year: e.target.value})} 
            />
          </div>
        </div>
      </div>

      {/* VIEW REPORT SECTION */}
      <div className="report-container">
        <div className="report-header">
          <h2>MONTHLY SALES REPORT</h2>
          <p>PERIOD: {exportDate.month}/{exportDate.year} | BRAND: EL BRO SYNDICATE</p>
        </div>

        {loading ? (
          <div className="loading-text">Updating Records...</div>
        ) : (
          <table className="report-table">
            <thead>
              <tr>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>TOTAL</th>
                <th>STATUS</th>
                <th>DATE</th>
              </tr>
            </thead>
            <tbody>
              {reportData && reportData.length > 0 ? (
                reportData.map((row, i) => (
                  <tr key={i}>
                    <td className="id-cell">#{row.orderId ? row.orderId.substring(row.orderId.length - 8).toUpperCase() : ''}</td>
                    <td>{row.customer}</td>
                    <td>₹{row.total.toLocaleString()}</td>
                    <td><span className={`status-pill ${row.status.toLowerCase()}`}>{row.status}</span></td>
                    <td>{row.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">NO ORDERS FOUND FOR THIS PERIOD.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="label">Total Revenue</span>
          <h2>₹{data.overview.totalRev.toLocaleString()}</h2>
        </div>
        <div className="kpi-card">
          <span className="label">Monthly Revenue</span>
          <h2>₹{data.monthlyRevenue.toLocaleString()}</h2>
        </div>
        <div className="kpi-card">
          <span className="label">Total Orders</span>
          <h2>{data.overview.totalOrders}</h2>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="analytics-grid">
        <div className="analysis-box">
          <h3>TOP PRODUCTS</h3>
          {data.topProducts.length === 0 ? (
            <div className="no-data">No product sales logged.</div>
          ) : (
            data.topProducts.map((p, i) => (
              <div key={i} className="analysis-item">
                <span>{p._id}</span>
                <strong>{p.count} Sold</strong>
              </div>
            ))
          )}
        </div>
        <div className="analysis-box">
          <h3>REVENUE BY CATEGORY</h3>
          {data.categoryPerformance.length === 0 ? (
            <div className="no-data">No category revenue data available.</div>
          ) : (
            data.categoryPerformance.map((cat, i) => (
              <div key={i} className="analysis-item">
                <span>{cat._id}</span>
                <strong>₹{cat.revenue.toLocaleString()}</strong>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
