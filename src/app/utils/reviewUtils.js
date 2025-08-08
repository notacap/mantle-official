// Cache for product ratings to avoid repeated API calls
const ratingCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function getProductRating(productId) {
  const cacheKey = `rating_${productId}`;
  const now = Date.now();
  
  // Check cache first
  if (ratingCache.has(cacheKey)) {
    const cached = ratingCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    // Remove stale cache entry
    ratingCache.delete(cacheKey);
  }
  
  try {
    const response = await fetch(`/api/product-reviews?product_id=${productId}`);
    if (!response.ok) {
      const result = { averageRating: 0, totalCount: 0 };
      // Cache the result
      ratingCache.set(cacheKey, { data: result, timestamp: now });
      return result;
    }
    
    const reviews = await response.json();
    if (!reviews || reviews.length === 0) {
      const result = { averageRating: 0, totalCount: 0 };
      // Cache the result
      ratingCache.set(cacheKey, { data: result, timestamp: now });
      return result;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + parseFloat(review.rating || 0), 0);
    const averageRating = totalRating / reviews.length;
    
    const result = {
      averageRating: averageRating,
      totalCount: reviews.length
    };
    
    // Cache the result
    ratingCache.set(cacheKey, { data: result, timestamp: now });
    return result;
  } catch (error) {
    console.error(`Error fetching rating for product ${productId}:`, error);
    const result = { averageRating: 0, totalCount: 0 };
    // Cache even error results to avoid repeated failed requests
    ratingCache.set(cacheKey, { data: result, timestamp: now });
    return result;
  }
}

export async function sortProductsByRating(products) {
  const productsWithRatings = await Promise.all(
    products.map(async (product) => {
      const rating = await getProductRating(product.id);
      return {
        ...product,
        calculatedRating: rating.averageRating,
        calculatedReviewCount: rating.totalCount
      };
    })
  );
  
  return productsWithRatings.sort((a, b) => {
    if (b.calculatedRating !== a.calculatedRating) {
      return b.calculatedRating - a.calculatedRating;
    }
    return b.calculatedReviewCount - a.calculatedReviewCount;
  });
}