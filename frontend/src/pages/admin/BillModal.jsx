import React from 'react';
import './BillModal.css';

const BillModal = ({ data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content no-print">
        <div className="modal-success-icon">✓</div>
        <h3>Order Successful!</h3>
        <p>The stock has been updated. Click below to print the customer receipt.</p>
        <div className="modal-actions">
          <button onClick={handlePrint} className="btn-print-bill">Print Receipt</button>
          <button onClick={onClose} className="btn-close">New Sale</button>
        </div>
      </div>

      {/* THE ACTUAL BILL - Only visible to printer */}
      <div className="printable-bill">
        <div className="bill-header">
          <h1>EL BRO SYNDICATE</h1>
          <p>Luxury Streetwear & Essentials</p>
          <div className="bill-meta">
            <p>Date: {data.date}</p>
            <p>Order ID: {data.orderId}</p>
          </div>
        </div>
        
        <div className="bill-divider">--------------------------------</div>
        
        <div className="bill-items">
          <div className="bill-row bill-row--header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
          </div>
          {data.items.map(item => (
            <div key={item._id} className="bill-row">
              <span>{item.name}</span>
              <span>{item.qty}</span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="bill-divider">--------------------------------</div>
        
        <div className="bill-total">
          <strong>TOTAL: ${data.total.toFixed(2)}</strong>
        </div>
        
        <div className="bill-footer">
          <p>Thank you for shopping with El Bro Syndicate!</p>
          <p>Visit us at www.syndycate.com</p>
          <p>All sales are final.</p>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
