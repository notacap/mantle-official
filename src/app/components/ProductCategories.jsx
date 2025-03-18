"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import ButtonWithHover from './ButtonWithHover';
import Link from 'next/link';

export default function ProductCategories() {
  // Hover state for each category
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const collections = [
    {
      title: 'Rain Collection',
      description: 'Waterproof, sustainable outerwear for all weather conditions.',
      image: '/images/DSCF4744-scaled-e1608145214695.jpg',
      tag: 'rain-collection'
    },
    {
      title: 'The Range Collection',
      description: 'Versatile, eco-friendly apparel for everyday adventures.',
      image: '/images/DSCF4564-scaled.jpg',
      tag: 'range-collection'
    },
    {
      title: 'Accessories',
      description: 'Sustainable accessories to complete your look.',
      image: '/images/DSCF6361-scaled.jpg',
      tag: 'accessories'
    }
  ];

  return (
    <section style={{ backgroundColor: 'white', padding: '4rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2.5rem' }}>
          Explore Our Collections
        </h2>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {collections.map((collection, index) => (
            <div key={index} style={{ 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <Link href={`/collections/${collection.tag}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  position: 'relative',
                  height: '300px',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                  backgroundColor: '#f3f4f6'
                }}>
                  <img
                    src={collection.image}
                    alt={collection.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  />
                </div>
              </Link>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '500', marginBottom: '0.75rem' }}>
                {collection.title}
              </h3>
              
              <p style={{ color: '#4b5563', marginBottom: '1.5rem', flex: '1' }}>
                {collection.description}
              </p>
              
              {/* <div style={{ marginTop: 'auto' }}>
                <ButtonWithHover href={`/collections/${collection.tag}`}>
                  Shop {collection.title}
                </ButtonWithHover>
              </div> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Extracted category card component for reuse
function CategoryCard({ category, isHovered, onMouseEnter, onMouseLeave, height = 'auto', alwaysShowButton = false }) {
  return (
    <div 
      style={{ 
        position: 'relative',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        height: height,
        width: '100%',
        boxSizing: 'border-box'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        boxSizing: 'border-box'
      }}>
        <Image
          src={category.image}
          alt={category.name}
          fill
          style={{ 
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={category.id === 'rain' || category.id === 'range'}
        />
        
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          transition: 'background-color 0.3s ease',
          backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.4)',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          }}>
            {category.name}
          </h3>
          
          <div style={{
            opacity: isHovered || alwaysShowButton ? 1 : 0,
            transform: isHovered || alwaysShowButton ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            <ButtonWithHover href={category.link} variant="filled">
              Explore
            </ButtonWithHover>
          </div>
        </div>
      </div>
    </div>
  );
} 