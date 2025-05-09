'use client';

import { useQuery, useMutation } from '@tanstack/react-query';

// Helper to construct API URLs for client-side hooks
function getClientSideBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for environments where window is not defined (should not happen in client hooks but good practice)
  // This might need adjustment if these hooks were ever used server-side directly, but they are client hooks.
  return ''; // Or a configured public URL if available via process.env
}

// Fetch products with React Query
export function useProducts(limit = 12, page = 1) {
  return useQuery({
    queryKey: ['products', { limit, page }],
    queryFn: async () => {
      const baseUrl = getClientSideBaseUrl();
      const url = new URL('/api/products/all', baseUrl);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('page', page.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      return response.json();
    },
  });
}

// Fetch products by category with React Query
export function useProductsByCategory(categoryId, limit = 8) {
  return useQuery({
    queryKey: ['products', 'category', { categoryId, limit }],
    queryFn: async () => {
      const baseUrl = getClientSideBaseUrl();
      const url = new URL('/api/products/category', baseUrl);
      url.searchParams.append('category', categoryId.toString());
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch products by category');
      }
      
      return response.json();
    },
    // Don't fetch if no categoryId is provided
    enabled: !!categoryId,
  });
}

// Fetch products by tag/collection with React Query
export function useProductsByTag(tag, limit = 8) {
  return useQuery({
    queryKey: ['products', 'tag', { tag, limit }],
    queryFn: async () => {
      const baseUrl = getClientSideBaseUrl();
      const url = new URL('/api/products/tag', baseUrl);
      url.searchParams.append('tag', tag);
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch products by tag');
      }
      
      return response.json();
    },
    // Don't fetch if no tag is provided
    enabled: !!tag,
  });
}

// Fetch categories with React Query
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const baseUrl = getClientSideBaseUrl();
      const url = new URL('/api/categories', baseUrl);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      return response.json();
    },
  });
}

// Fetch collections/tags with React Query
export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const baseUrl = getClientSideBaseUrl();
      const url = new URL('/api/collections', baseUrl);
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      
      return response.json();
    },
  });
}

// Fetch a single product with React Query
export function useProduct(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const baseUrl = getClientSideBaseUrl();
      const url = new URL('/api/products', baseUrl);
      url.searchParams.append('id', productId.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      return response.json();
    },
    // Don't fetch if no productId is provided
    enabled: !!productId,
  });
}

// Fetch product reviews with React Query
export function useProductReviews(productId) {
  return useQuery({
    queryKey: ['productReviews', productId],
    queryFn: async () => {
      const baseUrl = getClientSideBaseUrl();
      const url = new URL('/api/product-reviews', baseUrl);
      url.searchParams.append('product_id', productId.toString());
      // The 'status=approved' filter will be handled by the internal API route
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch product reviews');
      }
      
      return response.json();
    },
    enabled: !!productId, // Only fetch if productId is available
  });
}

// Submit a new product review
export function useSubmitReview() {
  return useMutation({
    mutationFn: async (reviewData) => {
      // reviewData should include: product_id, review, reviewer, reviewer_email, rating
      const baseUrl = getClientSideBaseUrl();
      const url = new URL('/api/submit-review', baseUrl);
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        // Attempt to parse error message from response body
        const errorBody = await response.json().catch(() => ({ message: 'Failed to submit review' }));
        throw new Error(errorBody.message || 'Failed to submit review');
      }
      
      return response.json(); // Return the response from the API (e.g., the created review object)
    },
    // Optional: onSuccess, onError, onSettled callbacks can be added here
    // For example, to refetch reviews after a successful submission:
    // onSuccess: () => {
    //   queryClient.invalidateQueries(['productReviews', reviewData.product_id]);
    // }
  });
} 