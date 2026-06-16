import React, { useEffect } from 'react';
import './About.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  useEffect(() => {
    AOS.init({ 
      duration: 1200,
      once: true,
      easing: 'ease-in-out'
    });
  }, []);

  return (
    <div className="about-luxury-wrapper">
      <Navbar />

      {/* HERO SECTION: Immersive Shop Background */}
      <div className="about-hero-section">
        <div 
          className="hero-image-overlay" 
          style={{backgroundImage: `url('/assets/images/luxury-shop.png')`}}
        >
          <div className="hero-text-box" data-aos="zoom-in">
            <h1>EL BRO SYNDICATE</h1>
            <p className="hero-tagline">THE PINNACLE OF GLOBAL SARTORIAL EXCELLENCE</p>
          </div>
        </div>
      </div>

      {/* THE STORY SECTION */}
      <div className="about-story-container">
        <div className="story-content" data-aos="fade-up">
          <h2 className="section-subtitle">OUR PHILOSOPHY</h2>
          <p className="main-story">
            Born from a desire to bridge the gap between global luxury and urban sophistication, 
            <span className="highlight"> El Bro Syndicate</span> is not merely a store—it is a curated 
            archive of the world's most prestigious foreign labels.
          </p>
          <p className="sub-story">
            We traverse the ateliers of Paris, the streets of Milan, and the design hubs of Tokyo 
            to bring you garments that define status. Every piece in our collection is chosen 
            for its craftsmanship, its rarity, and its timeless appeal.
          </p>
        </div>

        <div className="brand-pillars">
          <div className="pillar" data-aos="fade-up" data-aos-delay="100">
            <h4>CURATED</h4>
            <p>Hand-selected foreign brands from the world's fashion capitals.</p>
          </div>
          <div className="pillar" data-aos="fade-up" data-aos-delay="200">
            <h4>EXCLUSIVE</h4>
            <p>Limited drops and rare finds for the discerning collector.</p>
          </div>
          <div className="pillar" data-aos="fade-up" data-aos-delay="300">
            <h4>PREMIUM</h4>
            <p>Uncompromising quality in every stitch and fabric.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
