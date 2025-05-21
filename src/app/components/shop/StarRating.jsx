'use client';

// Star rating component
export default function StarRating({ rating, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star} 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill={star <= Math.round(rating) ? '#F9BF3B' : 'none'}
            stroke={star <= Math.round(rating) ? '#F9BF3B' : '#CBD5E0'}
            strokeWidth="2"
            style={{ marginRight: '2px' }}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      <span style={{ color: '#4A5568', fontSize: '0.875rem' }}>
        {count ? `(${count} reviews)` : ''}
      </span>
    </div>
  );
} 