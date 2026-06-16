import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import RunwayLookbook from '../components/RunwayLookbook';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/best`);
        setProducts(res.data);
      } catch (err) {
        console.log('Error fetching best products');
      }
    };
    fetchProducts();

    // Listen for real-time stock updates
    const socket = io(API_URL.replace('/api', ''));
    socket.on('stockUpdate', (updatedData) => {
      setProducts((prev) => prev.map((p) => {
        if (p._id === updatedData.productId) {
          return {
            ...p,
            stock: updatedData.stock
          };
        }
        return p;
      }));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="page-home">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Runway Depth Lookbook Section */}
      <RunwayLookbook />



      {/* Alternating Editorial Sections */}
      <section className="home-editorial-section">
        <div className="container">
          {/* Section 1: Image Left, Text Right */}
          <div className="editorial-row">
            <div className="editorial-image-col">
              <div className="editorial-image-frame">
                <img src="/assets/images/luxury-shop1.png" alt="Craftsmanship" />
              </div>
            </div>
            <div className="editorial-text-col">
              <span className="editorial-tag">THE CRAFT</span>
              <h2>UNCOMPROMISING SILHOUETTES</h2>
              <p>
                Every garment is a testament to rigorous craftsmanship and minimalist geometry. 
                Constructed with certified organic materials and heavy cotton weaves, designed 
                to maintain form and timeless presence.
              </p>
              <Link to="/about" className="btn-luxury">READ THE JOURNAL</Link>
            </div>
          </div>

          {/* Section 2: Text Left, Image Right */}
          <div className="editorial-row editorial-row--reverse">
            <div className="editorial-image-col">
              <div className="editorial-image-frame">
                <img src="/assets/images/model-silk-shirt.jpg" alt="Philosophy" />
              </div>
            </div>
            <div className="editorial-text-col">
              <span className="editorial-tag">THE VISION</span>
              <h2>ARCHITECTURAL COUTURE</h2>
              <p>
                Our philosophy rejects the transient cycles of fashion. Instead, we offer 
                permanent wardrobe staples that align structure, shadow, and minimal aesthetics. 
                Tailored for the select few.
              </p>
              <Link to="/products" className="btn-luxury">VIEW COLLECTIONS</Link>
            </div>
          </div>
        </div>
      </section>



      {/* Brand Statement - Exclusivity */}
      <section className="home-philosophy">
        <span className="home-philosophy-label">THE STATEMENT</span>
        <h2 className="home-exclusivity-statement">
          "WE BELIEVE IN UNCOMPROMISING EXCLUSIVITY — DESIGNING ARCHITECTURAL SILHOUETTES CURATED SOLELY FOR THE FEW WHO UNDERSTAND TRUE NOIR MINIMALISM."
        </h2>
      </section>

      <Footer />
    </div>
  );
}
