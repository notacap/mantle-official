'use client';

import { useQuery } from '@tanstack/react-query';
import ProductGrid from './ProductGrid';
import ProductSkeleton from './ProductSkeleton';
import Link from 'next/link';

export default function CollectionProducts({ tag }) {
  const { 
    data: products, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['products', 'tag', tag],
    queryFn: async () => {
      const url = new URL('/api/products/tag', window.location.origin);
      url.searchParams.append('tag', tag);
      url.searchParams.append('limit', '24');
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch collection products');
      }
      
      return response.json();
    },
    enabled: !!tag,
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
  
  // Successful data fetch
  return <ProductGrid products={products} />;
} 