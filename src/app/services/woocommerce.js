/**
 * WooCommerce API service
 * Handles fetching products and other data from the WooCommerce API via our internal API routes
 */

// Helper function to get base URL
function getBaseUrl() {
    // For server-side rendering, use environment variable or default to localhost
    if (typeof window === 'undefined') {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      console.log('[ServService-Side getBaseUrl] NEXT_PUBLIC_SITE_URL:', siteUrl); // LOG
      // It's crucial that siteUrl is correctly set in Vercel for production
      if (!siteUrl) {
        console.error('[Server-Side getBaseUrl] ERROR: NEXT_PUBLIC_SITE_URL is not set! Falling back to localhost, which is likely incorrect for production.');
        return 'http://localhost:3000'; 
      }
      return siteUrl;
    }
    // For client-side, use window.location.origin
    console.log('[Client-Side getBaseUrl] window.location.origin:', window.location.origin);
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
  export async function getProducts(limit = 20, page = 1) {
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
      // Check if we have a valid tag
      if (!tag) {
        console.error('No tag provided to getProductsByTag');
        return [];
      }
      
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
  
  /**
   * Fetch all collections (tags) from the internal API
   * @param {number} limit - Number of collections to fetch
   * @param {number} page - Page number for pagination
   * @returns {Promise<Object>} - Object with collections array and pagination info
   */
  export async function getCollections(limit = 100, page = 1) {
    const constructedUrlObj = new URL('/api/collections', getBaseUrl());
    const constructedUrl = constructedUrlObj.toString();
    console.log(`[Service getCollections] Attempting to fetch from: ${constructedUrl}`); // LOG
    try {
      // Use our internal API route
      const url = new URL('/api/collections', getBaseUrl());
      
      // Add parameters
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('page', page.toString());
      
      const response = await fetch(url.toString());
      console.log(`[Service getCollections] Response status from ${constructedUrl}: ${response.status}`); // LOG
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Service getCollections] Failed response from ${constructedUrl}: ${response.status}, ${errorText}`); // LOG
        throw new Error(`Failed to fetch collections: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[Service getCollections] Data received from ${constructedUrl} (first 200 chars):`, JSON.stringify(data).substring(0,200)); // LOG
      return data; // Returns { collections: [...], pagination: {...} }
    } catch (error) {
      console.error(`[Service getCollections] Catch block error for ${constructedUrl}:`, error); // LOG
      return { collections: [], pagination: { total: 0, totalPages: 0, currentPage: 1, perPage: limit } };
    }
  }
  
  /**
   * Fetch a single collection (tag) from the internal API
   * @param {number} collectionId - Collection ID to fetch
   * @returns {Promise<Object>} - Collection object
   */
  export async function getCollection(collectionId) {
    try {
      // Use our internal API route
      const url = new URL('/api/collections/single', getBaseUrl());
      
      // Add query parameters
      url.searchParams.append('id', collectionId.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch collection: ${response.status}`);
      }
      
      const collection = await response.json();
      return collection;
    } catch (error) {
      console.error('Error fetching collection:', error);
      return null;
    }
  }
  
  /**
   * Fetch all categories from the internal API
   * @param {number} limit - Number of categories to fetch
   * @param {number} page - Page number for pagination
   * @param {string} orderby - Field to order by (default: name)
   * @param {string} order - Order direction (default: asc)
   * @returns {Promise<Object>} - Object with categories array and pagination info
   */
  export async function getCategories(limit = 100, page = 1, orderby = 'name', order = 'asc') {
    const constructedUrlObj = new URL('/api/categories', getBaseUrl());
    const constructedUrl = constructedUrlObj.toString();
    console.log(`[Service getCategories] Attempting to fetch from: ${constructedUrl}`); // LOG
    try {
      // Use our internal API route
      const url = new URL('/api/categories', getBaseUrl());
      
      // Add parameters
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('page', page.toString());
      url.searchParams.append('orderby', orderby);
      url.searchParams.append('order', order);
      
      const response = await fetch(url.toString());
      console.log(`[Service getCategories] Response status from ${constructedUrl}: ${response.status}`); // LOG
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Service getCategories] Failed response from ${constructedUrl}: ${response.status}, ${errorText}`); // LOG
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[Service getCategories] Data received from ${constructedUrl} (first 200 chars):`, JSON.stringify(data).substring(0,200)); // LOG
      return data; // Returns { categories: [...], pagination: {...} }
    } catch (error) {
      console.error(`[Service getCategories] Catch block error for ${constructedUrl}:`, error); // LOG
      return { categories: [], pagination: { total: 0, totalPages: 0, currentPage: 1, perPage: limit } };
    }
  }
  
  /**
   * Fetch a single category from the internal API
   * @param {number} categoryId - Category ID to fetch
   * @returns {Promise<Object>} - Category object
   */
  export async function getCategory(categoryId) {
    try {
      // Use our internal API route
      const url = new URL('/api/categories/single', getBaseUrl());
      
      // Add query parameters
      url.searchParams.append('id', categoryId.toString());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch category: ${response.status}`);
      }
      
      const category = await response.json();
      return category;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }
  
  /**
   * Fetch category tree from the internal API
   * @returns {Promise<Array>} - Array of root categories with children
   */
  export async function getCategoryTree() {
    try {
      // Use our internal API route
      const url = new URL('/api/categories/tree', getBaseUrl());
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch category tree: ${response.status}`);
      }
      
      const data = await response.json();
      return data.categoryTree || [];
    } catch (error) {
      console.error('Error fetching category tree:', error);
      return [];
    }
  } 