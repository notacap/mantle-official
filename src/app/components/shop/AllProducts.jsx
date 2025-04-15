'use client';

import { useQuery } from '@tanstack/react-query';
import ProductGrid from './ProductGrid';
import ProductSkeleton from './ProductSkeleton';

export default function AllProducts() {
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const url = new URL('/api/products/all', window.location.origin);
      url.searchParams.append('limit', '24');
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    }
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
  if (!data?.products || data.products.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-600">No products found</h2>
        <p className="mt-2 text-gray-500">Check back soon for new arrivals.</p>
      </div>
    );
  }
  
  // Successful data fetch
  return <ProductGrid products={data.products} />;
} 