'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import ProductGrid from './ProductGrid';
import ProductSkeleton from './ProductSkeleton';
import SortSelector from './SortSelector';
import { sortProductsByRating } from '@/app/utils/reviewUtils';

export default function CategoryProducts({ categoryId }) {
  const [sortBy, setSortBy] = useState('default');
  const [sortedProducts, setSortedProducts] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  
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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Cached query for sorted products by rating
  const { 
    data: sortedByRatingData, 
    isLoading: isLoadingSortedRating 
  } = useQuery({
    queryKey: ['products', 'category', categoryId, 'sorted-by-rating', products?.map(p => p.id).join(',')],
    queryFn: async () => {
      if (!products) return [];
      return sortProductsByRating([...products]);
    },
    enabled: !!products && sortBy === 'highest-reviewed',
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  useEffect(() => {
    if (!products) {
      setSortedProducts([]);
      return;
    }
    
    const productsCopy = [...products];
    
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
          setSortedProducts(productsCopy.sort((a, b) => parseFloat(a.price) - parseFloat(b.price)));
          break;
        case 'price-high-low':
          setSortedProducts(productsCopy.sort((a, b) => parseFloat(b.price) - parseFloat(a.price)));
          break;
        default:
          setSortedProducts(productsCopy);
      }
    }
  }, [products, sortBy, sortedByRatingData, isLoadingSortedRating]);
  
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
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-600">No products found in this category</h2>
        <p className="mt-2 text-gray-500">Try browsing our other categories or visit the shop.</p>
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