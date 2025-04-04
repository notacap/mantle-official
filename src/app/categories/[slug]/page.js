import { Suspense } from 'react';
import { getCategories, getProductsByCategory } from '@/app/services/woocommerce';
import ProductGrid from '@/app/shop/ProductGrid';
import ProductSkeleton from '@/app/shop/ProductSkeleton';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamicParams = true;

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  // Find category by slug
  const categoriesData = await getCategories();
  const categories = categoriesData.categories || [];
  const category = categories.find(cat => cat.slug === slug);
  
  if (!category) {
    return {
      title: 'Category Not Found | Mantle Clothing',
      description: 'The requested category could not be found.'
    };
  }
  
  return {
    title: `${category.name} | Mantle Clothing`,
    description: category.description ? 
      `Browse our ${category.name} collection - ${category.description.replace(/<[^>]*>/g, '')}` : 
      `Browse our ${category.name} collection of sustainable products.`
  };
}

// Component to fetch products by category
async function CategoryProductsData({ categoryId }) {
  // Fetch products from the API
  const products = await getProductsByCategory(categoryId, 24); // Show 24 products by default
  return <ProductGrid products={products} />;
}

export default async function CategoryPage({ params }) {
  const { slug } = params;
  
  // Find category by slug
  const categoriesData = await getCategories();
  const categories = categoriesData.categories || [];
  const category = categories.find(cat => cat.slug === slug);
  
  // If category not found, show 404
  if (!category) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Breadcrumb navigation */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Home</Link> {' / '}
        <Link href="/categories" className="hover:underline">Categories</Link> {' / '}
        <span className="font-medium text-gray-700">{category.name}</span>
      </div>
      
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '1rem',
        color: '#333'
      }}>
        {category.name}
      </h1>
      
      {category.description && (
        <div 
          className="text-center mb-8 max-w-2xl mx-auto text-gray-600"
          dangerouslySetInnerHTML={{ __html: category.description }}
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
        <CategoryProductsData categoryId={category.id} />
      </Suspense>
    </div>
  );
} 