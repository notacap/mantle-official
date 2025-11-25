'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import ProductGrid from '@/app/components/shop/ProductGrid';
import ProductSkeleton from '@/app/components/shop/ProductSkeleton';
import { sortProductsByRating } from '@/app/utils/reviewUtils';
import Link from 'next/link';

// The Rain Collection tag slug
const SALE_COLLECTION_TAG = 'rain-collection';

export default function BlackFridayPage() {
  const [sortBy, setSortBy] = useState('default');
  const [sortedProducts, setSortedProducts] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer
  useEffect(() => {
    // December 1, 2025 at 1:00 AM Central Time (CST = UTC-6)
    const endDate = new Date("2025-12-01T07:00:00Z").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const {
    data: products,
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', 'tag', SALE_COLLECTION_TAG],
    queryFn: async () => {
      const url = new URL('/api/products/tag', window.location.origin);
      url.searchParams.append('tag', SALE_COLLECTION_TAG);
      url.searchParams.append('limit', '24');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch sale products');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Cached query for sorted products by rating
  const {
    data: sortedByRatingData,
    isLoading: isLoadingSortedRating
  } = useQuery({
    queryKey: ['products', 'tag', SALE_COLLECTION_TAG, 'sorted-by-rating', products?.map(p => p.id).join(',')],
    queryFn: async () => {
      if (!products) return [];
      return sortProductsByRating([...products]);
    },
    enabled: !!products && sortBy === 'highest-reviewed',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!products) {
      setSortedProducts([]);
      return;
    }

    const productsCopy = [...products];

    if (sortBy === 'highest-reviewed') {
      if (sortedByRatingData) {
        setSortedProducts(sortedByRatingData);
        setIsSorting(false);
      } else if (isLoadingSortedRating) {
        setIsSorting(true);
      }
    } else {
      setIsSorting(false);
      switch (sortBy) {
        case 'price-low-high':
          setSortedProducts(productsCopy.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)));
          break;
        case 'price-high-low':
          setSortedProducts(productsCopy.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)));
          break;
        default:
          setSortedProducts(productsCopy);
      }
    }
  }, [products, sortBy, sortedByRatingData, isLoadingSortedRating]);

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: '60px 20px',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            opacity: 0.5,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          {/* Black Friday Badge */}
          <div style={{ marginBottom: '20px' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '4px',
                fontWeight: '800',
                fontSize: '0.9rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 15px rgba(255, 68, 68, 0.4)',
                display: 'inline-block',
              }}
            >
              BLACK FRIDAY SALE
            </span>
          </div>

          {/* Main Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: '900',
              marginBottom: '16px',
              lineHeight: 1.1,
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #9CB24D 0%, #b8d45a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              35% OFF
            </span>
            <br />
            <span style={{ color: '#ffffff' }}>Rain Gear</span>
          </h1>

          {/* Subheadline */}
          <p
            style={{
              color: '#999',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto 30px',
              lineHeight: 1.6,
            }}
          >
            Premium waterproof tactical gear built for professionals who work in the elements.
            Limited time only.
          </p>

          {/* Countdown Timer */}
          <div style={{ marginBottom: '10px' }}>
            <span
              style={{
                color: '#666',
                fontSize: '0.8rem',
                fontWeight: '600',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              Sale Ends In
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: timeLeft.days, label: 'Days' },
              { value: timeLeft.hours, label: 'Hours' },
              { value: timeLeft.minutes, label: 'Mins' },
              { value: timeLeft.seconds, label: 'Secs' },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  minWidth: '70px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#ffffff',
                    fontSize: '1.8rem',
                    fontWeight: '700',
                    fontFamily: 'monospace',
                    lineHeight: 1,
                  }}
                >
                  {String(item.value).padStart(2, '0')}
                </div>
                <div
                  style={{
                    color: '#666',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginTop: '4px',
                  }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px 80px',
        }}
      >
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <h2
            style={{
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: '600',
            }}
          >
            Shop the Sale
          </h2>
          {/* Custom dark-themed sort selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <label
              htmlFor="sort-select"
              style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#ffffff',
              }}
            >
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #333',
                borderRadius: '0.375rem',
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="default">Best Selling</option>
              <option value="highest-reviewed">Highest Reviewed</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '8px' }}>
              Failed to load products
            </h2>
            <p style={{ color: '#666' }}>{error.message}</p>
          </div>
        )}

        {/* Loading State */}
        {(isLoading || isSorting) && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2rem',
            }}
          >
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
          </div>
        )}

        {/* No Products State */}
        {!isLoading && !error && (!products || products.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '8px' }}>
              No sale products available
            </h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Check back soon for more deals!
            </p>
            <Link
              href="/shop"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: '#9CB24D',
                color: '#1a1a1a',
                borderRadius: '6px',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !isSorting && !error && products && products.length > 0 && (
          <div
            style={{
              background: '#F8F8F8',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <ProductGrid products={sortedProducts} />
          </div>
        )}

        {/* Bottom CTA */}
        {!isLoading && !error && products && products.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '50px',
              padding: '40px 20px',
              background: 'linear-gradient(135deg, rgba(156, 178, 77, 0.1) 0%, rgba(156, 178, 77, 0.05) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(156, 178, 77, 0.2)',
            }}
          >
            <h3 style={{ color: '#ffffff', fontSize: '1.5rem', marginBottom: '12px' }}>
              Don&apos;t Miss Out
            </h3>
            <p style={{ color: '#999', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
              These prices won&apos;t last. Grab your gear before the sale ends!
            </p>
            <Link
              href="/shop"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                background: 'transparent',
                color: '#9CB24D',
                border: '2px solid #9CB24D',
                borderRadius: '6px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#9CB24D';
                e.currentTarget.style.color = '#1a1a1a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9CB24D';
              }}
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
