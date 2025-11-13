"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { formatPrice, getProductImageUrl, getProductSecondaryImageUrl, getProductPriceDisplay } from '../services/woocommerce';
import StarRating from './shop/StarRating';
import { useCombinedRating } from '../utils/productRatings';

export default function FeaturedProductsTriple({ products }) {
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
      return text.substring(0, 80) + (text.length > 80 ? '...' : '');
    }
    
    if (product.description) {
      const text = stripHtml(product.description);
      return text.substring(0, 80) + (text.length > 80 ? '...' : '');
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
      '/images/DSCF6361-scaled.jpg'
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  // Product Card component with combined rating logic
  const ProductCard = ({ product, index }) => {
    const { rating, count } = useCombinedRating(product);

    return (
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
          borderRadius: '0.625rem', 
          overflow: 'hidden', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
          setHoveredProduct(product.id);
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
          setHoveredProduct(null);
        }}
        >
          <div style={{ 
            height: '320px', 
            position: 'relative', 
            backgroundColor: '#f3f4f6', 
            overflow: 'hidden' 
          }}>
            <Image
              src={hoveredProduct === product.id
                ? (imageErrors[product.id]?.secondary 
                    ? getFallbackImage((index + 1) % 3)
                    : getProductSecondaryImageUrl(product))
                : (imageErrors[product.id]?.primary 
                    ? getFallbackImage(index)
                    : getProductImageUrl(product))}
              alt={product.name}
              fill
              style={{ 
                objectFit: 'cover',
                transition: 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out',
                transform: hoveredProduct === product.id ? 'scale(1.07)' : 'scale(1)',
                opacity: 1
              }}
              sizes="(max-width: 768px) 100vw, 360px"
              onError={() => handleImageError(product.id, hoveredProduct === product.id)}
              priority={index === 0}
            />
          </div>
          
          <div style={{ 
            padding: '1.75rem', 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column' 
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '0.75rem',
              color: '#1f2937',
              lineHeight: '1.4'
            }}>
              {product.name}
            </h3>
            
            <p style={{ 
              color: '#4b5563', 
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '1rem', 
              flexGrow: 1 
            }}>
              {getShortDescription(product)}
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <StarRating rating={rating} count={count} />
            </div>
            
            <div style={{ 
              fontSize: '1.375rem',
              fontWeight: 'bold', 
              color: '#9CB24D',
              marginTop: 'auto'
            }}>
              {(() => {
                const priceInfo = getProductPriceDisplay(product);
                if (priceInfo.hasDiscount) {
                  return (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#6b7280', fontSize: '1rem', marginRight: '0.5rem' }}>
                        {priceInfo.regularPrice}
                      </span>
                      <span style={{ color: '#dc2626' }}>
                        {priceInfo.salePrice}
                      </span>
                    </>
                  );
                } else {
                  return priceInfo.display;
                }
              })()}
            </div>
          </div>
        </div>
      </Link>
    );
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        justifyContent: 'center'
      }}>
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}