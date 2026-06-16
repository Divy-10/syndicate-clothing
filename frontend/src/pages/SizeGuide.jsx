import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SizeGuideTable from '../components/SizeGuideTable';
import './SizeGuide.css';

export default function SizeGuide() {
  return (
    <div className="size-guide-page">
      <Navbar />

      <div className="size-guide-container">
        {/* HERO SECTION */}
        <header className="size-guide-header">
          <h1>SIZE GUIDE</h1>
          <div className="size-guide-divider"></div>
          <p className="size-guide-subtitle">FIND YOUR PERFECT SILHOUETTE</p>
        </header>

        {/* CONTENT */}
        <div className="size-guide-content">
          <div className="size-guide-card">
            <h2>MEN'S CLOTHING SIZE CHART</h2>
            <p className="intro-text">
              Our silhouettes are crafted with modern streetwear proportions, featuring relaxed, oversized cuts.
              Use the chart below to determine the best fit for your body measurements.
            </p>
            <SizeGuideTable />
          </div>

          <div className="measuring-tips-card">
            <h3>HOW TO MEASURE</h3>
            <div className="tips-grid">
              <div className="tip-item">
                <h4>1. CHEST</h4>
                <p>Measure around the fullest part of your chest, keeping the measuring tape horizontal and snug but not tight.</p>
              </div>
              <div className="tip-item">
                <h4>2. WAIST</h4>
                <p>Measure around your natural waistline (where you normally wear your trousers or cargos), keeping the tape slightly loose.</p>
              </div>
              <div className="tip-item">
                <h4>3. SHOULDERS</h4>
                <p>Measure from the outer edge of one shoulder bone across the back to the outer edge of the other shoulder bone.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
