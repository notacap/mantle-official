import { withWooCommerceCache, createProductFallback } from '@/app/lib/woocommerce-cache';

export const revalidate = 300; // Revalidate this route every 5 minutes

/**
 * GET handler for featured products
 * Uses the withWooCommerceCache HOF with fallback to regular products
 */
export const GET = withWooCommerceCache({
  endpoint: 'products',
  defaultParams: {
    featured: 'true',
    per_page: 8
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
  revalidate: 300,
  includePagination: false,
  transform: (products) => ({
    products: products,
    isFeatured: true
  }),
  fallback: createProductFallback({
    params: {
      per_page: 8
    },
    transform: (products) => ({
      products: products,
      isFeatured: false
    })
  })
}); 