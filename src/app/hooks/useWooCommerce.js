'use client';

import { useQuery } from '@tanstack/react-query';
import { getBaseUrl } from '@/app/services/woocommerce';

// Fetch products with React Query
export function useProducts(limit = 12, page = 1) {
  return useQuery({
    queryKey: ['products', { limit, page }],
    queryFn: async () => {
      const url = new URL('/api/products/all', getBaseUrl());
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
      const url = new URL('/api/products/category', getBaseUrl());
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
      const url = new URL('/api/products/tag', getBaseUrl());
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
      const url = new URL('/api/categories', getBaseUrl());
      
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
      const url = new URL('/api/collections', getBaseUrl());
      
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
      const url = new URL('/api/products', getBaseUrl());
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