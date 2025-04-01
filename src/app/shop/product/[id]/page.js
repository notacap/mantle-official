import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  getProduct, 
  getProductImageUrl, 
  formatPrice 
} from '../../../services/woocommerce';
import ProductActions from './ProductActions';

// Star rating component
function StarRating({ rating, count }) {
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

// Function to safely parse product attributes
function getProductAttributes(product) {
  if (!product || !product.attributes) return { colors: [], sizes: [] };
  
  const colors = product.attributes.find(attr => 
    attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colours')?.options || [];
  
  const sizes = product.attributes.find(attr => 
    attr.name.toLowerCase() === 'size')?.options || [];
  
  return { colors, sizes };
}

// Server component to fetch and display product
export default async function ProductPage({ params }) {
  const { id } = params;
  const product = await getProduct(id);
  
  if (!product || product.error) {
    notFound();
  }
  
  const { colors, sizes } = getProductAttributes(product);
  const rating = product.average_rating || 0;
  const reviewCount = product.rating_count || 0;
  
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '4rem 1rem',
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: '2rem',
        '@media (min-width: 768px)': {
          gridTemplateColumns: '1fr 1fr'
        }
      }}>
        {/* Product Image */}
        <div style={{ 
          position: 'relative', 
          height: '500px',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          overflow: 'hidden',
        }}>
          <Image
            src={getProductImageUrl(product)}
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        
        {/* Product Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {product.name}
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <StarRating rating={rating} count={reviewCount} />
          </div>
          
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9CB24D' }}>
            {formatPrice(product.price)}
          </p>
          
          <div dangerouslySetInnerHTML={{ __html: product.description }} 
            style={{ color: '#4b5563', lineHeight: '1.5' }} />
          
          {/* Client Component for interactive product actions */}
          <ProductActions 
            productId={product.id}
            price={product.price}
            sizes={sizes} 
            colors={colors} 
          />
        </div>
      </div>
    </div>
  );
} 