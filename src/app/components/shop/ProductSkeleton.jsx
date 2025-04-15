export default function ProductSkeleton() {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.5rem', 
      overflow: 'hidden', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        height: '300px', 
        backgroundColor: '#f3f4f6',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <div style={{ 
          height: '24px', 
          width: '80%', 
          backgroundColor: '#f3f4f6', 
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
        <div style={{ 
          height: '60px', 
          backgroundColor: '#f3f4f6', 
          marginBottom: '1rem',
          borderRadius: '0.25rem',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
        <div style={{ 
          height: '20px', 
          width: '40%', 
          backgroundColor: '#f3f4f6',
          borderRadius: '0.25rem',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}></div>
      </div>
    </div>
  );
} 