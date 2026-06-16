import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../components/BarcodeLabel.css';
import BarcodeLabel from '../../components/BarcodeLabel';
import './Inventory.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Demo products for when backend is not available
const demoProducts = [
  {
    id: '1', name: 'Noir Oversized Tee', sku: 'SYN-A1B2C3-XY12',
    stock: 12, price: 2999,
    barcodeId: '294857103948',
    images: ['https://via.placeholder.com/50']
  },
  {
    id: '2', name: 'Essential Hoodie', sku: 'SYN-D4E5F6-ZW34',
    stock: 8, price: 4999,
    barcodeId: '583920174629',
    images: ['https://via.placeholder.com/50']
  },
  {
    id: '3', name: 'Structured Blazer', sku: 'SYN-G7H8I9-AB56',
    stock: 2, price: 8999,
    barcodeId: '102938475610',
    images: ['https://via.placeholder.com/50']
  },
  {
    id: '4', name: 'Slim Cargo Pants', sku: 'SYN-J1K2L3-CD78',
    stock: 15, price: 3999,
    barcodeId: '746582019374',
    images: ['https://via.placeholder.com/50']
  },
];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barcodeProduct, setBarcodeProduct] = useState(null);
  const [updatingStock, setUpdatingStock] = useState(null);

  // Luxury Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempStock, setTempStock] = useState({});

  const openStockModal = (product) => {
    setSelectedProduct(product);
    const currentStock = product.stock || {};
    const stockObj = {};
    const sizesList = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
    sizesList.forEach(size => {
      stockObj[size] = currentStock[size] !== undefined ? currentStock[size] : 0;
    });
    setTempStock(stockObj);
    setIsModalOpen(true);
  };

  const handleStockUpdate = async () => {
    try {
      const pid = selectedProduct._id || selectedProduct.id;
      await axios.patch(`${API_URL}/products/update-stock/${pid}`, { stock: tempStock });
      alert("Stock updated successfully!");
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      // Demo fallback: update locally
      setProducts(prev => prev.map(p => {
        if ((p._id || p.id) === (selectedProduct._id || selectedProduct.id)) {
          return { ...p, stock: tempStock };
        }
        return p;
      }));
      alert("Stock updated successfully (offline mode)!");
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch {
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, change) => {
    setUpdatingStock(productId);
    try {
      await axios.patch(`${API_URL}/products/update-stock`, {
        productId,
        quantityChange: change,
      });
      await fetchProducts();
    } catch (err) {
      // For demo mode, update locally
      setProducts((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) === productId) {
            const newVal = Math.max(0, p.stock + change);
            return { ...p, stock: newVal };
          }
          return p;
        })
      );
    } finally {
      setUpdatingStock(null);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      await fetchProducts();
    } catch {
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    }
  };
  
  const toggleBestProduct = async (productId) => {
    try {
      await axios.patch(`${API_URL}/products/toggle-best/${productId}`);
      await fetchProducts();
    } catch (err) {
      // Demo mode fallback
      setProducts((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) === productId) {
            return { ...p, isBestProduct: !p.isBestProduct };
          }
          return p;
        })
      );
    }
  };

  return (
    <div className="admin-page">
      <main className="admin-main-content">
        <div className="admin-header">
          <div>
            <h1 className="admin-header__title">Inventory</h1>
            <p className="admin-header__subtitle">{products.length} Products</p>
          </div>
          <Link to="/admin/create" className="btn-luxury">
            + Create Product
          </Link>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="product-detail__loading-spinner"></div>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Image</th>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Total Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const pid = product._id || product.id;
                  const total = product.stock
                    ? (typeof product.stock === 'object'
                       ? Object.values(product.stock).reduce((a, b) => a + b, 0)
                       : Number(product.stock) || 0)
                    : 0;
                  let imageUrl = product.images?.[0] || 'https://via.placeholder.com/50';
                  if (imageUrl.startsWith('/uploads/')) {
                    imageUrl = `${API_URL.replace('/api', '')}${imageUrl}`;
                  }
                  return (
                    <tr key={pid}>
                      <td>
                        <img src={imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      </td>
                      <td>
                        <span className="admin-table__product-name">{product.name}</span>
                      </td>
                      <td>
                        <code className="admin-table__sku">{product.sku}</code>
                      </td>
                      <td>₹{product.price?.toLocaleString()}</td>
                      <td>
                        <button className="btn-manage-stock" onClick={() => openStockModal(product)}>
                          Manage Stock
                        </button>
                        <div className="stock-summary" style={{ fontSize: '11px', color: '#888', marginTop: '6px', textAlign: 'center' }}>
                          Total: {total} Pcs
                        </div>
                        {product.stock && typeof product.stock === 'object' && (
                          <div className="stock-detail-mini" style={{ marginTop: '6px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {Object.entries(product.stock).map(([size, qty]) => (
                              <span key={size} style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: qty > 0 ? 'var(--black)' : '#bbb' }}>
                                {size}: {qty}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="admin-table__actions">
                          <button
                            className="admin-table__action-btn"
                            onClick={() => setBarcodeProduct(product)}
                            title="Print Barcode"
                          >
                            ▦
                          </button>
                          <button
                            className={`admin-table__action-btn admin-table__action-btn--best ${product.isBestProduct ? 'active' : ''}`}
                            onClick={() => toggleBestProduct(pid)}
                            title={product.isBestProduct ? 'Featured as Best' : 'Mark as Best'}
                          >
                            {product.isBestProduct ? '★' : '☆'}
                          </button>
                          <button
                            className="admin-table__action-btn admin-table__action-btn--danger"
                            onClick={() => deleteProduct(pid)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {barcodeProduct && (
        <BarcodeLabel product={barcodeProduct} onClose={() => setBarcodeProduct(null)} />
      )}

      {/* LUXURY STOCK MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="stock-modal">
            <div className="modal-header">
              <h3 className="modal-title">UPDATE INVENTORY</h3>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="modal-body">
              <h2 className="product-display-name">{selectedProduct?.name}</h2>
              
              <div className="size-stock-grid">
                {Object.keys(tempStock).map(size => (
                  <div key={size} className="size-input-wrapper">
                    <label className="size-label">{size}</label>
                    <input 
                      type="number" 
                      className="size-input-field"
                      value={tempStock[size]} 
                      onChange={(e) => setTempStock({...tempStock, [size]: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>CANCEL</button>
              <button className="btn-modal-save" onClick={handleStockUpdate}>SAVE STOCK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
