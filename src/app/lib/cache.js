// Simple in-memory cache for server components
const cache = new Map();

// Default TTL (time to live) for cache entries in milliseconds
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Gets a value from the cache
 * @param {string} key - The cache key
 * @returns {any|null} - The cached value or null if not found
 */
function get(key) {
  if (!cache.has(key)) return null;
  
  const { value, expiry } = cache.get(key);
  
  // Check if the cache entry has expired
  if (expiry < Date.now()) {
    cache.delete(key);
    return null;
  }
  
  return value;
}

/**
 * Sets a value in the cache
 * @param {string} key - The cache key
 * @param {any} value - The value to cache
 * @param {number} ttl - Time to live in milliseconds
 */
function set(key, value, ttl = DEFAULT_TTL) {
  const expiry = Date.now() + ttl;
  cache.set(key, { value, expiry });
}

/**
 * Fetches data with caching
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} ttl - Cache TTL in milliseconds
 * @returns {Promise<any>} - The response data
 */
export async function fetchWithCache(url, options = {}, ttl = DEFAULT_TTL) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  
  // Try to get from cache first
  const cachedData = get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Otherwise fetch fresh data
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Fetch error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the result
  set(cacheKey, data, ttl);
  
  return data;
}

/**
 * Retrieves headers from a response
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - The response headers
 */
export async function getResponseHeaders(url, options = {}) {
  const response = await fetch(url, { 
    method: 'HEAD',
    ...options 
  });
  
  if (!response.ok) {
    throw new Error(`Header fetch error: ${response.status}`);
  }
  
  // Convert headers to an object
  const headers = {};
  for (const [key, value] of response.headers.entries()) {
    headers[key] = value;
  }
  
  return headers;
}

/**
 * Clears the entire cache or a specific entry
 * @param {string} key - Optional specific key to clear
 */
export function clearCache(key = null) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
} 