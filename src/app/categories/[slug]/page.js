import { Suspense } from 'react';
import { getCategories } from '@/app/services/woocommerce';
import ProductSkeleton from '@/app/components/shop/ProductSkeleton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShopSidebar from '@/app/components/ShopSidebar';
import CategoryProducts from '@/app/components/shop/CategoryProducts';

export const dynamicParams = true;

// Generate metadata for the page
export async function generateMetadata({ params }) {
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
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

export default async function CategoryPage({ params }) {
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  
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
          <ShopSidebar currentSlug={slug} isCategoryPage={true} />
        </Suspense>
        
        {/* Products grid with React Query */}
        <CategoryProducts categoryId={category.id} />
      </div>
    </div>
  );
} 