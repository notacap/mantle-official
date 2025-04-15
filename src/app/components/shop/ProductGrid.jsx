"use client";

import Link from 'next/link';
import Image from 'next/image';
import { getProductImageUrl, formatPrice } from '@/app/services/woocommerce';
import '@/app/shop/products.css'; // Import the CSS file for animations
import ProductSkeleton from './ProductSkeleton';

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