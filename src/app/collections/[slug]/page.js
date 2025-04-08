import { Suspense } from 'react';
import { getCollections, getProductsByTag, getCategories } from '@/app/services/woocommerce';
import ProductGrid from '@/app/shop/ProductGrid';
import ProductSkeleton from '@/app/shop/ProductSkeleton';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamicParams = true;

// Navigation sidebar component
async function ShopSidebar({ currentSlug, isCategoryPage = false }) {
  // Fetch categories and collections
  const [categoriesData, collectionsData] = await Promise.all([
    getCategories(),
    getCollections()
  ]);
  
  // Define the desired category order
  const categoryOrder = ['Pants', 'Tops', 'Outerwear', 'Accessories'];
  
  // Filter out the 'Uncategorized' category and sort by specified order
  const categories = (categoriesData.categories || [])
    .filter(category => category.name.toLowerCase() !== 'uncategorized')
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.name);
      const indexB = categoryOrder.indexOf(b.name);
      // If both categories are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only one category is in the order list, it should come first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither category is in the order list, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  
  const collections = collectionsData.collections || [];
  
  return (
    <div style={{ 
      width: '250px',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      height: 'fit-content'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#333'
        }}>
          Categories
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categories.map((category) => (
            <li key={category.id} style={{ marginBottom: '0.5rem' }}>
              <Link 
                href={`/categories/${category.slug}`}
                style={{
                  color: '#4b5563',
                  textDecoration: 'none',
                  display: 'block',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'background-color 0.2s',
                  backgroundColor: isCategoryPage && category.slug === currentSlug ? '#e5e7eb' : 'transparent'
                }}
                className="hover:bg-gray-100"
              >
                {category.name} ({category.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#333'
        }}>
          Collections
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {collections.map((collection) => (
            <li key={collection.id} style={{ marginBottom: '0.5rem' }}>
              <Link 
                href={`/collections/${collection.slug}`}
                style={{
                  color: '#4b5563',
                  textDecoration: 'none',
                  display: 'block',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'background-color 0.2s',
                  backgroundColor: !isCategoryPage && collection.slug === currentSlug ? '#e5e7eb' : 'transparent'
                }}
                className="hover:bg-gray-100"
              >
                {collection.name} ({collection.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }) {
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
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
  
  // console.log(`Products for tag ${tag}:`, products);
  
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
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
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
    </div>
  );
} 