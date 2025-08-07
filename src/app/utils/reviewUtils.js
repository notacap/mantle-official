export async function getProductRating(productId) {
  try {
    if (productId.toString() === '5403') {
      const response = await fetch(`/api/product-reviews?product_id=${productId}`);
      if (!response.ok) {
        return { averageRating: 0, totalCount: 0 };
      }
      
      const combinedReviews = await response.json();
      if (!combinedReviews || combinedReviews.length === 0) {
        return { averageRating: 0, totalCount: 0 };
      }
      
      const totalRating = combinedReviews.reduce((sum, review) => sum + parseFloat(review.rating || 0), 0);
      const averageRating = totalRating / combinedReviews.length;
      
      return {
        averageRating: averageRating,
        totalCount: combinedReviews.length
      };
    } else {
      const response = await fetch(`/api/product-reviews?product_id=${productId}`);
      if (!response.ok) {
        return { averageRating: 0, totalCount: 0 };
      }
      
      const reviews = await response.json();
      if (!reviews || reviews.length === 0) {
        return { averageRating: 0, totalCount: 0 };
      }
      
      const totalRating = reviews.reduce((sum, review) => sum + parseFloat(review.rating || 0), 0);
      const averageRating = totalRating / reviews.length;
      
      return {
        averageRating: averageRating,
        totalCount: reviews.length
      };
    }
  } catch (error) {
    console.error(`Error fetching rating for product ${productId}:`, error);
    return { averageRating: 0, totalCount: 0 };
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