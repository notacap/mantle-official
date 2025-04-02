import { Suspense } from 'react';
import { getCollections, getProductsByTag } from '@/app/services/woocommerce';
import ProductGrid from '@/app/shop/ProductGrid';
import ProductSkeleton from '@/app/shop/ProductSkeleton';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamicParams = true;

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  // Find collection by slug
  const collectionsData = await getCollections();
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

// Component to fetch products by tag (collection)
async function CollectionProductsData({ tag }) {
  // Fetch products from the API
  const products = await getProductsByTag(tag, 24); // Show 24 products by default
  
  console.log(`Products for tag ${tag}:`, products);
  
  // Check if we have products
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-600">No products found in this collection</h2>
        <p className="mt-2 text-gray-500">Try browsing our other collections or visit the shop.</p>
        <div className="mt-6">
          <Link 
            href="/shop" 
            className="px-5 py-2 bg-black text-white hover:bg-gray-800 rounded-md inline-block"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }
  
  return <ProductGrid products={products} />;
}

export default async function CollectionPage({ params }) {
  const { slug } = params;
  
  // Find collection by slug
  const collectionsData = await getCollections();
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
      
      {/* Products grid with suspense fallback */}
      <Suspense fallback={
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem',
        }}>
          {Array(12).fill(0).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      }>
        <CollectionProductsData tag={slug} />
      </Suspense>
    </div>
  );
} 