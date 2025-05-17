'use client';

import { Suspense, useState, useEffect } from 'react';
import ProductSkeleton from '../components/shop/ProductSkeleton';
import Link from 'next/link';
import './products.css';
import ShopSidebar from '../components/ShopSidebar';
import AllProducts from '../components/shop/AllProducts';

export default function Shop() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false); // Initial state, will be updated client-side

  // Effect to determine if the screen is mobile-sized
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileScreen(window.innerWidth < 900);
    };

    // Check on initial mount (client-side)
    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  // Effect to handle closing mobile nav when resizing from mobile to desktop
  useEffect(() => {
    // If the screen is no longer considered mobile (i.e., resized to be wider)
    // AND the mobile navigation was open, then close it.
    if (!isMobileScreen && isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  }, [isMobileScreen, isMobileNavOpen]); // Runs when isMobileScreen or isMobileNavOpen changes

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '1rem', // Adjusted margin for button
        color: '#333'
      }}>
        Shop All
      </h1>

      {isMobileScreen && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setIsMobileNavOpen(true)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              fontWeight: '500',
              color: '#fff',
              backgroundColor: '#9CB24D', // Using theme color
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {/* Icon can be added here later e.g. <FiFilter /> */}
            Filters
          </button>
        </div>
      )}
      
      {/* Conditionally render ShopSidebar for mobile outside the grid */}
      {isMobileScreen && (
        <ShopSidebar 
          isMobileMode={true} 
          isOpen={isMobileNavOpen} 
          onClose={() => setIsMobileNavOpen(false)} 
          // currentSlug and isCategoryPage might need to be dynamic if you navigate within mobile filters
          // For now, assuming they are not critical for the mobile shell itself or can use defaults
        />
      )}

      {/* Main content with sidebar (conditionally shown in grid) */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: isMobileScreen ? '1fr' : '250px 1fr', // Dynamic grid layout
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Sidebar for Desktop */}
        {!isMobileScreen && (
          <Suspense fallback={
            <div style={{ 
              width: '250px',
              height: '400px',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }} />
          }>
            <ShopSidebar /> {/* Desktop sidebar, no mobile props needed or default to false */}
          </Suspense>
        )}
        
        {/* Products grid with React Query */}
        <AllProducts />
      </div>
    </div>
  );
} 