import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Utility function to get combined rating data for products
// Special handling for product 5403 which combines reviews from products 140 and 5403

export async function getCombinedRatingData(productId) {
  if (productId !== 5403 && productId !== '5403') {
    // For regular products, return null (use default product data)
    return null;
  }

  try {
    // Fetch combined reviews for product 5403 (includes reviews from both 140 and 5403)
    const response = await fetch(`/api/product-reviews?product_id=5403`);
    
    if (!response.ok) {
      console.warn('Failed to fetch combined reviews for product 5403');
      return null;
    }

    const reviews = await response.json();
    
    if (!reviews || reviews.length === 0) {
      return {
        average_rating: 0,
        rating_count: 0
      };
    }

    // Calculate combined average rating and count
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / reviews.length;
    
    return {
      average_rating: averageRating,
      rating_count: reviews.length
    };
  } catch (error) {
    console.error('Error fetching combined rating data:', error);
    return null;
  }
}

// Hook to use combined rating data in components with React Query caching
export function useCombinedRating(product) {
  // Only use React Query for product 5403, otherwise return product data immediately
  const shouldFetch = product?.id === 5403 || product?.id === '5403';
  
  const { data: combinedRating, isLoading } = useQuery({
    queryKey: ['combinedRating', '5403'],
    queryFn: async () => {
      const response = await fetch('/api/product-reviews?product_id=5403');
      
      if (!response.ok) {
        console.warn('Failed to fetch combined reviews for product 5403');
        return null;
      }

      const reviews = await response.json();
      
      if (!reviews || reviews.length === 0) {
        return {
          average_rating: 0,
          rating_count: 0
        };
      }

      // Calculate combined average rating and count
      const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      const averageRating = totalRating / reviews.length;
      
      return {
        average_rating: averageRating,
        rating_count: reviews.length
      };
    },
    enabled: shouldFetch, // Only run query for product 5403
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  // Return combined rating if this is product 5403 and we have data
  if (shouldFetch) {
    if (isLoading || !combinedRating) {
      return {
        rating: product.average_rating || 0,
        count: product.rating_count || 0,
        loading: isLoading
      };
    }
    
    return {
      rating: combinedRating.average_rating,
      count: combinedRating.rating_count,
      loading: false
    };
  }

  // For all other products, return their original data
  return {
    rating: product?.average_rating || 0,
    count: product?.rating_count || 0,
    loading: false
  };
}