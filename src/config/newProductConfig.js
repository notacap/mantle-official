/**
 * New Product Marketing Configuration
 *
 * This configuration controls all new product marketing across the site.
 * Toggle `enabled` to activate/deactivate new product highlighting without code changes.
 *
 * Usage:
 * - Set `enabled: true` to activate new product marketing
 * - Add product IDs to the `products` array
 * - Optionally set `endDate` for time-limited "new" status
 * - The marketing will auto-disable after `endDate` if set
 */

export const newProductConfig = {
  // Master toggle - set to false to disable all new product marketing
  enabled: true,

  // Products to feature as "new" (by WooCommerce product ID)
  products: [
    {
      id: 6194,
      featured: true, // Show prominently on homepage banner
    },
  ],

  // Badge configuration
  badgeText: "NEW",
  badgeStyle: "animated", // "default" or "animated" (pulsing effect)

  // Optional: Auto-expire new product status after this date (ISO 8601 format, UTC)
  // Set to null for no expiration (manual control only)
  endDate: null,

  // Messaging templates
  messaging: {
    // Homepage banner
    bannerHeadline: "Just Dropped",
    bannerSubheadline: "Be the first to gear up with our latest arrival",
    bannerCta: "Shop Now",

    // Product page banner
    productBanner: "New Arrival",
    productSubtext: "Just released — be among the first to try it",
  },

  // Styling (brand colors)
  colors: {
    badgeBackground: "linear-gradient(135deg, #9CB24D 0%, #8aa542 100%)",
    badgeText: "#ffffff",
    bannerBackground: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    accentColor: "#9CB24D",
  },
};

/**
 * Helper function to check if new product marketing is currently active
 * Returns true only if:
 * 1. enabled is true
 * 2. Current time is before endDate (if endDate is set)
 */
export function isNewProductMarketingActive() {
  if (!newProductConfig.enabled) return false;

  if (newProductConfig.endDate) {
    const now = new Date().getTime();
    const endDate = new Date(newProductConfig.endDate).getTime();
    return now < endDate;
  }

  return true;
}

/**
 * Check if a product is marked as "new" by its ID
 * @param {number|string} productId - The product ID to check
 * @returns {Object} - { isNew, isFeatured }
 */
export function isNewProduct(productId) {
  if (!isNewProductMarketingActive()) {
    return { isNew: false, isFeatured: false };
  }

  const numericId = parseInt(productId, 10);
  const productEntry = newProductConfig.products.find(p => p.id === numericId);

  return {
    isNew: !!productEntry,
    isFeatured: productEntry?.featured ?? false,
  };
}

/**
 * Get all featured new products (for homepage display)
 * @returns {Array} - Array of product IDs marked as featured
 */
export function getFeaturedNewProductIds() {
  if (!isNewProductMarketingActive()) {
    return [];
  }

  return newProductConfig.products
    .filter(p => p.featured)
    .map(p => p.id);
}

/**
 * Get all new product IDs
 * @returns {Array} - Array of all new product IDs
 */
export function getAllNewProductIds() {
  if (!isNewProductMarketingActive()) {
    return [];
  }

  return newProductConfig.products.map(p => p.id);
}
