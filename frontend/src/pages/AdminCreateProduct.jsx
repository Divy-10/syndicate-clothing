import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BarcodeLabel from '../components/BarcodeLabel';
import { CloudUpload, X, CheckCircle } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import './AdminCreateProduct.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminCreateProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedProduct, setSavedProduct] = useState(null);
  const [showBarcode, setShowBarcode] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', sku: '', price: '', stock: '', category: '' 
  });
  const [sizes, setSizes] = useState(['S', 'M', 'L', 'XL']);
  const [stockData, setStockData] = useState({ S: 0, M: 0, L: 0, XL: 0 });
  const [newSize, setNewSize] = useState('');

  const addCustomSize = () => {
    if (!newSize) return;
    const formattedSize = newSize.toUpperCase().trim();
    if (!sizes.includes(formattedSize)) {
      setSizes([...sizes, formattedSize]);
      setStockData(prev => ({ ...prev, [formattedSize]: 0 }));
      setNewSize('');
    } else {
      alert("Size already exists!");
    }
  };

  const removeSize = (sizeToRemove) => {
    setSizes(prev => prev.filter(s => s !== sizeToRemove));
    setStockData(prev => {
      const copy = { ...prev };
      delete copy[sizeToRemove];
      return copy;
    });
  };

  const handleStockChange = (size, value) => {
    setStockData(prev => ({ ...prev, [size]: parseInt(value, 10) || 0 }));
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories/all`);
        setCategories(res.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true };
      const compressedFiles = [];
      const newPreviews = [];

      for (let file of files) {
        const compressedFile = await imageCompression(file, options);
        compressedFiles.push(compressedFile);
        newPreviews.push(URL.createObjectURL(compressedFile));
      }

      setImages(prev => [...prev, ...compressedFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error('Error compressing images', error);
    }
  };

  const handleRemoveImage = (index, e) => {
    e.stopPropagation();
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) { alert("Please upload at least one product image first!"); return; }
    if (!formData.category) { alert("Please select a category!"); return; }

    setSaving(true);
    
    const cleanedStock = {};
    Object.keys(stockData).forEach(size => {
      cleanedStock[size] = parseInt(stockData[size], 10) || 0;
    });

    const data = new FormData();
    // Single image for backward compatibility
    data.append('image', images[0]);
    // Multiple images
    images.forEach(img => {
      data.append('images', img);
    });

    Object.keys(formData).forEach(key => {
      if (key !== 'stock') {
        data.append(key, formData[key]);
      }
    });
    data.append('stock', JSON.stringify(cleanedStock));

    try {
      const res = await axios.post(`${API_URL}/products/add`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.status === 201 || res.status === 200) {
        setSavedProduct(res.data);
        alert("✅ Product Published Successfully!");
      }
    } catch (err) {
      console.error("Error publishing product:", err.response?.data || err.message);
      alert("❌ Error: " + (err.response?.data?.message || "Could not publish product"));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSavedProduct(null);
    setPreviews([]);
    setImages([]);
    setFormData({ name: '', sku: '', price: '', stock: '', category: '' });
    setSizes(['S', 'M', 'L', 'XL']);
    setStockData({ S: 0, M: 0, L: 0, XL: 0 });
    setNewSize('');
  };

  return (
    <div className="creator-page animate-fade-in">
      <div className="creator-header">
        <h1>CREATE NEW PRODUCT</h1>
        <p>Fill in the details to list your item in the online store</p>
      </div>

      {savedProduct ? (
        <div className="creator-success-overlay">
          <div className="creator-success-card">
            <div className="success-icon-badge">
              <CheckCircle size={60} />
            </div>
            <h2>PRODUCT PUBLISHED</h2>
            <p>Your item is now live in the collection.</p>
            <div className="success-info-box">
              <p>SKU: <strong>{savedProduct.sku}</strong></p>
              <p>Barcode: <strong>{savedProduct.barcodeId}</strong></p>
            </div>
            <div className="success-action-grid">
              <button className="btn-publish" onClick={() => setShowBarcode(true)}>Print Label</button>
              <button className="btn-discard" onClick={() => navigate('/admin/inventory')}>Inventory</button>
              <button className="btn-discard" onClick={resetForm}>Create Another</button>
            </div>
            {showBarcode && <BarcodeLabel product={savedProduct} onClose={() => setShowBarcode(false)} />}
          </div>
        </div>
      ) : (
        <form className="creator-form" onSubmit={handleSubmit}>
          <div className="creator-grid">
            
            {/* LEFT SIDE: DATA INPUTS */}
            <div className="inputs-column">
              
              <div className="form-section">
                <h3>GENERAL INFORMATION</h3>
                <div className="input-group">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Noir Oversized Tee" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>SKU / Barcode ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Auto-generated if left blank" 
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>CATEGORIZATION</h3>
                <div className="input-group">
                  <label>Product Category</label>
                  <select 
                    required 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h3>PRICING & SIZE-BASED INVENTORY</h3>
                <div className="input-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="2999" 
                    required
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                
                <div className="size-management-box">
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '15px' }}>
                    Stock by Size
                  </div>
                  <div className="add-size-row">
                    <input 
                      type="text" 
                      placeholder="Add Size (e.g. XXL)" 
                      value={newSize} 
                      onChange={e => setNewSize(e.target.value)} 
                    />
                    <button type="button" onClick={addCustomSize}>ADD SIZE</button>
                  </div>

                  <div className="size-stock-grid">
                    {sizes.map(size => (
                      <div key={size} className="size-card">
                        <div className="size-header">
                          <label>{size}</label>
                          <span className="remove-size" onClick={() => removeSize(size)}>✕</span>
                        </div>
                        <input 
                          type="number" 
                          placeholder="0" 
                          min="0"
                          value={stockData[size]}
                          onChange={e => handleStockChange(size, e.target.value)} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: IMAGE UPLOAD */}
            <div className="image-column">
              <div className="form-section">
                <h3>PRODUCT IMAGERY</h3>
                <div className="upload-zone" onClick={() => fileInputRef.current.click()}>
                  <div className="upload-icon">☁️</div>
                  <p>Click to Upload Product Images</p>
                  <span className="recommendation">Recommended: 1000x1000px, White background (You can select multiple)</span>
                  <input 
                    type="file" 
                    className="file-input" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    hidden
                  />
                </div>

                {previews.length > 0 && (
                  <div className="previews-grid" style={{ marginTop: '20px' }}>
                    {previews.map((prev, idx) => (
                      <div key={idx} className="preview-item">
                        <img src={prev} alt={`Preview ${idx + 1}`} />
                        <button type="button" className="remove-preview-btn" onClick={(e) => handleRemoveImage(idx, e)}>
                          <X size={14} />
                        </button>
                        {idx === 0 && <span className="main-badge">Cover</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="creator-footer">
            <button type="button" className="btn-discard" onClick={() => navigate('/admin/inventory')}>Discard</button>
            <button type="submit" className="btn-publish" disabled={saving}>
              {saving ? 'Publishing...' : 'Publish Product'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminCreateProduct;
