'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProductReviews, useSubmitReview } from '@/app/hooks/useWooCommerce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Star } from 'lucide-react'; // For star icons
import { useQueryClient } from '@tanstack/react-query';

// Star Rating Display (similar to existing one in SingleProduct, but more generic)
function StarRatingDisplay({ rating, totalStars = 5, size = 18 }) {
  const fullStars = Math.round(rating);
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star 
            key={starValue} 
            size={size} 
            className={`mr-1 ${starValue <= fullStars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
          />
        );
      })}
    </div>
  );
}

// Interactive Star Rating Input for the form
function StarRatingInput({ rating, setRating, totalStars = 5, size = 24 }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={starValue}
            size={size}
            className={`mr-1 cursor-pointer transition-colors 
              ${(hoverRating || rating) >= starValue ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}
              ${hoverRating >= starValue ? 'transform scale-110' : ''}
            `}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(starValue)}
          />
        );
      })}
    </div>
  );
}

function ReviewCard({ review }) {
  // Assuming review object has: reviewer, date_created, rating, review (content)
  const reviewDate = review.date_created ? new Date(review.date_created).toLocaleDateString() : 'Date not available';
  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{review.reviewer || 'Anonymous'}</CardTitle>
          <StarRatingDisplay rating={review.rating || 0} />
        </div>
        <CardDescription>{reviewDate}</CardDescription>
      </CardHeader>
      <CardContent>
        <p dangerouslySetInnerHTML={{ __html: review.review || 'No content' }} />
      </CardContent>
    </Card>
  );
}

function ReviewForm({ productId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { mutate: submitReview, isLoading, isError, error } = useSubmitReview();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (rating === 0) {
      setFormError('Please select a rating.');
      return;
    }
    if (!reviewerName.trim() || !reviewerEmail.trim() || !reviewText.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(reviewerEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const reviewData = {
      product_id: parseInt(productId, 10),
      review: reviewText,
      reviewer: reviewerName,
      reviewer_email: reviewerEmail,
      rating: rating,
    };

    submitReview(reviewData, {
      onSuccess: (data) => {
        setFormSuccess('Review submitted successfully! It will appear after approval.');
        // Reset form
        setRating(0);
        setReviewerName('');
        setReviewerEmail('');
        setReviewText('');
        if (onSuccess) onSuccess(data);
      },
      onError: (submitError) => {
        setFormError(submitError.message || 'Failed to submit review. Please try again.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 p-4 border rounded-lg">
      <h3 className="text-xl font-semibold">Leave a Review</h3>
      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Your Rating *</label>
        <StarRatingInput rating={rating} setRating={setRating} />
      </div>
      <div>
        <label htmlFor="reviewerName" className="block text-sm font-medium text-gray-700">Name *</label>
        <Input id="reviewerName" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="reviewerEmail" className="block text-sm font-medium text-gray-700">Email *</label>
        <Input type="email" id="reviewerEmail" value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} required />
        <p className="text-xs text-gray-500 mt-1">Your email address will not be published.</p>
      </div>
      <div>
        <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700">Your Review *</label>
        <Textarea id="reviewText" value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={4} required />
      </div>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      {isError && !formError && <p className="text-sm text-red-600">{(error)?.message || 'An unexpected error occurred.'}</p>} {/* Display submission error from useMutation if not already handled by formError */}
      {formSuccess && <p className="text-sm text-green-600">{formSuccess}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

// Component to display review statistics and allow filtering
function ReviewStats({ stats, onSelectStar, currentFilter }) {
  if (!stats || stats.totalReviews === 0) {
    return null;
  }

  return (
    <div className="mb-8 p-4 border rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Review Summary</h3>
      <div className="flex items-center mb-4">
        <StarRatingDisplay rating={stats.averageRating} size={24} />
        <span className="ml-2 text-lg font-medium">{stats.averageRating.toFixed(1)} out of 5</span>
      </div>
      <p className="mb-4 text-sm text-gray-600">Based on {stats.totalReviews} review{stats.totalReviews === 1 ? '' : 's'}</p>
      
      <div className="space-y-1">
        {[5, 4, 3, 2, 1].map(star => {
          const count = stats.ratingCounts[star] || 0;
          const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
          const isCurrentFilter = currentFilter === star;
          return (
            <div 
              key={star} 
              className={`flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100 ${isCurrentFilter ? 'bg-gray-200 font-semibold' : ''}`}
              onClick={() => onSelectStar(star)}
            >
              <span className="text-sm w-12">{star} star{star === 1 ? '' : 's'}</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mx-2">
                <div 
                  className="bg-yellow-400 h-2.5 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-sm w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>
      {currentFilter !== null && (
        <Button variant="link" onClick={() => onSelectStar(null)} className="mt-4 p-0 h-auto text-sm">
          Show all reviews
        </Button>
      )}
    </div>
  );
}

export default function ProductReviewsSection({ productId }) {
  const queryClient = useQueryClient();
  const { data: reviewsData, isLoading, isError, error } = useProductReviews(productId);
  const [selectedStarFilter, setSelectedStarFilter] = useState(null); // For filtering reviews

  const reviews = reviewsData || [];

  // Calculate review statistics
  const reviewStats = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatingSum = 0;

    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingCounts[rating]++;
        totalRatingSum += review.rating; // Use original rating for sum for more precise average
      }
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? totalRatingSum / totalReviews : 0;

    return {
      totalReviews,
      averageRating,
      ratingCounts,
    };
  }, [reviews]);

  const handleSelectStarFilter = (star) => {
    setSelectedStarFilter(prevFilter => prevFilter === star ? null : star);
  };

  const filteredReviews = useMemo(() => {
    if (selectedStarFilter === null) {
      return reviews;
    }
    return reviews.filter(review => Math.round(review.rating) === selectedStarFilter);
  }, [reviews, selectedStarFilter]);

  const handleReviewSuccess = () => {
    // Refetch reviews after a new one is successfully submitted and approved (eventually)
    // The API might not show it immediately if it needs approval, so this provides optimistic update feel
    queryClient.invalidateQueries(['productReviews', productId]);
  };

  if (isLoading) return <p>Loading reviews...</p>;
  // Error display can be more nuanced, checking if error is an object with a message property
  if (isError) return <p>Error loading reviews: {typeof error === 'string' ? error : (error?.message || 'Unknown error')}</p>; 

  return (
    <div className="mt-12 py-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      <ReviewStats stats={reviewStats} onSelectStar={handleSelectStarFilter} currentFilter={selectedStarFilter} />

      {filteredReviews.length === 0 && selectedStarFilter !== null && (
        <p>No reviews match your filter. <Button variant="link" onClick={() => handleSelectStarFilter(null)} className="p-0 h-auto">Show all reviews</Button></p>
      )}
      {filteredReviews.length === 0 && selectedStarFilter === null && reviews.length > 0 && (
         <p>No reviews found for this filter.</p> // Should ideally not happen if reviews exist and filter is null
      )}
      {reviews.length === 0 && (
        <p>No reviews yet. Be the first to review this product!</p>
      )}
      {filteredReviews.length > 0 && (
         filteredReviews.map(review => (
          <ReviewCard key={review.id || review.date_created} review={review} />
        ))
      )}
      <ReviewForm productId={productId} onSuccess={handleReviewSuccess} />
    </div>
  );
} 