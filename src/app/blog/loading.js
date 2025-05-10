export default function BlogLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title Skeleton */}
      <div style={{
        height: '48px',
        width: '40%',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem',
        margin: '0 auto 3rem auto',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%'
      }}></div>

      {/* Featured Post Skeleton */}
      <div className="mb-16">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Image Skeleton */}
          <div style={{
            height: '384px', // h-96
            backgroundColor: '#e5e7eb',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%'
          }}></div>
          <div className="p-8">
            {/* Title Skeleton */}
            <div style={{
              height: '36px', 
              width: '70%', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '0.25rem', 
              marginBottom: '1rem',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%'
            }}></div>
            {/* Author Skeleton */}
            <div style={{
              height: '20px', 
              width: '30%', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '0.25rem', 
              marginBottom: '1rem',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%'
            }}></div>
            {/* Excerpt Skeleton */}
            {Array(3).fill(0).map((_, index) => (
              <div 
                key={index}
                style={{ 
                  height: '20px', 
                  width: index === 2 ? '80%' : '100%', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '0.25rem',
                  marginBottom: '0.75rem',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%'
                }}
              ></div>
            ))}
            {/* Read More Skeleton */}
            <div style={{
              height: '24px', 
              width: '100px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '0.25rem', 
              marginTop: '1.5rem',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%'
            }}></div>
          </div>
        </div>
      </div>

      {/* More Posts Title Skeleton */}
      <div style={{
        height: '36px',
        width: '30%',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem',
        margin: '0 auto 2rem auto',
        background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%'
      }}></div>

      {/* Grid for Other Posts Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Image Skeleton */}
            <div style={{
              height: '192px', // h-48
              backgroundColor: '#e5e7eb',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%'
            }}></div>
            <div className="p-6">
              {/* Title Skeleton */}
              <div style={{
                height: '28px', 
                width: '80%', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '0.25rem', 
                marginBottom: '0.75rem',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%'
              }}></div>
              {/* Author Skeleton */}
              <div style={{
                height: '16px', 
                width: '40%', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '0.25rem', 
                marginBottom: '0.75rem',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%'
              }}></div>
              {/* Excerpt Skeleton */}
              {Array(2).fill(0).map((_, j) => (
                <div 
                  key={j}
                  style={{ 
                    height: '16px', 
                    width: j === 1 ? '70%' : '100%', 
                    backgroundColor: '#f3f4f6', 
                    borderRadius: '0.25rem',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%'
                  }}
                ></div>
              ))}
              {/* Read More Skeleton */}
              <div style={{
                height: '20px', 
                width: '80px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '0.25rem', 
                marginTop: '1rem',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%'
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 