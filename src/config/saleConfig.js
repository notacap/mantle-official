/**
 * Sale Configuration
 *
 * This configuration controls all sale-related marketing across the site.
 * Toggle `enabled` to activate/deactivate the sale without code changes.
 *
 * Usage:
 * - Set `enabled: true` to activate the sale
 * - Update dates, messaging, and discount parameters as needed
 * - The sale will auto-disable after `endDate` even if `enabled` is true
 */

export const saleConfig = {
  // Master toggle - set to false to disable all sale marketing
  enabled: false,

  // Sale identity
  name: "Cyber Monday",
  badgeText: "CYBER MONDAY",

  // Sale timing (ISO 8601 format, UTC)
  // The sale will only show when current time is between these dates AND enabled is true
  startDate: "2025-12-02T06:00:00Z",
  endDate: "2025-12-08T06:00:00Z",

  // Discount configuration
  discount: 30, // Percentage off

  // Category configuration (slugs)
  triggerCategory: "pants",      // Buy this category...
  discountCategory: "tops",      // ...get discount on this category

  // Display names for messaging
  triggerCategoryName: "Pants",
  discountCategoryName: "Top",

  // Messaging templates
  messaging: {
    // Short tagline for banners
    tagline: "Buy Pants, Get a Top",

    // Hero section (specials page)
    heroHeadline: "Buy Pants, Get a Top",
    heroSubheadline: "Purchase any pair of pants and get 30% off any top. Premium tactical gear for professionals. Limited time only.",

    // Product page banner (when viewing trigger category product)
    triggerProductBanner: "Buy these pants, get any top",

    // Product page banner (when viewing discount category product)
    discountProductBanner: "Buy any pants, get this top",

    // Cross-promotion section on product pages
    crossPromoTitle: "Complete the Deal - Get a Top for",
    crossPromoTitleAlt: "Buy Pants & Get This Top for",
    crossPromoDescription: "Add these pants to your cart, then pick any top to save 30%!",
    crossPromoDescriptionAlt: "Add any pants to your cart and this top will be 30% off!",

    // Bottom CTA on specials page
    ctaTitle: "Don't Miss Out",
    ctaDescription: "Buy any pants and get 30% off any top. Discount applied automatically at checkout!",
  },

  // Navigation link configuration
  navLink: {
    text: "Cyber Monday",
    mobileText: "Cyber Monday Sale",
    href: "/specials",
  },

  // Specials page section headers
  sections: {
    step1: {
      badge: "Step 1",
      title: "Buy a Pair of Pants",
      description: "Choose from our premium tactical pants collection",
    },
    step2: {
      badge: "Step 2",
      title: "Get a Top for",
      description: "Add any top to your cart and the discount will be applied automatically",
    },
  },
};

/**
 * Helper function to check if the sale is currently active
 * Returns true only if:
 * 1. enabled is true
 * 2. Current time is after startDate
 * 3. Current time is before endDate
 */
export function isSaleActive() {
  if (!saleConfig.enabled) return false;

  const now = new Date().getTime();
  const startDate = new Date(saleConfig.startDate).getTime();
  const endDate = new Date(saleConfig.endDate).getTime();

  return now >= startDate && now < endDate;
}

/**
 * Helper function to get time remaining until sale ends
 * Returns object with days, hours, minutes, seconds
 * Returns null if sale is not active
 */
export function getTimeRemaining() {
  if (!isSaleActive()) return null;

  const now = new Date().getTime();
  const endDate = new Date(saleConfig.endDate).getTime();
  const difference = endDate - now;

  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
  };
}

/**
 * Check if a product is eligible for the sale based on its categories
 * @param {Array} productCategories - Array of category objects with slug property
 * @returns {Object} - { isEligible, isTrigger, isDiscount }
 */
export function checkProductEligibility(productCategories) {
  if (!productCategories || !Array.isArray(productCategories)) {
    return { isEligible: false, isTrigger: false, isDiscount: false };
  }

  const slugs = productCategories.map(cat => cat.slug?.toLowerCase());
  const isTrigger = slugs.includes(saleConfig.triggerCategory);
  const isDiscount = slugs.includes(saleConfig.discountCategory);

  return {
    isEligible: isTrigger || isDiscount,
    isTrigger,
    isDiscount,
  };
}
