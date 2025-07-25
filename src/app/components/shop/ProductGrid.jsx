"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { getProductImageUrl, getProductSecondaryImageUrl, formatPrice } from '@/app/services/woocommerce';
import '@/app/shop/products.css'; // Import the CSS file for animations
import ProductSkeleton from './ProductSkeleton';
import StarRating from './StarRating'; // Import StarRating

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

// Function to calculate combined rating from reviews
function calculateCombinedRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return { averageRating: 0, totalCount: 0 };
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + parseFloat(review.rating || 0), 0);
  const averageRating = totalRating / reviews.length;
  
  return {
    averageRating: averageRating,
    totalCount: reviews.length
  };
}

export default function ProductGrid({ products }) {
  const [hoveredProductId, setHoveredProductId] = useState(null);

  // Check if product 5403 exists in the current products list
  const has5403Product = products?.some(product => product.id.toString() === '5403');

  // Fetch combined reviews for product 5403 if it's in the current grid
  const { 
    data: combinedReviews5403 
  } = useQuery({
    queryKey: ['combinedReviews5403Grid'],
    queryFn: async () => {
      const response = await fetch('/api/product-reviews?product_id=5403');
      if (!response.ok) {
        throw new Error('Failed to fetch combined reviews for product 5403');
      }
      return response.json();
    },
    enabled: has5403Product,
  });

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
      {products.map((product) => {
        // Determine if the product has a secondary image
        const hasSecondaryImage = product.images && product.images.length > 1;
        
        // Determine current image source
        const currentImageSrc = 
          hoveredProductId === product.id && hasSecondaryImage 
            ? getProductSecondaryImageUrl(product) 
            : getProductImageUrl(product);

        // Calculate rating and review count - use combined data for product 5403
        let rating, reviewCount;
        if (product.id.toString() === '5403' && combinedReviews5403) {
          const combinedRating = calculateCombinedRating(combinedReviews5403);
          rating = combinedRating.averageRating;
          reviewCount = combinedRating.totalCount;
        } else {
          rating = product.average_rating || 0;
          reviewCount = product.rating_count || 0;
        }

        return (
          <Link 
            href={`/product/${product.slug}`} 
            key={product.id}
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
            onMouseEnter={() => setHoveredProductId(product.id)}
            onMouseLeave={() => setHoveredProductId(null)}
          >
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '0.5rem', 
              overflow: 'hidden', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transform: hoveredProductId === product.id ? 'translateY(-5px)' : 'translateY(0)',
              boxShadow: hoveredProductId === product.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
            className="product-card"
            >
              <div style={{ height: '300px', position: 'relative', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                <Image
                  src={currentImageSrc}
                  alt={product.name}
                  fill
                  style={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                    transform: hoveredProductId === product.id && hasSecondaryImage ? 'scale(1.1)' : 'scale(1)',
                    opacity: 1
                  }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={products.indexOf(product) < 4}
                />
              </div>
              <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  {product.name}
                </h3>
                <p style={{ color: '#4b5563', marginBottom: '1rem', flexGrow: 1 }}>
                  {getShortDescription(product)}
                </p>
                <div style={{ marginBottom: '0.75rem' }}>
                  <StarRating rating={rating} count={reviewCount} />
                </div>
                <p style={{ fontWeight: 'bold', color: '#9CB24D' }}>
                  {(() => {
                    const minPriceValue = parseFloat(product.price);
                    const maxPriceValue = product.max_price ? parseFloat(product.max_price) : null;

                    if (maxPriceValue !== null && !isNaN(minPriceValue) && !isNaN(maxPriceValue) && maxPriceValue > minPriceValue) {
                      return `${formatPrice(product.price)} – ${formatPrice(product.max_price)}`;
                    } else if (product.price_html && (product.price_html.includes('–') || product.price_html.includes('-'))) {
                      return stripHtml(product.price_html);
                    } else {
                      return formatPrice(product.price);
                    }
                  })()}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 