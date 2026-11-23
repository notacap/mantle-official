'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import ProductGrid from '@/app/components/shop/ProductGrid';
import ProductSkeleton from '@/app/components/shop/ProductSkeleton';
import Link from 'next/link';
import { SaleDiscountMark, SaleEnds, SalePhoto, saleButtonClass, saleSurfaceClass } from '@/app/components/SaleElements';
import { notFound } from 'next/navigation';
import { saleConfig, isSaleActive, isCrossCategorySale, getTimeRemaining } from '@/config/saleConfig';

export default function SpecialsPage() {
  const [timeLeft, setTimeLeft] = useState(null);
  const [saleActive, setSaleActive] = useState(null); // null = checking, true/false = determined
  const [isClient, setIsClient] = useState(false);

  const { name, discount, messaging, sections, triggerCategory, discountCategory, triggerCategoryName, discountCategoryName } = saleConfig;

  const hasTrigger = isCrossCategorySale();

  // Fetch categories to get IDs for the sale categories
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

  // Find trigger and discount category IDs based on config
  const triggerCategoryData = categoriesData?.categories?.find(
    (cat) => cat.slug === triggerCategory || cat.name.toLowerCase() === triggerCategory
  );
  const discountCategoryData = categoriesData?.categories?.find(
    (cat) => cat.slug === discountCategory || cat.name.toLowerCase() === discountCategory
  );

  // Fetch trigger category products (e.g., Pants)
  const {
    data: triggerProducts,
    isLoading: isLoadingTrigger,
    error: triggerError,
  } = useQuery({
    queryKey: ['products', 'category', triggerCategoryData?.id],
    queryFn: async () => {
      const url = new URL('/api/products/category', window.location.origin);
      url.searchParams.append('category', triggerCategoryData.id);
      url.searchParams.append('limit', '12');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch ${triggerCategoryName}`);
      }
      return response.json();
    },
    enabled: hasTrigger && !!triggerCategoryData?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch discount category products (e.g., Tops)
  const {
    data: discountProducts,
    isLoading: isLoadingDiscount,
    error: discountError,
  } = useQuery({
    queryKey: ['products', 'category', discountCategoryData?.id],
    queryFn: async () => {
      const url = new URL('/api/products/category', window.location.origin);
      url.searchParams.append('category', discountCategoryData.id);
      url.searchParams.append('limit', '12');

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Failed to fetch ${discountCategoryName}`);
      }
      return response.json();
    },
    enabled: !!discountCategoryData?.id,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isLoadingCategories || (hasTrigger && isLoadingTrigger) || isLoadingDiscount;
  const hasError = triggerError || discountError;

  // Check if sale is active and setup countdown timer
  useEffect(() => {
    setIsClient(true);
    const active = isSaleActive();
    setSaleActive(active);

    if (!active) {
      return;
    }

    const remaining = getTimeRemaining();
    if (remaining) {
      setTimeLeft(remaining);
    }

    const timer = setInterval(() => {
      const remaining = getTimeRemaining();
      if (remaining) {
        setTimeLeft(remaining);
      } else {
        setSaleActive(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Show 404 if sale is not active (only after client-side check)
  if (isClient && saleActive === false) {
    notFound();
  }

  // Show loading while checking sale status
  if (!isClient || saleActive === null) {
    return (
      <div style={{ backgroundColor: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <section className={saleSurfaceClass}>
        <SalePhoto className="lg:w-[600px]" />
        <div className="container-custom flex flex-col gap-6 py-12 md:min-h-[420px] md:justify-center">
          <h1 className="m-0">
            <SaleDiscountMark size="xl" />
            <span className="mt-4 block text-2xl font-semibold tracking-tight lg:text-4xl">
              {messaging.heroHeadline}
            </span>
          </h1>
          <p className="m-0 max-w-[46ch] text-base text-neutral-300 lg:text-lg">
            {messaging.heroSubheadline} <SaleEnds timeLeft={timeLeft} />
          </p>
        </div>
      </section>

      {/* Products Sections. Grids are capped just under the 1216px that fits a fourth column. */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px clamp(16px, 2.5vw, 32px) 80px',
        }}
      >
        {/* Error State */}
        {hasError && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ color: '#ffffff', fontSize: '1.25rem', marginBottom: '8px' }}>
              Failed to load products
            </h2>
            <p style={{ color: '#666' }}>{triggerError?.message || discountError?.message}</p>
          </div>
        )}

        {/* SECTION 1: BUY ONE - Trigger Category (cross-category sales only) */}
        {hasTrigger && <div style={{ marginBottom: '60px' }}>
          {/* Section Header */}
          <div className="mb-6 text-white font-[family-name:var(--font-geist-sans)]">
            <h2 className="m-0 text-2xl font-semibold tracking-tight">
              {hasTrigger && `${sections.step1.badge}: `}
              {sections.step1.title}
            </h2>
            <p className="m-0 mt-1 text-neutral-300">{sections.step1.description}</p>
          </div>

          {/* Trigger Category Loading State */}
          {(isLoadingCategories || isLoadingTrigger) && (
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

          {/* Trigger Category Products Grid */}
          {!isLoadingCategories && !isLoadingTrigger && !triggerError && triggerProducts && triggerProducts.length > 0 && (
            <div className="max-w-[1215px]"><ProductGrid products={triggerProducts} /></div>
          )}

          {/* No Products State */}
          {!isLoadingCategories && !isLoadingTrigger && !triggerError && (!triggerProducts || triggerProducts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1a1a1a', borderRadius: '12px' }}>
              <p style={{ color: '#666' }}>No {triggerCategoryName.toLowerCase()} available at the moment.</p>
            </div>
          )}
        </div>}

        {/* SECTION 2: Discounted products */}
        <div style={{ marginBottom: '60px' }}>
          {/* Section Header */}
          <div className="mb-6 text-white font-[family-name:var(--font-geist-sans)]">
            <h2 className="m-0 text-2xl font-semibold tracking-tight">
              {hasTrigger && `${sections.step2.badge}: `}
              {sections.step2.title}{' '}
              <span className="text-[#9CB24D]">{discount}% off</span>
            </h2>
            <p className="m-0 mt-1 text-neutral-300">{sections.step2.description}</p>
          </div>

          {/* Discount Category Loading State */}
          {(isLoadingCategories || isLoadingDiscount) && (
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

          {/* Discount Category Products Grid */}
          {!isLoadingCategories && !isLoadingDiscount && !discountError && discountProducts && discountProducts.length > 0 && (
            <div className="max-w-[1215px]"><ProductGrid products={discountProducts} /></div>
          )}

          {/* No Products State */}
          {!isLoadingCategories && !isLoadingDiscount && !discountError && (!discountProducts || discountProducts.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#1a1a1a', borderRadius: '12px' }}>
              <p style={{ color: '#666' }}>No {discountCategoryName.toLowerCase()} available at the moment.</p>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {!isLoading && !hasError && (triggerProducts?.length > 0 || discountProducts?.length > 0) && (
          <div className="flex flex-col items-start gap-5 border-t border-neutral-800 pt-10 text-white font-[family-name:var(--font-geist-sans)] md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="m-0 text-xl font-semibold tracking-tight">{messaging.ctaTitle}</h3>
              <p className="m-0 mt-1 text-neutral-300">{messaging.ctaDescription}</p>
            </div>
            <Link href="/shop" className={saleButtonClass}>
              Shop all products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
