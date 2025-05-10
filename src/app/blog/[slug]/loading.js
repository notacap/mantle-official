export default function SinglePostLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
        <div style={{ height: '16px', width: '50px', backgroundColor: '#e5e7eb', borderRadius: '0.25rem' }}></div>
        <span>/</span>
        <div style={{ height: '16px', width: '70px', backgroundColor: '#e5e7eb', borderRadius: '0.25rem' }}></div>
        <span>/</span>
        <div style={{ height: '16px', width: '120px', backgroundColor: '#e5e7eb', borderRadius: '0.25rem' }}></div>
      </div>

      {/* Post Header Skeleton */}
      <header className="mb-8">
        {/* Title Skeleton */}
        <div style={{
          height: '48px', 
          width: '80%', 
          backgroundColor: '#e0e0e0', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
        }}></div>
        {/* Meta Skeleton (Date/Author) */}
        <div style={{
          height: '20px', 
          width: '40%', 
          backgroundColor: '#e5e7eb', 
          borderRadius: '0.25rem',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
        }}></div>
      </header>

      {/* Featured Image Skeleton */}
      <div style={{
        height: '400px', 
        backgroundColor: '#e0e0e0', 
        borderRadius: '0.5rem', 
        marginBottom: '2rem',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
      }}></div>

      {/* Post Content Skeleton */}
      <div className="space-y-4">
        {Array(5).fill(0).map((_, index) => (
          <div key={index}>
            <div style={{
              height: '20px', 
              width: '100%', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '0.25rem', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
            }}></div>
            <div style={{
              height: '20px', 
              width: '90%', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '0.25rem', 
              marginBottom: '0.5rem',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
            }}></div>
            <div style={{
              height: '20px', 
              width: index === 4 ? '60%' : '95%', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '0.25rem',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
            }}></div>
          </div>
        ))}
      </div>
    </div>
  );
} 