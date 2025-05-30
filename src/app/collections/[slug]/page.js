import { Suspense } from 'react';
import { getCollections } from '@/app/services/woocommerce';
import ProductSkeleton from '@/app/components/shop/ProductSkeleton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShopSidebar from '@/app/components/ShopSidebar';
import CollectionProducts from '@/app/components/shop/CollectionProducts';

export const dynamicParams = true;

// Generate metadata for the page
export async function generateMetadata({ params }) {
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  // Find collection by slug
  const collectionsData = await getCollections('CollectionSlugPage-GenerateMetadata');
  const collections = collectionsData.collections || [];
  const collection = collections.find(col => col.slug === slug);
  
  if (!collection) {
    return {
      title: 'Collection Not Found | Mantle Clothing',
      description: 'The requested collection could not be found.'
    };
  }
  
  return {
    title: `${collection.name} | Mantle Clothing`,
    description: `Browse our ${collection.name} collection of sustainable products.`
  };
}

export default async function CollectionPage({ params }) {
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
  // Find collection by slug
  const collectionsData = await getCollections('CollectionSlugPage-PageLoad');
  const collections = collectionsData.collections || [];
  const collection = collections.find(col => col.slug === slug);
  
  // If collection not found, show 404
  if (!collection) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Breadcrumb navigation */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Home</Link> {' / '}
        <Link href="/collections" className="hover:underline">Collections</Link> {' / '}
        <span className="font-medium text-gray-700">{collection.name}</span>
      </div>
      
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        {collection.name}
      </h1>
      
      {collection.description && (
        <div 
          className="text-center mb-8 max-w-2xl mx-auto text-gray-600"
          dangerouslySetInnerHTML={{ __html: collection.description }}
        />
      )}
      
      {/* Main content with sidebar */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Sidebar */}
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
        
        {/* Products grid with React Query */}
        <CollectionProducts tag={slug} />
      </div>
    </div>
  );
} 