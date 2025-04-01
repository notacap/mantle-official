/**
 * WooCommerce API service
 * Handles fetching products and other data from the WooCommerce API via our internal API routes
 */

// Helper function to get base URL
function getBaseUrl() {
    // For server-side rendering, use environment variable or default to localhost
    if (typeof window === 'undefined') {
      return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    }
    // For client-side, use window.location.origin
    return window.location.origin;
  }
  
  /**
   * Fetch featured products from the internal API
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Object>} - Object with products array and isFeatured flag
   */
  export async function getFeaturedProducts(limit = 8) {
    try {
      // Use our internal API route
      const url = new URL('/api/products/featured', getBaseUrl());
      
      // Add limit parameter
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch featured products: ${response.status}`);
      }
      
      const data = await response.json();
      return data; // Returns { products: [...], isFeatured: boolean }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return { products: [], isFeatured: false };
    }
  }
  
  /**
   * Fetch regular products from the internal API
   * @param {number} limit - Number of products to fetch
   * @param {number} page - Page number for pagination
   * @returns {Promise<Array>} - Array of product objects
   */
  export async function getProducts(limit = 12, page = 1) {
    try {
      // Use our internal API route
      const url = new URL('/api/products/all', getBaseUrl());
      
      // Add parameters
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('page', page.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      return data.products || []; // Return just the products array
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
  
  /**
   * Fetch products by category from the internal API
   * @param {number} categoryId - Category ID to fetch products for
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Array>} - Array of product objects
   */
  export async function getProductsByCategory(categoryId, limit = 8) {
    try {
      // Use our internal API route
      const url = new URL('/api/products/category', getBaseUrl());
      
      // Add query parameters
      url.searchParams.append('category', categoryId.toString());
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products by category: ${response.status}`);
      }
      
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
  }
  
  /**
   * Fetch a single product from the internal API
   * @param {number} productId - Product ID to fetch
   * @returns {Promise<Object>} - Product object
   */
  export async function getProduct(productId) {
    try {
      // Use our internal API route
      const url = new URL('/api/products', getBaseUrl());
      
      // Add query parameters
      url.searchParams.append('id', productId.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }
      
      const product = await response.json();
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }
  
  /**
   * Format price with currency symbol
   * @param {string} price - Price as string
   * @param {string} currencySymbol - Currency symbol (default: $)
   * @returns {string} - Formatted price
   */
  export function formatPrice(price, currencySymbol = '$') {
    if (!price) return `${currencySymbol}0.00`;
    
    // Convert to number and format with 2 decimal places
    const numPrice = parseFloat(price);
    return `${currencySymbol}${numPrice.toFixed(2)}`;
  }
  
  /**
   * Extract the first image URL from a product
   * @param {Object} product - Product object
   * @returns {string} - Image URL
   */
  export function getProductImageUrl(product) {
    // Local fallback images
    const fallbackImages = [
      '/images/DSCF1858.jpg',
      '/images/DSCF4564-scaled.jpg',
      '/images/DSCF6361-scaled.jpg',
      '/images/DSCF4744-scaled-e1608145214695.jpg'
    ];
    
    // Random fallback image
    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    
    if (!product || !product.images || !product.images.length) {
      return randomFallback;
    }
    
    const imageUrl = product.images[0].src;
    return imageUrl || randomFallback;
  }
  
  /**
   * Extract the second image URL from a product, or a different image if only one exists
   * @param {Object} product - Product object
   * @returns {string} - Image URL
   */
  export function getProductSecondaryImageUrl(product) {
    // Local fallback images
    const fallbackImages = [
      '/images/DSCF1858.jpg',
      '/images/DSCF4564-scaled.jpg',
      '/images/DSCF6361-scaled.jpg',
      '/images/DSCF4744-scaled-e1608145214695.jpg'
    ];
    
    // Random fallback image (different from the one used in getProductImageUrl)
    const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    
    if (!product || !product.images || !product.images.length) {
      return randomFallback;
    }
    
    // If there's more than one image, use the second image
    if (product.images.length > 1) {
      const imageUrl = product.images[1].src;
      if (imageUrl) {
        return imageUrl;
      }
    }
    
    // If there's only one image or second image is invalid, use a different fallback
    return randomFallback;
  }
  
  /**
   * Fetch products by tag from the internal API
   * @param {string} tag - Tag slug to fetch products for
   * @param {number} limit - Number of products to fetch
   * @returns {Promise<Array>} - Array of product objects
   */
  export async function getProductsByTag(tag, limit = 8) {
    try {
      // Use our internal API route
      const url = new URL('/api/products/tag', getBaseUrl());
      
      // Add query parameters
      url.searchParams.append('tag', tag);
      url.searchParams.append('limit', limit.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products by tag: ${response.status}`);
      }
      
      const products = await response.json();
      return products;
    } catch (error) {
      console.error('Error fetching products by tag:', error);
      return [];
    }
  } 