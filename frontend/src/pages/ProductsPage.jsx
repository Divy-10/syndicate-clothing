import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import './ProductsPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ProductsPage = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(window.innerWidth > 768);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`);
        setAllProducts(res.data);
      } catch (err) {
        console.error('Error fetching all products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, []);

  // Extract unique categories dynamically
  const categories = ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean))];

  // Filter & Sort client-side for instant updates
  const filteredProducts = allProducts
    .filter(product => {
      const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchSearch = !searchQuery || 
                          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'a-to-z') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'z-to-a') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'price-low-to-high') {
        return a.price - b.price;
      }
      if (sortBy === 'price-high-to-low') {
        return b.price - a.price;
      }
      return 0;
    });

  return (
    <div className="products-page">
      <Navbar />
      
      <div className="products-container">
        <header className="products-header">
          <h1>ALL COLLECTIONS</h1>
          <p>Discover the complete range of Syndycate Luxury Wear</p>
        </header>

        {/* Controls Bar */}
        {!loading && allProducts.length > 0 && (
          <div className="collections-controls-container">
            <div className="controls-header-bar">
              <div className="search-bar-wrapper">
                <Search className="search-icon" size={16} />
                <input 
                  type="text" 
                  placeholder="Search collections..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <button 
                className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} />
                <span>Filter & Sort</span>
                {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            <div className={`filters-expandable-panel ${showFilters ? 'open' : ''}`}>
              <div className="filters-drawer-content">
                <div className="filter-group">
                  <label>Category</label>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Sort By</label>
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="default">Default</option>
                    <option value="a-to-z">Alphabetical (A to Z)</option>
                    <option value="z-to-a">Alphabetical (Z to A)</option>
                    <option value="price-low-to-high">Price: Low to High</option>
                    <option value="price-high-to-low">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <div className="product-detail__loading-spinner"></div>
          </div>
        ) : (
          <div className="all-products-section">
            {filteredProducts.length > 0 ? (
              <ProductGrid products={filteredProducts} isPageContext={true} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px', color: '#888' }}>
                <p>No products match your search or filter options.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductsPage;
