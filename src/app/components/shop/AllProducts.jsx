'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';
import ProductSkeleton from './ProductSkeleton';
import SortSelector from './SortSelector';
import { sortProductsByRating } from '@/app/utils/reviewUtils';

export default function AllProducts() {
  const [sortBy, setSortBy] = useState('default');
  const [sortedProducts, setSortedProducts] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  
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
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Cached query for sorted products by rating
  const { 
    data: sortedByRatingData, 
    isLoading: isLoadingSortedRating 
  } = useQuery({
    queryKey: ['products', 'sorted-by-rating', data?.products?.map(p => p.id).join(',')],
    queryFn: async () => {
      if (!data?.products) return [];
      return sortProductsByRating([...data.products]);
    },
    enabled: !!data?.products && sortBy === 'highest-reviewed',
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  useEffect(() => {
    if (!data?.products) {
      setSortedProducts([]);
      return;
    }
    
    const products = [...data.products];
    
    if (sortBy === 'highest-reviewed') {
      // Use cached sorted data if available
      if (sortedByRatingData) {
        setSortedProducts(sortedByRatingData);
        setIsSorting(false);
      } else if (isLoadingSortedRating) {
        setIsSorting(true);
      }
    } else {
      setIsSorting(false);
      switch (sortBy) {
        case 'price-low-high':
          setSortedProducts(products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)));
          break;
        case 'price-high-low':
          setSortedProducts(products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)));
          break;
        default:
          setSortedProducts(products);
      }
    }
  }, [data?.products, sortBy, sortedByRatingData, isLoadingSortedRating]);
  
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
  if (isLoading || isSorting) {
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
  return (
    <div>
      <SortSelector value={sortBy} onChange={setSortBy} />
      <ProductGrid products={sortedProducts} />
    </div>
  );
} 