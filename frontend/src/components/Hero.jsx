import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Hero.css';

export default function Hero() {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      easing: 'ease-out-cubic'
    });
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-background-wrapper">
        <img
          src="/assets/images/luxury-shop1.png"
          alt="Luxury Fashion Editorial"
          className="hero-bg-img"
        />
        <div className="hero-dark-overlay"></div>
      </div>

      <div className="hero-container container">
        <div className="text-content" data-aos="fade-up">
          <span className="collection-label">NEW COLLECTION 2026</span>
          <h1 className="main-heading">
            LUXURY FASHION <br />
            <span className="heading-emphasized">REDEFINED</span>
          </h1>
          <p className="sub-text">
            Impeccable silhouettes designed for the modern avant-garde wardrobe. 
            Experience true minimalism and uncompromising craftsmanship.
          </p>
          <div className="cta-wrapper">
            <Link to="/products" className="explore-btn">
              DISCOVER NOW
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM: SCROLL INDICATOR */}
      <div className="scroll-footer">
        <div className="scroll-line"></div>
        <span className="scroll-text">SCROLL</span>
      </div>
    </section>
  );
}
