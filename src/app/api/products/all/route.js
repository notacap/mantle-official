import { withWooCommerceCache } from '@/app/lib/woocommerce-cache';

export const revalidate = 300; // Revalidate this route at most every 5 minutes (300 seconds)

/**
 * GET handler for all products
 * Uses the withWooCommerceCache HOF for consistent caching behavior
 */
export const GET = withWooCommerceCache({
  endpoint: 'products',
  defaultParams: {
    per_page: 20,
    page: 1,
    orderby: 'date',
    order: 'desc'
  },
  cacheTtl: 5 * 60 * 1000, // 5 minutes
  revalidate: 300,
  includePagination: true
}); 