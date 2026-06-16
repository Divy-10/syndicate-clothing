import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Barcode from 'react-barcode';
import './BarcodeCenter.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BarcodeCenter = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all products from your Node.js backend
    axios.get(`${API_URL}/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  }, []);

  const handlePrintAll = () => {
    window.print(); // This triggers the browser print dialog
  };

  const printSingleBarcode = (product) => {
    const printWindow = window.open('', '_blank', 'width=400,height=400');
    printWindow.document.write(`
      <html>
        <head>
          <title>Printing Barcode - ${product.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .label-container { text-align: center; border: 1px solid #000; padding: 20px; width: 300px; }
            .brand { font-size: 10px; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px; text-transform: uppercase; }
            .details { display: flex; justify-content: space-between; font-size: 12px; margin-top: 10px; font-weight: bold; border-top: 1px dashed #ccc; padding-top: 10px; }
            #barcode-element { display: block; margin: 0 auto; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="brand">EL BRO SYNDICATE</div>
            <svg id="barcode-element"></svg>
            <div class="details">
              <span>${product.name}</span>
              <span>₹${product.price?.toLocaleString()}</span>
            </div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
          <script>
            JsBarcode("#barcode-element", "${product.sku || product._id}", {
              format: "CODE128", width: 2, height: 50, displayValue: true, fontSize: 14
            });
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="barcode-page">
      {/* The 'no-print' class hides this section when printing */}
      <div className="no-print header-section">
        <h1>Barcode Center</h1>
        <p>Manage and print all product labels for your shop</p>
        <div className="barcode-actions">
          <input 
            type="text" 
            placeholder="Search SKU or Name..." 
            className="barcode-search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handlePrintAll} className="btn-print-all">
            🖨️ Print All Labels
          </button>
        </div>
      </div>

      {/* This is the area that will be printed */}
      <div className="barcode-print-area">
        {filteredProducts.map(product => (
          <div 
            key={product._id} 
            className="barcode-label" 
            onClick={() => printSingleBarcode(product)}
          >
            <div className="brand-header">EL BRO SYNDICATE</div>
            
            <div className="barcode-container">
              <Barcode 
                value={product.sku || product._id} 
                width={1.2} 
                height={40} 
                fontSize={12}
                background="transparent"
              />
            </div>
            
            <div className="product-footer">
              <span className="p-name">{product.name}</span>
              <span className="p-price">₹{product.price?.toLocaleString()}</span>
            </div>
            <div className="no-print print-hint">Click to Print Single</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarcodeCenter;
