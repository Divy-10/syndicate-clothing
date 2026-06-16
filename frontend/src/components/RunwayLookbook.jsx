import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, ArrowRight } from 'lucide-react';
import './RunwayLookbook.css';

// Looks config linking directly to actual seeded DB products
const LOOKS = [
  {
    lookNumber: 'LOOK 01',
    season: 'SPRING SUMMER 2026',
    modelImage: '/assets/images/luxury-shop.png',
    desc: 'An elegant column silhouette crafted from a luxurious blend of organic mulberry silk and fine wool. Featuring a subtle drape neck and structured long sleeves designed to command timeless presence.',
    products: [
      {
        id: '6a256fe73c3b1f19df86244f',
        name: 'Mélange Silk Knit Dress',
        price: 18999,
        image: '/assets/images/luxury-shop.png'
      },
      {
        id: '6a256fe73c3b1f19df862455',
        name: 'Suede Editorial Envelope Bag',
        price: 24999,
        image: '/assets/images/luxury-shop1.png'
      }
    ]
  },
  {
    lookNumber: 'LOOK 02',
    season: 'SPRING SUMMER 2026',
    modelImage: '/assets/images/model-silk-shirt.jpg',
    desc: 'A premium heavy silk shirt tailored for a relaxed drop-shoulder drape, contrasted with architectural wide-leg trousers. Embellished with hidden mother-of-pearl buttons and deep utility patch pockets.',
    products: [
      {
        id: '6a256fe73c3b1f19df862452',
        name: 'Onyx Silk Utility Shirt',
        price: 14999,
        image: '/assets/images/model-silk-shirt.jpg'
      },
      {
        id: '6a256fe73c3b1f19df862455',
        name: 'Suede Editorial Envelope Bag',
        price: 24999,
        image: '/assets/images/luxury-shop1.png'
      }
    ]
  },
  {
    lookNumber: 'LOOK 03',
    season: 'SPRING SUMMER 2026',
    modelImage: '/assets/images/luxury-shop1.png',
    desc: 'A sculptural, minimalist envelope handbag crafted from rich Italian split-suede leather. Styled alongside permanent wardrobe staples that emphasize sharp raw edge geometry and muted noir accents.',
    products: [
      {
        id: '6a256fe73c3b1f19df862455',
        name: 'Suede Editorial Envelope Bag',
        price: 24999,
        image: '/assets/images/luxury-shop1.png'
      },
      {
        id: '6a256fe73c3b1f19df862452',
        name: 'Onyx Silk Utility Shirt',
        price: 14999,
        image: '/assets/images/model-silk-shirt.jpg'
      }
    ]
  }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace('/api', '');

export default function RunwayLookbook() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const autoPlayRef = useRef(null);
  const [dbProducts, setDbProducts] = useState([]);

  // Fetch products from the backend database (only best sellers)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products/best`);
        if (response.ok) {
          const data = await response.json();
          setDbProducts(data);
        }
      } catch (error) {
        console.error('Error fetching database products for lookbook:', error);
      }
    };
    fetchProducts();
  }, []);

  // Dynamically generate looks from database products
  const runwayLooks = dbProducts.map((prod, index) => {
    let prodImage = prod.images?.[0] || prod.image || '/assets/images/luxury-shop.png';
    if (prodImage && prodImage.startsWith('/uploads/')) {
      prodImage = `${BASE_URL}${prodImage}`;
    }

    const defaultDescriptions = [
      'An elegant architectural silhouette constructed with premium materials. Structured cuts designed to maintain form and timeless presence.',
      'A masterclass in modern minimalism, blending drape and structure. Tailored for comfort and uncompromising style.',
      'Refined geometry and texture alignment define this signature piece. A permanent addition to the minimal wardrobe.'
    ];
    const desc = prod.description || defaultDescriptions[index % defaultDescriptions.length];

    const sidebarProducts = [prod];
    // Include styled products if any, otherwise recommend other products
    if (prod.styleWith && prod.styleWith.length > 0) {
      prod.styleWith.forEach(styled => {
        if (styled) sidebarProducts.push(styled);
      });
    } else {
      const otherProds = dbProducts.filter(p => (p._id || p.id) !== (prod._id || prod.id));
      if (otherProds.length > 0) {
        sidebarProducts.push(otherProds[0]);
      }
      if (otherProds.length > 1) {
        sidebarProducts.push(otherProds[1]);
      }
    }

    return {
      lookNumber: `LOOK 0${index + 1}`,
      season: prod.category ? prod.category.toUpperCase() : 'EDITORIAL SELECTION',
      modelImage: prodImage,
      desc: desc,
      products: sidebarProducts
    };
  });

  const activeLooks = runwayLooks.length > 0 ? runwayLooks : LOOKS;
  const currentActiveIndex = activeIndex >= activeLooks.length ? 0 : activeIndex;

  const looksLengthRef = useRef(activeLooks.length);
  looksLengthRef.current = activeLooks.length;

  // Restart auto-play interval
  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % looksLengthRef.current);
    }, 7000);
  };

  useEffect(() => {
    resetAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [dbProducts]);

  const handlePrev = () => {
    resetAutoPlay();
    setActiveIndex((prev) => (prev === 0 ? looksLengthRef.current - 1 : prev - 1));
  };

  const handleNext = () => {
    resetAutoPlay();
    setActiveIndex((prev) => (prev + 1) % looksLengthRef.current);
  };

  // Drag Gesture Handlers
  const handleStart = (clientX) => {
    setIsDragging(true);
    startX.current = clientX;
    setDragOffset(0);
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const dx = clientX - startX.current;
    setDragOffset(dx);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragOffset < -100) {
      handleNext();
    } else if (dragOffset > 100) {
      handlePrev();
    }
    setDragOffset(0);
  };

  return (
    <section className="runway-lookbook">
      <div className="runway-lookbook__container container">
        
        {/* Left Column: Editorial Info */}
        <div className="runway-lookbook__editorial-panel">
          <div className="editorial-meta-box">
            <span className="editorial-eyebrow">EDITORIAL ARCHIVE</span>
            <div className="editorial-season-fade" key={`season-${currentActiveIndex}`}>
              <span className="editorial-season">{activeLooks[currentActiveIndex].season}</span>
            </div>
            
            <div className="editorial-desc-fade" key={`desc-${currentActiveIndex}`}>
              <p className="editorial-description">{activeLooks[currentActiveIndex].desc}</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="editorial-navigation">
            <button 
              className="nav-btn nav-btn--prev" 
              onClick={handlePrev}
              aria-label="Previous Look"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="nav-index-indicator">
              <span className="current-index">{activeLooks[currentActiveIndex].lookNumber.replace('LOOK ', '')}</span>
              <span className="index-separator">/</span>
              <span className="total-index">{`0${activeLooks.length}`}</span>
            </div>

            <button 
              className="nav-btn nav-btn--next" 
              onClick={handleNext}
              aria-label="Next Look"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="editorial-scroll-track">
            <div 
              className="editorial-scroll-bar" 
              style={{ width: `${((currentActiveIndex + 1) / activeLooks.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Center Column: 3D Depth-of-Field Runway Area */}
        <div 
          className="runway-lookbook__runway-area"
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseMove={(e) => handleMove(e.clientX)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
        >
          {activeLooks.map((look, i) => {
            const diff = i - currentActiveIndex;
            const absDiff = Math.abs(diff);
            
            let style = {};
            if (diff === 0) {
              style = {
                '--diff': 0,
                '--abs-diff': 0,
                transform: `translate3d(${dragOffset}px, 0, 0) scale(1)`,
                opacity: 1,
                zIndex: 10,
                filter: 'blur(0px)'
              };
            } else if (diff < 0) {
              const dragMod = isDragging ? (dragOffset / 1200) : 0;
              const newDiff = diff + dragMod;
              const newAbsDiff = Math.abs(newDiff);
              
              style = {
                '--diff': newDiff,
                '--abs-diff': newAbsDiff,
                transform: `translate3d(calc(${newDiff} * var(--translate-step-prev) + ${dragOffset * 0.4}px), calc(${newAbsDiff} * var(--translate-y-step)), 0) scale(${Math.max(0.6, 1 - newAbsDiff * 0.12)})`,
                opacity: Math.max(0.1, 1 - newAbsDiff * 0.35),
                zIndex: 10 - Math.ceil(newAbsDiff),
                filter: `blur(${newAbsDiff * 4.5}px)`
              };
            } else {
              const dragMod = isDragging ? (dragOffset / 1200) : 0;
              const newDiff = diff + dragMod;
              const newAbsDiff = Math.abs(newDiff);
              
              style = {
                '--diff': newDiff,
                '--abs-diff': newAbsDiff,
                transform: `translate3d(calc(${newDiff} * var(--translate-step-next) + ${dragOffset * 0.4}px), 0, 0) scale(${Math.max(0.6, 1 - newAbsDiff * 0.12)})`,
                opacity: Math.max(0, 1 - newAbsDiff),
                zIndex: 10 - Math.ceil(newAbsDiff),
                filter: `blur(${newAbsDiff * 4.5}px)`,
                pointerEvents: 'none'
              };
            }

            return (
              <div 
                key={i}
                className={`runway-model-wrapper ${diff === 0 ? 'runway-model-wrapper--active' : ''}`}
                style={style}
              >
                <img 
                  src={look.modelImage} 
                  alt={look.lookNumber} 
                  className="runway-model-image"
                  draggable="false"
                />
                
                {diff === 0 && (
                  <div className="runway-model-label">
                    <span className="runway-label-tag">{look.lookNumber}</span>
                  </div>
                )}
              </div>
            );
          })}

          <div className="runway-drag-hint">
            <span className="drag-hint-pill"></span>
            <span className="drag-hint-text">DRAG TO EXPLORE</span>
          </div>
        </div>

        {/* Right Column: Look Products Sidebar */}
        <div className="runway-lookbook__sidebar-panel" key={`products-${currentActiveIndex}`}>
          <span className="sidebar-title">LOOK PIECES</span>
          
          <div className="sidebar-product-list">
            {activeLooks[currentActiveIndex].products.map((prod) => {
              const prodId = prod._id || prod.id;
              let displayImage = prod.images?.[0] || prod.image;
              if (displayImage && displayImage.startsWith('/uploads/')) {
                displayImage = `${BASE_URL}${displayImage}`;
              }
              return (
                <Link to={`/product/${prodId}`} key={prodId} className="sidebar-product-card">
                  <div className="sidebar-prod-img-box">
                    {displayImage ? (
                      <img src={displayImage} alt={prod.name} />
                    ) : (
                      <div className="sidebar-prod-placeholder">
                        <span>{prod.name?.charAt(0) || 'S'}</span>
                      </div>
                    )}
                    <div className="sidebar-prod-overlay">
                      <ArrowRight size={16} className="sidebar-arrow-icon" />
                    </div>
                  </div>
                  
                  <div className="sidebar-prod-info">
                    <h4 className="sidebar-prod-name">{prod.name}</h4>
                    <p className="sidebar-prod-price">₹{prod.price ? prod.price.toLocaleString() : '0'}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="sidebar-cta-box">
            <Link to="/products" className="sidebar-shop-all">
              <span>EXPLORE ALL COLLECTIONS</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
