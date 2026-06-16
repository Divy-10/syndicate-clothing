import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './POSScreen.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function POS() {
  const { user, logout } = useAuth();
  const [barcode, setBarcode] = useState('');
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const scannerRef = useRef(null);

  // Keep focus on the barcode input for scanners
  useEffect(() => {
    if (scannerRef.current) {
      scannerRef.current.focus();
    }
  }, [cart, pendingProduct]);

  const handleScan = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!barcode.trim()) return;

    try {
      const res = await axios.get(`${API_URL}/products`);
      const product = res.data.find(p => p.barcodeId === barcode || p.sku === barcode || p._id === barcode);

      if (!product) {
        setError('Product not found!');
        setBarcode('');
        return;
      }

      setPendingProduct(product);
      setBarcode('');
    } catch (err) {
      setError('Error looking up product.');
    }
  };

  const addToCartWithSize = (selectedSize) => {
    const product = pendingProduct;
    if (!product) return;

    let sizeStock = 0;
    const currentStock = product.stock;
    if (currentStock) {
      // Handle both Mongoose Map and regular object keys
      if (typeof currentStock.get === 'function') {
        sizeStock = currentStock.get(selectedSize) || 0;
      } else {
        sizeStock = currentStock[selectedSize] || 0;
      }
    }

    if (sizeStock <= 0) {
      setError(`Size ${selectedSize} is Out of Stock!`);
      setPendingProduct(null);
      return;
    }

    const existing = cart.find(item => item._id === product._id && item.selectedSize === selectedSize);
    if (existing) {
      if (existing.quantity >= sizeStock) {
        setError('Not enough stock!');
      } else {
        setCart(cart.map(item =>
          (item._id === product._id && item.selectedSize === selectedSize)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, selectedSize, quantity: 1, maxSizeStock: sizeStock }]);
    }
    setPendingProduct(null);
  };

  const updateQuantity = (id, selectedSize, change) => {
    setCart(cart.map(item => {
      if (item._id === id && item.selectedSize === selectedSize) {
        const newQty = item.quantity + change;
        const limit = item.maxSizeStock || 999;
        if (newQty > limit) {
          setError(`Only ${limit} available.`);
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const removeItem = (id, selectedSize) => {
    setCart(cart.filter(item => !(item._id === id && item.selectedSize === selectedSize)));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const completeSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      for (const item of cart) {
        await axios.post(`${API_URL}/sales/checkout`, {
          productId: item._id,
          quantity: item.quantity,
          size: item.selectedSize
        });
      }

      setSuccess('Sale completed successfully!');
      setCart([]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error completing sale');
    } finally {
      setLoading(false);
      if (scannerRef.current) scannerRef.current.focus();
    }
  };

  return (
    <div className="pos-layout">
      {/* Main POS Interface */}
      <div className="pos-main">
        {/* Left Side: Scanner */}
        <div className="pos-scanner-section">
          <h1>Barcode Scanner</h1>
          <p>Scan a product barcode or enter SKU/ID manually.</p>

          <form onSubmit={handleScan} className="pos-scanner-form">
            <input
              ref={scannerRef}
              type="text"
              className="pos-scanner-input"
              placeholder="Waiting for scanner..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              autoFocus
            />
            <button type="submit" className="pos-scanner-btn">Add</button>
          </form>

          {error && <div className="pos-alert pos-alert--error">{error}</div>}
          {success && <div className="pos-alert pos-alert--success">{success}</div>}
        </div>

        {/* Right Side: Cart */}
        <div className="pos-cart-section">
          <h2>Current Sale</h2>

          <div className="pos-cart-items">
            {cart.length === 0 ? (
              <div className="pos-cart-empty">Cart is empty. Scan an item to begin.</div>
            ) : (
              cart.map((item, index) => (
                <div key={`${item._id}-${item.selectedSize}-${index}`} className="pos-cart-item">
                  <div className="pos-cart-item__info">
                    <span className="pos-cart-item__name">
                      {item.name} <strong style={{ color: '#000', marginLeft: '5px' }}>({item.selectedSize})</strong>
                    </span>
                    <span className="pos-cart-item__sku">{item.sku}</span>
                  </div>
                  <div className="pos-cart-item__price">₹{(item.price * item.quantity).toLocaleString()}</div>
                  <div className="pos-cart-item__controls">
                    <button onClick={() => updateQuantity(item._id, item.selectedSize, -1)} className="pos-cart-btn">-</button>
                    <span className="pos-cart-qty">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.selectedSize, 1)} className="pos-cart-btn">+</button>
                    <button onClick={() => removeItem(item._id, item.selectedSize)} className="pos-cart-btn pos-cart-btn--remove">✕</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pos-cart-summary">
            <div className="pos-cart-total">
              <span>Total:</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <button
              className="pos-checkout-btn"
              onClick={completeSale}
              disabled={cart.length === 0 || loading}
            >
              {loading ? 'PROCESSING...' : 'COMPLETE SALE'}
            </button>
          </div>
        </div>
      </div>

      {/* Size Selection Overlay Modal */}
      {pendingProduct && (
        <div className="size-modal-overlay">
          <div className="size-modal">
            <h3>SELECT SIZE</h3>
            <p className="size-modal-prodname">{pendingProduct.name}</p>
            <div className="size-options">
              {['S', 'M', 'L', 'XL'].map(size => {
                let sizeStock = 0;
                const currentStock = pendingProduct.stock;
                if (currentStock) {
                  if (typeof currentStock.get === 'function') {
                    sizeStock = currentStock.get(size) || 0;
                  } else {
                    sizeStock = currentStock[size] || 0;
                  }
                }
                return (
                  <button 
                    key={size} 
                    className={`size-btn-opt ${sizeStock <= 0 ? 'disabled' : ''}`}
                    disabled={sizeStock <= 0}
                    onClick={() => addToCartWithSize(size)}
                  >
                    <span className="size-letter">{size}</span>
                    <span className="size-stock-tag">{sizeStock > 0 ? `${sizeStock} Pcs` : 'OUT'}</span>
                  </button>
                );
              })}
            </div>
            <button className="size-modal-close" onClick={() => setPendingProduct(null)}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}
