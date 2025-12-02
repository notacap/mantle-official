'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import ProductGrid from '@/app/components/shop/ProductGrid';
import ProductSkeleton from '@/app/components/shop/ProductSkeleton';
import Link from 'next/link';

export default function BlackFridayPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown timer
  useEffect(() => {
    // December 8, 2025 at 12:00 AM Central Time (CST = UTC-6)
    const endDate = new Date("2025-12-08T06:00:00Z").getTime();

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

  // Fetch categories to get IDs for Pants and Tops
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Find Pants and Tops category IDs
  const pantsCategory = categoriesData?.categories?.find(
    (cat) => cat.slug === 'pants' || cat.name.toLowerCase() === 'pants'
  );
  const topsCategory = categoriesData?.categories?.find(
    (cat) => cat.slug === 'tops' || cat.name.toLowerCase() === 'tops'
  );

  // Fetch Pants products
  const {
    data: pantsProducts,
    isLoading: isLoadingPants,
    error: pantsError,
  } = useQuery({
    queryKey: ['products', 'category', pantsCategory?.id],
    queryFn: async () => {
      const url = new URL('/api/products/category', window.location.origin);
      url.searchParams.append('category', pantsCategory.id);
      url.searchParams.append('limit', '12');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch pants');
      }
      return response.json();
    },
    enabled: !!pantsCategory?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Tops products
  const {
    data: topsProducts,
    isLoading: isLoadingTops,
    error: topsError,
  } = useQuery({
    queryKey: ['products', 'category', topsCategory?.id],
    queryFn: async () => {
      const url = new URL('/api/products/category', window.location.origin);
      url.searchParams.append('category', topsCategory.id);
      url.searchParams.append('limit', '12');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch tops');
      }
      return response.json();
    },
    enabled: !!topsCategory?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingCategories || isLoadingPants || isLoadingTops;
  const hasError = pantsError || topsError;

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
          {/* Cyber Monday Badge */}
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
              CYBER MONDAY SALE
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
            <span style={{ color: '#ffffff' }}>Buy Pants, Get a Top</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #9CB24D 0%, #b8d45a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              30% OFF
            </span>
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
            Purchase any pair of pants and get 30% off any top.
            Premium tactical gear for professionals. Limited time only.
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

      {/* Products Sections */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '40px 20px 80px',
        }}
      >
        {/* Error State */}
        {hasError && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '8px' }}>
              Failed to load products
            </h2>
            <p style={{ color: '#666' }}>{pantsError?.message || topsError?.message}</p>
          </div>
        )}

        {/* SECTION 1: BUY ONE - PANTS */}
        <div style={{ marginBottom: '60px' }}>
          {/* Section Header */}
          <div
            style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #333',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #9CB24D 0%, #8aa542 100%)',
                  color: '#1a1a1a',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Step 1
              </span>
              <h2
                style={{
                  color: '#ffffff',
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  margin: 0,
                }}
              >
                Buy a Pair of Pants
              </h2>
            </div>
            <p style={{ color: '#999', fontSize: '0.95rem', margin: 0 }}>
              Choose from our premium tactical pants collection
            </p>
          </div>

          {/* Pants Loading State */}
          {(isLoadingCategories || isLoadingPants) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem',
              }}
            >
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
            </div>
          )}

          {/* Pants Products Grid */}
          {!isLoadingCategories && !isLoadingPants && !pantsError && pantsProducts && pantsProducts.length > 0 && (
            <div
              style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #333',
              }}
            >
              <ProductGrid products={pantsProducts} />
            </div>
          )}

          {/* No Pants State */}
          {!isLoadingCategories && !isLoadingPants && !pantsError && (!pantsProducts || pantsProducts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1a1a1a', borderRadius: '12px' }}>
              <p style={{ color: '#666' }}>No pants available at the moment.</p>
            </div>
          )}
        </div>

        {/* SECTION 2: GET ONE 30% OFF - TOPS */}
        <div style={{ marginBottom: '60px' }}>
          {/* Section Header */}
          <div
            style={{
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid #333',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Step 2
              </span>
              <h2
                style={{
                  color: '#ffffff',
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  margin: 0,
                }}
              >
                Get a Top for{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #9CB24D 0%, #b8d45a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  30% OFF
                </span>
              </h2>
            </div>
            <p style={{ color: '#999', fontSize: '0.95rem', margin: 0 }}>
              Add any top to your cart and the discount will be applied automatically
            </p>
          </div>

          {/* Tops Loading State */}
          {(isLoadingCategories || isLoadingTops) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem',
              }}
            >
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
            </div>
          )}

          {/* Tops Products Grid */}
          {!isLoadingCategories && !isLoadingTops && !topsError && topsProducts && topsProducts.length > 0 && (
            <div
              style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #333',
              }}
            >
              <ProductGrid products={topsProducts} />
            </div>
          )}

          {/* No Tops State */}
          {!isLoadingCategories && !isLoadingTops && !topsError && (!topsProducts || topsProducts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1a1a1a', borderRadius: '12px' }}>
              <p style={{ color: '#666' }}>No tops available at the moment.</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {!isLoading && !hasError && (pantsProducts?.length > 0 || topsProducts?.length > 0) && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '20px',
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
              Buy any pants and get 30% off any top. Discount applied automatically at checkout!
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
