/**
 * Input sanitization utilities for API routes
 */

/**
 * Sanitize and validate numeric ID
 * @param {string|number} id - The ID to sanitize
 * @returns {number|null} - Sanitized ID or null if invalid
 */
export function sanitizeNumericId(id) {
  if (!id) return null;
  
  const numId = parseInt(id, 10);
  
  // Check if it's a valid positive integer
  if (isNaN(numId) || numId <= 0 || numId > Number.MAX_SAFE_INTEGER) {
    return null;
  }
  
  return numId;
}

/**
 * Sanitize and validate slug
 * @param {string} slug - The slug to sanitize
 * @returns {string|null} - Sanitized slug or null if invalid
 */
export function sanitizeSlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  
  // Remove any characters that aren't alphanumeric, hyphens, or underscores
  const sanitized = slug.trim().toLowerCase().replace(/[^a-z0-9\-_]/g, '');
  
  // Check length constraints
  if (sanitized.length === 0 || sanitized.length > 200) {
    return null;
  }
  
  // Prevent double hyphens and leading/trailing hyphens
  const cleaned = sanitized
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');
  
  return cleaned;
}

/**
 * Sanitize and validate limit parameter
 * @param {string|number} limit - The limit to sanitize
 * @param {number} defaultLimit - Default limit if invalid
 * @param {number} maxLimit - Maximum allowed limit
 * @returns {number} - Sanitized limit
 */
export function sanitizeLimit(limit, defaultLimit = 20, maxLimit = 100) {
  if (!limit) return defaultLimit;
  
  const numLimit = parseInt(limit, 10);
  
  if (isNaN(numLimit) || numLimit <= 0) {
    return defaultLimit;
  }
  
  return Math.min(numLimit, maxLimit);
}

/**
 * Sanitize and validate page parameter
 * @param {string|number} page - The page to sanitize
 * @returns {number} - Sanitized page number
 */
export function sanitizePage(page) {
  if (!page) return 1;
  
  const numPage = parseInt(page, 10);
  
  if (isNaN(numPage) || numPage <= 0) {
    return 1;
  }
  
  return numPage;
}

/**
 * Sanitize order parameter
 * @param {string} order - The order to sanitize
 * @returns {string} - Sanitized order (asc or desc)
 */
export function sanitizeOrder(order) {
  if (!order || typeof order !== 'string') return 'desc';
  
  const lowerOrder = order.toLowerCase().trim();
  return lowerOrder === 'asc' ? 'asc' : 'desc';
}

/**
 * Sanitize orderby parameter for WooCommerce
 * @param {string} orderBy - The orderby parameter to sanitize
 * @param {string[]} allowedValues - Array of allowed values
 * @returns {string} - Sanitized orderby value
 */
export function sanitizeOrderBy(orderBy, allowedValues = ['date', 'id', 'title', 'menu_order', 'price']) {
  if (!orderBy || typeof orderBy !== 'string') return 'date';
  
  const sanitized = orderBy.toLowerCase().trim();
  return allowedValues.includes(sanitized) ? sanitized : 'date';
}

/**
 * Sanitize boolean parameter
 * @param {any} value - The value to convert to boolean
 * @returns {boolean} - Boolean value
 */
export function sanitizeBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

/**
 * Generic string sanitization
 * @param {string} str - String to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null} - Sanitized string or null if invalid
 */
export function sanitizeString(str, maxLength = 255) {
  if (!str || typeof str !== 'string') return null;
  
  // Trim and limit length
  const sanitized = str.trim().slice(0, maxLength);
  
  // Remove control characters and null bytes
  const cleaned = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  return cleaned.length > 0 ? cleaned : null;
}