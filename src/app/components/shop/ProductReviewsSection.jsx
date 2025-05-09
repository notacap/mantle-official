'use client';

import { useState, useEffect } from 'react';
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

export default function ProductReviewsSection({ productId }) {
  const queryClient = useQueryClient();
  const { data: reviewsData, isLoading, isError, error } = useProductReviews(productId);

  const handleReviewSuccess = () => {
    // Refetch reviews after a new one is successfully submitted and approved (eventually)
    // The API might not show it immediately if it needs approval, so this provides optimistic update feel
    queryClient.invalidateQueries(['productReviews', productId]);
  };

  if (isLoading) return <p>Loading reviews...</p>;
  // Error display can be more nuanced, checking if error is an object with a message property
  if (isError) return <p>Error loading reviews: {typeof error === 'string' ? error : (error?.message || 'Unknown error')}</p>; 

  const reviews = reviewsData || []; // reviewsData could be an array of review objects

  return (
    <div className="mt-12 py-8 border-t">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review this product!</p>
      ) : (
        reviews.map(review => (
          <ReviewCard key={review.id || review.date_created} review={review} /> // Ensure review has a unique key like id
        ))
      )}
      <ReviewForm productId={productId} onSuccess={handleReviewSuccess} />
    </div>
  );
} 