"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { formatPrice, getProductImageUrl, getProductSecondaryImageUrl } from '../services/woocommerce';
import StarRating from './shop/StarRating';

export default function FeaturedProductsDouble({ products }) {
  const [imageErrors, setImageErrors] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);

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
      return text.substring(0, 180) + (text.length > 180 ? '...' : '');
    }
    
    if (product.description) {
      const text = stripHtml(product.description);
      return text.substring(0, 180) + (text.length > 180 ? '...' : '');
    }
    
    return 'Sustainable eco-friendly apparel';
  };

  const handleImageError = (productId, isSecondary = false) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [isSecondary ? 'secondary' : 'primary']: true
      }
    }));
  };

  const getFallbackImage = (index) => {
    const fallbackImages = [
      '/images/DSCF1858.jpg',
      '/images/DSCF4564-scaled.jpg',
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  return (
    <section style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '4rem 1rem',
    }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>
        Featured Products
      </h2>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '3rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {products.map((product, index) => (
          <Link 
            href={`/product/${product.slug}`} 
            key={product.id}
            style={{ 
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '0.75rem', 
              overflow: 'hidden', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              setHoveredProduct(product.id);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              setHoveredProduct(null);
            }}
            >
              <div style={{ 
                height: '400px', 
                position: 'relative', 
                backgroundColor: '#f3f4f6', 
                overflow: 'hidden' 
              }}>
                <Image
                  src={hoveredProduct === product.id
                    ? (imageErrors[product.id]?.secondary 
                        ? getFallbackImage((index + 1) % 2)
                        : getProductSecondaryImageUrl(product))
                    : (imageErrors[product.id]?.primary 
                        ? getFallbackImage(index)
                        : getProductImageUrl(product))}
                  alt={product.name}
                  fill
                  style={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease-in-out',
                    transform: hoveredProduct === product.id ? 'scale(1.08)' : 'scale(1)',
                  }}
                  sizes="(max-width: 768px) 100vw, 400px"
                  onError={() => handleImageError(product.id, hoveredProduct === product.id)}
                  priority={index === 0}
                />
              </div>
              
              <div style={{ 
                padding: '2rem', 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  marginBottom: '0.75rem',
                  color: '#1f2937'
                }}>
                  {product.name}
                </h3>
                
                <p style={{ 
                  color: '#4b5563', 
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  marginBottom: '1.25rem', 
                  flexGrow: 1 
                }}>
                  {getShortDescription(product)}
                </p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <StarRating rating={product.average_rating || 0} count={product.rating_count || 0} />
                </div>
                
                <p style={{ 
                  fontSize: '1.5rem',
                  fontWeight: 'bold', 
                  color: '#9CB24D' 
                }}>
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}