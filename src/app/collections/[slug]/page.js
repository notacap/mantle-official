'use client';

import { Suspense, useState, useEffect, use } from 'react';
import { getCollections } from '@/app/services/woocommerce';
import ProductSkeleton from '@/app/components/shop/ProductSkeleton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShopSidebar from '@/app/components/ShopSidebar';
import CollectionProducts from '@/app/components/shop/CollectionProducts';

export const dynamicParams = true;

// Generate metadata for the page
// export async function generateMetadata({ params }) {
//   // Ensure params is properly awaited
//   const resolvedParams = await Promise.resolve(params);
//   const slug = resolvedParams.slug;
  
//   // Find collection by slug
//   const collectionsData = await getCollections('CollectionSlugPage-GenerateMetadata');
//   const collections = collectionsData.collections || [];
//   const collection = collections.find(col => col.slug === slug);
  
//   if (!collection) {
//     return {
//       title: 'Collection Not Found | Mantle Clothing',
//       description: 'The requested collection could not be found.'
//     };
//   }
  
//   return {
//     title: `${collection.name} | Mantle Clothing`,
//     description: `Browse our ${collection.name} collection of sustainable products.`
//   };
// }

export default function CollectionPage({ params }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [collection, setCollection] = useState(null);
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
    async function fetchCollectionData() {
      setIsLoading(true);
      try {
        if (!slug) {
          console.warn('Slug is not available for fetching collection data.');
          setIsLoading(false);
          return;
        }
        const collectionsData = await getCollections('CollectionSlugPage-PageLoad');
        const collections = collectionsData.collections || [];
        const foundCollection = collections.find(col => col.slug === slug);
        
        if (!foundCollection) {
          notFound();
        } else {
          setCollection(foundCollection);
        }
      } catch (error) {
        console.error("Failed to fetch collection:", error);
        // Potentially redirect to an error page or show an error message
        notFound(); // Or handle error differently
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      fetchCollectionData();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <ProductSkeleton />
      </div>
    );
  }

  if (!collection) {
    // This case should ideally be handled by notFound() in useEffect, 
    // but as a fallback:
    return notFound();
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Breadcrumb navigation */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Home</Link> {' / '}
        <Link href="/shop" className="hover:underline">Shop</Link> {' / '}
        <Link href="/collections" className="hover:underline">Collections</Link> {' / '}
        <span className="font-medium text-gray-700">{collection.name}</span>
      </div>
      
      {/* <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        {collection.name}
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
            Filters {/* Changed from Categories to Filters for more general use */}
          </button>
        </div>
      )}

      {collection.description && (
        <div 
          className="text-center mb-8 max-w-2xl mx-auto text-gray-600"
          dangerouslySetInnerHTML={{ __html: collection.description }}
        />
      )}
      
      {/* Mobile Sidebar */}
      {isMobileScreen && (
        <ShopSidebar 
          currentSlug={slug} 
          isCategoryPage={false} 
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
            <ShopSidebar currentSlug={slug} isCategoryPage={false} />
          </Suspense>
        )}
        
        {/* Products grid */}
        <CollectionProducts tag={slug} />
      </div>
    </div>
  );
} 