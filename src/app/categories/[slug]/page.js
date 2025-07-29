'use client';

import { Suspense, useState, useEffect, use } from 'react';
import { getCategories } from '@/app/services/woocommerce';
import ProductSkeleton from '@/app/components/shop/ProductSkeleton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShopSidebar from '@/app/components/ShopSidebar';
import CategoryProducts from '@/app/components/shop/CategoryProducts';

export const dynamicParams = true;

// Generate metadata for the page - This will be removed as it's a client component
// export async function generateMetadata({ params }) {
//   // Ensure params is properly awaited
//   const resolvedParams = await Promise.resolve(params);
//   const slug = resolvedParams.slug;
  
//   // Find category by slug
//   const categoriesData = await getCategories('CategorySlugPage-GenerateMetadata');
//   const categories = categoriesData.categories || [];
//   const category = categories.find(cat => cat.slug === slug);
  
//   if (!category) {
//     return {
//       title: 'Category Not Found | Mantle Clothing',
//       description: 'The requested category could not be found.'
//     };
//   }
  
//   return {
//     title: `${category.name} | Mantle Clothing`,
//     description: category.description ? 
//       `Browse our ${category.name} collection - ${category.description.replace(/<[^>]*>/g, '')}` : 
//       `Browse our ${category.name} collection of sustainable products.`
//   };
// }

export default function CategoryPage({ params }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileScreen(window.innerWidth < 900);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    if (!isMobileScreen && isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  }, [isMobileScreen, isMobileNavOpen]);

  useEffect(() => {
    async function fetchCategoryData() {
      setIsLoading(true);
      try {
        const categoriesData = await getCategories('CategorySlugPage-PageLoad');
        const categories = categoriesData.categories || [];
        const foundCategory = categories.find(cat => cat.slug === slug);

        if (!foundCategory) {
          notFound();
        } else {
          setCategory(foundCategory);
        }
      } catch (error) {
        console.error("Failed to fetch category:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <ProductSkeleton />
      </div>
    );
  }

  if (!category) {
    return notFound();
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Breadcrumb navigation */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Home</Link> {' / '}
        <Link href="/shop" className="hover:underline">Shop</Link> {' / '}
        <Link href="/categories" className="hover:underline">Categories</Link> {' / '}
        <span className="font-medium text-gray-700">{category.name}</span>
      </div>
      
      {/* <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        {category.name}
      </h1> */}
      
      {isMobileScreen && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setIsMobileNavOpen(true)}
            style={{
              padding: '0.75rem 2.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              color: '#fff',
              backgroundColor: '#9CB24D', // Example color, match your theme
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'none',
              transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Filters
          </button>
        </div>
      )}
      
      {category.description && (
        <div 
          className="text-center mb-8 max-w-2xl mx-auto text-gray-600"
          dangerouslySetInnerHTML={{ __html: category.description }}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobileScreen && (
        <ShopSidebar 
          currentSlug={slug} 
          isCategoryPage={true} 
          isMobileMode={true} 
          isOpen={isMobileNavOpen} 
          onClose={() => setIsMobileNavOpen(false)} 
        />
      )}

      {/* Main content with sidebar */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: isMobileScreen ? '1fr' : '250px 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Sidebar for Desktop */}
        {!isMobileScreen && (
          <Suspense fallback={
            <div style={{ 
              width: '250px',
              height: '400px',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite'
            }} />
          }>
            <ShopSidebar currentSlug={slug} isCategoryPage={true} />
          </Suspense>
        )}
        
        {/* Products grid */}
        <CategoryProducts categoryId={category.id} />
      </div>
    </div>
  );
} 