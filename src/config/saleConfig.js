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
  enabled: true,

  // Sale identity
  name: "Black Friday",
  badgeText: "BLACK FRIDAY",

  // Sale timing (ISO 8601 format, UTC)
  // The sale will only show when current time is between these dates AND enabled is true.
  // Times match the WordPress store timezone (America/Denver, UTC-7 in winter), which is
  // what the BOGO plugin uses, so the marketing and the discount end together.
  startDate: "2026-11-23T07:00:00Z", // Nov 23, 12:00 AM MST
  endDate: "2026-12-02T07:00:00Z", // Dec 2, 12:00 AM MST (end of Dec 1)

  // "category": straight % off everything in discountCategory
  // "cross-category": buy from triggerCategory, get % off discountCategory
  saleType: "category",

  // Discount configuration.
  // MESSAGING ONLY: the actual discount is the deal in WooCommerce > BOGO Deals.
  discount: 30, // Percentage off

  // Category configuration (slugs)
  triggerCategory: null, // Only used by "cross-category" sales
  discountCategory: "outerwear",

  // Display names for messaging
  triggerCategoryName: null, // Only used by "cross-category" sales
  discountCategoryName: "Outerwear",

  // Messaging templates. Items marked (+ discount) are followed by "{discount}% OFF".
  messaging: {
    // Short tagline for banners (+ discount)
    tagline: "All Outerwear",

    // Hero section (specials page)
    heroHeadline: "All Outerwear", // (+ discount)
    heroSubheadline: "Save 30% on every piece of Mantle outerwear. No code needed: the discount is applied automatically in your cart. Ends December 1.",

    // Product page banner, trigger category product (+ discount, "cross-category" only)
    triggerProductBanner: "",

    // Product page banner, discount category product (+ discount)
    discountProductBanner: "All outerwear",

    // Promo section on product pages. The non-Alt versions show on trigger
    // category products ("cross-category" only). Titles are (+ discount).
    crossPromoTitle: "",
    crossPromoTitleAlt: "All Outerwear Is",
    crossPromoDescription: "",
    crossPromoDescriptionAlt: "No code needed. Your discount is applied automatically in the cart.",

    // Bottom CTA on specials page
    ctaTitle: "Don't Miss Out",
    ctaDescription: "30% off all outerwear ends December 1. Discount applied automatically in your cart.",
  },

  // Navigation link configuration
  navLink: {
    text: "Black Friday",
    mobileText: "Black Friday Sale",
    href: "/specials",
  },

  // Specials page section headers
  sections: {
    // Trigger category products ("cross-category" only)
    step1: {
      badge: "Step 1",
      title: "",
      description: "",
    },
    // Discounted products
    step2: {
      badge: "On Sale",
      title: "All Outerwear", // (+ discount)
      description: "Prices shown are before the discount. 30% comes off automatically in your cart.",
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
 * Whether the sale requires buying from one category to discount another
 */
export function isCrossCategorySale() {
  return saleConfig.saleType === "cross-category";
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
  const isTrigger = isCrossCategorySale() && slugs.includes(saleConfig.triggerCategory);
  const isDiscount = slugs.includes(saleConfig.discountCategory);

  return {
    isEligible: isTrigger || isDiscount,
    isTrigger,
    isDiscount,
  };
}
