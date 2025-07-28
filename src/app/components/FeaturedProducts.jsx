"use client";

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { formatPrice, getProductImageUrl, getProductSecondaryImageUrl } from '../services/woocommerce';
import StarRating from './shop/StarRating';

export default function FeaturedProducts() {
  const scrollContainerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Fetch featured products with React Query
  const { 
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const response = await fetch('/api/products/featured?limit=8');
      if (!response.ok) {
        throw new Error('Failed to fetch featured products');
      }
      return response.json();
    }
  });

  // Extract products and featured flag from data
  const products = data?.products || [];
  const isFeatured = data?.isFeatured ?? true;

  // Determine card dimensions based on product count
  const getCardDimensions = () => {
    if (typeof window !== 'undefined') {
      // When stacking vertically (≤3 products and <1060px width)
      if (products.length <= 3 && windowWidth < 1060) {
        if (windowWidth <= 480) {
          return { width: '100%', imageHeight: '280px' };
        } else if (windowWidth <= 768) {
          return { width: '400px', imageHeight: '350px' };
        } else {
          return { width: '500px', imageHeight: '400px' };
        }
      }
      
      // Normal horizontal layout
      if (windowWidth <= 480) {
        return { width: '280px', imageHeight: '280px' };
      }
      // Tablet: medium cards
      if (windowWidth <= 768) {
        return { width: '300px', imageHeight: '300px' };
      }
      // Medium screens: prevent overflow
      if (windowWidth <= 1060) {
        return { width: '280px', imageHeight: '280px' };
      }
    }
    // Desktop: larger cards when <= 3 products
    return products.length <= 3 
      ? { width: '500px', imageHeight: '400px' }
      : { width: '360px', imageHeight: '300px' };
  };

  // Check if scrolling is possible in either direction
  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    
    // If we have 3 or fewer products, or they're stacked vertically, disable scrolling
    if (products.length <= 3 || (products.length <= 3 && windowWidth < 1060)) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      // Initial check
      checkScrollability();
      
      // Add scroll event listener
      scrollContainer.addEventListener('scroll', checkScrollability);
      
      // Add resize event listener
      const handleResize = () => {
        checkScrollability();
        setWindowWidth(window.innerWidth);
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [products]); // Re-run when products change

  // Improved scroll functions with item-based scrolling
  const scrollLeft = () => {
    if (!scrollContainerRef.current || isScrolling || !canScrollLeft) return;
    
    setIsScrolling(true);
    
    // Calculate scroll distance based on item width + gap
    const cardDimensions = getCardDimensions();
    const itemWidth = parseInt(cardDimensions.width);
    const gap = 24; // Gap between items (1.5rem)
    const scrollDistance = -(itemWidth + gap);
    
    // Get current scroll position to determine target position
    const currentPosition = scrollContainerRef.current.scrollLeft;
    const targetPosition = Math.max(0, currentPosition + scrollDistance);
    
    // Smooth scroll to the target position
    scrollContainerRef.current.scrollTo({
      left: targetPosition,
      behavior: 'smooth'
    });
    
    // Reset scrolling state after animation completes
    setTimeout(() => setIsScrolling(false), 500);
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current || isScrolling || !canScrollRight) return;
    
    setIsScrolling(true);
    
    // Calculate scroll distance based on item width + gap
    const cardDimensions = getCardDimensions();
    const itemWidth = parseInt(cardDimensions.width);
    const gap = 24; // Gap between items (1.5rem)
    const scrollDistance = itemWidth + gap;
    
    // Smooth scroll by one item width
    scrollContainerRef.current.scrollTo({
      left: scrollContainerRef.current.scrollLeft + scrollDistance,
      behavior: 'smooth'
    });
    
    // Reset scrolling state after animation completes
    setTimeout(() => setIsScrolling(false), 500);
  };

  // Function to strip HTML tags from description
  const stripHtml = (html) => {
    if (typeof window === 'undefined') {
      // Server-side rendering fallback
      return html?.replace(/<[^>]*>?/gm, '') || '';
    }
    
    // Client-side rendering
    const doc = new DOMParser().parseFromString(html || '', 'text/html');
    return doc.body.textContent || '';
  };

  // Function to get short description
  const getShortDescription = (product) => {
    // Show more text based on card size and screen width
    let maxLength = 100;
    if (windowWidth > 1060 && products.length <= 3) {
      maxLength = 150;
    } else if (windowWidth <= 768) {
      maxLength = 80;
    }
    
    if (product.short_description) {
      const text = stripHtml(product.short_description);
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    if (product.description) {
      const text = stripHtml(product.description);
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    return 'Sustainable eco-friendly apparel';
  };

  // Handle image error
  const handleImageError = (productId, isSecondary = false) => {
    setImageErrors(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [isSecondary ? 'secondary' : 'primary']: true
      }
    }));
  };

  // Get fallback image
  const getFallbackImage = (index) => {
    const fallbackImages = [
      '/images/DSCF1858.jpg',
      '/images/DSCF4564-scaled.jpg',
      '/images/DSCF6361-scaled.jpg',
      '/images/DSCF4744-scaled-e1608145214695.jpg'
    ];
    return fallbackImages[index % fallbackImages.length];
  };

  // Product skeleton for loading state
  const ProductSkeleton = () => (
    <div style={{ 
      flex: '0 0 auto',
      width: '320px',
      height: '500px',
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

  return (
    <section style={{ 
      maxWidth: products.length <= 3 ? '1400px' : '1200px', 
      margin: '0 auto', 
      padding: '4rem 1rem',
      overflow: 'hidden', // Prevent content from extending beyond container
      position: 'relative'
    }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>
        {isFeatured ? 'Featured Products' : 'Our Products'}
      </h2>
      
      {isLoading ? (
        <div style={{ position: 'relative', padding: '0 40px' }}>
          <div 
            className="featured-products"
            style={{ 
              display: 'flex',
              overflowX: 'auto',
              gap: '1.5rem',
              paddingBottom: '0.75rem',
              scrollbarWidth: 'thin',
              scrollbarColor: '#9CB24D #e5e7eb',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              width: '100%'
            }}
          >
            {Array(4).fill(0).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: '#ef4444' }}>
          <p>{error.message}</p>
        </div>
      ) : (
        <div style={{ position: 'relative', padding: (products.length <= 3 && windowWidth < 1060) ? '0' : products.length <= 3 ? '0' : windowWidth <= 1060 ? '0 30px' : '0 40px' }}>
          {/* Left scroll button */}
          {products.length > 0 && products.length > 3 && !(products.length <= 3 && windowWidth < 1060) && (
            <button 
              onClick={scrollLeft}
              aria-label="Scroll left"
              disabled={!canScrollLeft}
              style={{
                position: 'absolute',
                left: windowWidth <= 1060 ? '0' : '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: canScrollLeft ? 'pointer' : 'default',
                opacity: canScrollLeft ? 1 : 0.5,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
              onMouseDown={(e) => canScrollLeft && (e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)')}
              onMouseUp={(e) => canScrollLeft && (e.currentTarget.style.transform = 'translateY(-50%) scale(1)')}
              onMouseLeave={(e) => canScrollLeft && (e.currentTarget.style.transform = 'translateY(-50%) scale(1)')}
            >
              <span style={{ 
                borderTop: '2px solid #9CB24D', 
                borderLeft: '2px solid #9CB24D', 
                width: '10px', 
                height: '10px', 
                transform: 'rotate(-45deg)', 
                display: 'block', 
                marginLeft: '5px',
                opacity: canScrollLeft ? 1 : 0.5
              }}></span>
            </button>
          )}
          
          <div 
            ref={scrollContainerRef}
            className="featured-products"
            style={{ 
              display: 'flex',
              flexDirection: products.length <= 3 && windowWidth < 1060 ? 'column' : 'row',
              overflowX: products.length <= 3 ? 'visible' : 'auto',
              overflowY: 'visible',
              gap: products.length <= 3 && windowWidth < 1060 ? '2rem' : '1.5rem',
              paddingBottom: '0.75rem',
              scrollbarWidth: 'thin',
              scrollbarColor: '#9CB24D #e5e7eb',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: products.length <= 3 ? 'none' : 'x mandatory',
              scrollBehavior: 'smooth',
              width: '100%',
              justifyContent: products.length <= 3 ? 'center' : 'flex-start',
              alignItems: products.length <= 3 && windowWidth < 1060 ? 'center' : 'stretch'
            }}
          >
            {products.length > 0 ? (
              products.map((product, index) => (
                <Link 
                  href={`/product/${product.slug}`} 
                  key={product.id}
                  style={{ 
                    flex: '0 0 auto',
                    width: getCardDimensions().width,
                    maxWidth: products.length <= 3 && windowWidth < 1060 && windowWidth <= 480 ? 'calc(100vw - 2rem)' : 'none',
                    textDecoration: 'none',
                    color: 'inherit',
                    scrollSnapAlign: 'start'
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    setHoveredProduct(product.id);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    setHoveredProduct(null);
                  }}
                  >
                    <div style={{ height: getCardDimensions().imageHeight, position: 'relative', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                      <Image
                        src={hoveredProduct === product.id
                          ? (imageErrors[product.id]?.secondary 
                              ? getFallbackImage((index + 1) % 4)
                              : getProductSecondaryImageUrl(product))
                          : (imageErrors[product.id]?.primary 
                              ? getFallbackImage(index)
                              : getProductImageUrl(product))}
                        alt={product.name}
                        fill
                        style={{ 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
                          transform: hoveredProduct === product.id ? 'scale(1.1)' : 'scale(1)',
                          opacity: 1
                        }}
                        sizes={getCardDimensions().width}
                        onError={() => handleImageError(product.id, hoveredProduct === product.id)}
                        priority={index < 2}
                      />
                    </div>
                    <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ 
                        fontSize: products.length <= 3 ? '1.25rem' : '1.125rem', 
                        fontWeight: '600', 
                        marginBottom: '0.75rem',
                        lineHeight: '1.4'
                      }}>
                        {product.name}
                      </h3>
                      <p style={{ 
                        color: '#4b5563', 
                        marginBottom: '1rem', 
                        flexGrow: 1,
                        lineHeight: '1.6',
                        fontSize: products.length <= 3 ? '1rem' : '0.875rem'
                      }}>
                        {getShortDescription(product)}
                      </p>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <StarRating rating={product.average_rating || 0} count={product.rating_count || 0} />
                      </div>
                      <p style={{ 
                        fontWeight: 'bold', 
                        color: '#9CB24D',
                        fontSize: products.length <= 3 ? '1.25rem' : '1rem'
                      }}>
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ width: '100%', textAlign: 'center', padding: '2rem 0' }}>
                <p>No products found.</p>
              </div>
            )}
          </div>
          
          {/* Right scroll button */}
          {products.length > 0 && products.length > 3 && !(products.length <= 3 && windowWidth < 1060) && (
            <button 
              onClick={scrollRight}
              aria-label="Scroll right"
              disabled={!canScrollRight}
              style={{
                position: 'absolute',
                right: windowWidth <= 1060 ? '0' : '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: canScrollRight ? 'pointer' : 'default',
                opacity: canScrollRight ? 1 : 0.5,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
              onMouseDown={(e) => canScrollRight && (e.currentTarget.style.transform = 'translateY(-50%) scale(0.95)')}
              onMouseUp={(e) => canScrollRight && (e.currentTarget.style.transform = 'translateY(-50%) scale(1)')}
              onMouseLeave={(e) => canScrollRight && (e.currentTarget.style.transform = 'translateY(-50%) scale(1)')}
            >
              <span style={{ 
                borderTop: '2px solid #9CB24D', 
                borderRight: '2px solid #9CB24D', 
                width: '10px', 
                height: '10px', 
                transform: 'rotate(45deg)', 
                display: 'block', 
                marginRight: '5px',
                opacity: canScrollRight ? 1 : 0.5
              }}></span>
            </button>
          )}
        </div>
      )}
      
      {/* Custom scrollbar styling */}
      <style jsx global>{`
        .featured-products::-webkit-scrollbar {
          height: 6px;
        }
        
        .featured-products::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 3px;
        }
        
        .featured-products::-webkit-scrollbar-thumb {
          background-color: #9CB24D;
          border-radius: 3px;
        }
        
        .featured-products {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: thin;  /* Firefox */
          scroll-behavior: smooth;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 1060px) {
          .featured-products {
            padding: 0 0.5rem !important;
          }
        }
        
        @media (max-width: 768px) {
          .featured-products {
            gap: 1rem !important;
            padding: 0 !important;
          }
        }

        @media (max-width: 480px) {
          .featured-products {
            gap: 0.75rem !important;
          }
          
          /* Ensure cards don't overflow on very small screens */
          .featured-products > a {
            width: min(280px, calc(100vw - 2rem)) !important;
            max-width: calc(100vw - 2rem) !important;
          }
        }
      `}</style>
    </section>
  );
} 