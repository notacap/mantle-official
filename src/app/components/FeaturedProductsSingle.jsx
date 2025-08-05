"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { formatPrice, getProductImageUrl, getProductSecondaryImageUrl } from '../services/woocommerce';
import StarRating from './shop/StarRating';

export default function FeaturedProductsSingle({ product }) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const stripHtml = (html) => {
    if (typeof window === 'undefined') {
      return html?.replace(/<[^>]*>?/gm, '') || '';
    }
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body.textContent || '';
  };

  const getShortDescription = (product) => {
    if (product.short_description) {
      const text = stripHtml(product.short_description);
      return text.substring(0, 250) + (text.length > 250 ? '...' : '');
    }
    
    if (product.description) {
      const text = stripHtml(product.description);
      return text.substring(0, 250) + (text.length > 250 ? '...' : '');
    }
    
    return 'Sustainable eco-friendly apparel';
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getFallbackImage = () => {
    return '/images/DSCF1858.jpg';
  };

  return (
    <section style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '4rem 1rem',
    }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>
        Featured Product
      </h2>
      
      <Link 
        href={`/product/${product.slug}`}
        style={{ 
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.75rem', 
          overflow: 'hidden', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          '@media (min-width: 768px)': {
            flexDirection: 'row'
          }
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
          setIsHovered(true);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          setIsHovered(false);
        }}
        >
          <div style={{ 
            width: '100%',
            height: '500px',
            position: 'relative', 
            backgroundColor: '#f3f4f6',
            overflow: 'hidden',
            '@media (min-width: 768px)': {
              width: '50%',
              height: '600px'
            }
          }}>
            <Image
              src={isHovered
                ? (imageError ? getFallbackImage() : getProductSecondaryImageUrl(product))
                : (imageError ? getFallbackImage() : getProductImageUrl(product))}
              alt={product.name}
              fill
              style={{ 
                objectFit: 'cover',
                transition: 'transform 0.5s ease-in-out',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
              }}
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={handleImageError}
              priority
            />
          </div>
          
          <div style={{ 
            padding: '2rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            '@media (min-width: 768px)': {
              padding: '3rem'
            }
          }}>
            <h3 style={{ 
              fontSize: '2rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: '#1f2937'
            }}>
              {product.name}
            </h3>
            
            <p style={{ 
              color: '#4b5563', 
              fontSize: '1.125rem',
              lineHeight: '1.75',
              marginBottom: '1.5rem' 
            }}>
              {getShortDescription(product)}
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <StarRating rating={product.average_rating || 0} count={product.rating_count || 0} />
            </div>
            
            <p style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#9CB24D'
            }}>
              {formatPrice(product.price)}
            </p>
          </div>
        </div>
      </Link>

      <style jsx>{`
        @media (min-width: 768px) {
          .product-container {
            flex-direction: row !important;
          }
          .product-image {
            width: 50% !important;
            height: 500px !important;
          }
          .product-content {
            padding: 3rem !important;
          }
        }
      `}</style>
    </section>
  );
}