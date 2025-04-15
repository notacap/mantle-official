'use client';

import { useQuery } from '@tanstack/react-query';
import ProductGrid from './ProductGrid';
import ProductSkeleton from './ProductSkeleton';

export default function CategoryProducts({ categoryId }) {
  const { 
    data: products, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['products', 'category', categoryId],
    queryFn: async () => {
      const url = new URL('/api/products/category', window.location.origin);
      url.searchParams.append('category', categoryId.toString());
      url.searchParams.append('limit', '24');
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch category products');
      }
      
      return response.json();
    },
    enabled: !!categoryId,
  });
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-600">Failed to load products</h2>
        <p className="mt-2 text-gray-500">{error.message}</p>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2rem',
      }}>
        {Array(12).fill(0).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }
  
  // No products state
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-600">No products found in this category</h2>
        <p className="mt-2 text-gray-500">Try browsing our other categories or visit the shop.</p>
      </div>
    );
  }
  
  // Successful data fetch
  return <ProductGrid products={products} />;
} 