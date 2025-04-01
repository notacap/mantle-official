"use client";

import Link from 'next/link';
import Image from 'next/image';
import { getProductImageUrl, formatPrice } from '../services/woocommerce';
import './products.css'; // Import the CSS file as a fallback

// Function to strip HTML tags from description
function stripHtml(html) {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return html?.replace(/<[^>]*>?/gm, '') || '';
  }
  
  // Client-side rendering
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return doc.body.textContent || '';
}

// Function to get short description
function getShortDescription(product) {
  if (product.short_description) {
    const text = stripHtml(product.short_description);
    return text.substring(0, 70) + (text.length > 70 ? '...' : '');
  }
  
  if (product.description) {
    const text = stripHtml(product.description);
    return text.substring(0, 70) + (text.length > 70 ? '...' : '');
  }
  
  return 'Sustainable eco-friendly apparel';
}

export default function ProductGrid({ products }) {
  // Product skeleton component for loading state
  const ProductSkeleton = () => (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.5rem', 
      overflow: 'hidden', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        height: '300px', 
        backgroundColor: '#f3f4f6',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ 
          height: '24px', 
          width: '80%', 
          backgroundColor: '#f3f4f6', 
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
        <div style={{ 
          height: '60px', 
          backgroundColor: '#f3f4f6', 
          marginBottom: '1rem',
          borderRadius: '0.25rem',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
        <div style={{ 
          height: '20px', 
          width: '40%', 
          backgroundColor: '#f3f4f6',
          borderRadius: '0.25rem',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
      </div>
    </div>
  );

  // Display loading skeletons if no products are available yet
  if (!products || products.length === 0) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
      }}>
        {Array(8).fill(0).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '2rem',
    }}>
      {products.map((product) => (
        <Link 
          href={`/shop/product/${product.id}`} 
          key={product.id}
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '0.5rem', 
            overflow: 'hidden', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          className="product-card"
          >
            <div style={{ height: '300px', position: 'relative', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
              <Image
                src={getProductImageUrl(product)}
                alt={product.name}
                fill
                style={{ 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease-in-out'
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                {product.name}
              </h3>
              <p style={{ color: '#4b5563', marginBottom: '1rem', flexGrow: 1 }}>
                {getShortDescription(product)}
              </p>
              <p style={{ fontWeight: 'bold', color: '#9CB24D' }}>
                {formatPrice(product.price)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 