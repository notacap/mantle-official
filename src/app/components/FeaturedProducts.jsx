"use client";

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts, formatPrice, getProductImageUrl, getProductSecondaryImageUrl } from '../services/woocommerce';

export default function FeaturedProducts() {
  const scrollContainerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFeatured, setIsFeatured] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Fetch products from the API
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true);
        
        // Get products from the API
        const result = await getFeaturedProducts(8);
        
        // Log products for debugging
        // console.log('Loaded products:', result.products?.map(p => ({
        //   id: p.id,
        //   name: p.name,
        //   imageCount: p?.images?.length,
        //   images: p.images
        // })));
        
        // Set products and featured flag
        setProducts(result.products || []);
        setIsFeatured(result.isFeatured);
        setError(null);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Check if scrolling is possible in either direction
  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    
    // If we have 3 or fewer products, disable scrolling completely
    if (products.length <= 3) {
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
      window.addEventListener('resize', checkScrollability);
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [products]); // Re-run when products change

  // Improved scroll functions with item-based scrolling
  const scrollLeft = () => {
    if (!scrollContainerRef.current || isScrolling || !canScrollLeft) return;
    
    setIsScrolling(true);
    
    // Calculate scroll distance based on item width + gap
    const itemWidth = 280; // Width of each product card
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
    const itemWidth = 280; // Width of each product card
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
    if (product.short_description) {
      const text = stripHtml(product.short_description);
      return text.substring(0, 60) + (text.length > 60 ? '...' : '');
    }
    
    if (product.description) {
      const text = stripHtml(product.description);
      return text.substring(0, 60) + (text.length > 60 ? '...' : '');
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
      width: '280px',
      height: '470px',
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
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '4rem 1rem',
      overflow: 'hidden', // Prevent content from extending beyond container
      position: 'relative'
    }}>
      <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2.5rem' }}>
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
          <p>{error}</p>
        </div>
      ) : (
        <div style={{ position: 'relative', padding: products.length <= 3 ? '0' : '0 40px' }}>
          {/* Left scroll button */}
          {products.length > 0 && products.length > 3 && (
            <button 
              onClick={scrollLeft}
              aria-label="Scroll left"
              disabled={!canScrollLeft}
              style={{
                position: 'absolute',
                left: '-10px',
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
              overflowX: products.length <= 3 ? 'visible' : 'auto',
              gap: '1.5rem',
              paddingBottom: '0.75rem',
              scrollbarWidth: 'thin',
              scrollbarColor: '#9CB24D #e5e7eb',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: products.length <= 3 ? 'none' : 'x mandatory',
              scrollBehavior: 'smooth',
              width: '100%',
              justifyContent: products.length <= 3 ? 'center' : 'flex-start'
            }}
          >
            {products.length > 0 ? (
              products.map((product, index) => (
                <Link 
                  href={`/shop/product/${product.id}`} 
                  key={product.id}
                  style={{ 
                    flex: '0 0 auto',
                    width: '280px',
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
                    <div style={{ height: '300px', position: 'relative', backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
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
                        sizes="280px"
                        onError={() => handleImageError(product.id, hoveredProduct === product.id)}
                        priority={index < 2}
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
              ))
            ) : (
              <div style={{ width: '100%', textAlign: 'center', padding: '2rem 0' }}>
                <p>No products found.</p>
              </div>
            )}
          </div>
          
          {/* Right scroll button */}
          {products.length > 0 && products.length > 3 && (
            <button 
              onClick={scrollRight}
              aria-label="Scroll right"
              disabled={!canScrollRight}
              style={{
                position: 'absolute',
                right: '-10px',
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
      `}</style>
    </section>
  );
} 