'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductImageUrl, formatPrice } from '@/app/services/woocommerce';
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
  if (!product || !product.attributes) return { colors: [], sizes: [], colorOptions: [], sizeOptions: [] };
  
  const colorAttribute = product.attributes.find(attr => 
    attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colours');
  
  const sizeAttribute = product.attributes.find(attr => 
    attr.name.toLowerCase() === 'size');
  
  const colors = colorAttribute?.options || [];
  const sizes = sizeAttribute?.options || [];
  
  // Extract attribute IDs for fetching terms
  const colorAttributeId = colorAttribute?.id;
  const sizeAttributeId = sizeAttribute?.id;
  
  return { 
    colors, 
    sizes, 
    colorAttributeId, 
    sizeAttributeId 
  };
}

// Breadcrumb navigation component
function Breadcrumbs({ product, categories }) {
  // Find the first category of the product
  let category = null;
  if (product.categories && product.categories.length > 0) {
    const categoryId = product.categories[0].id;
    category = categories.find(cat => cat.id === categoryId);
  }

  return (
    <div className="text-sm text-gray-500 mb-6">
      <Link href="/" className="hover:underline">Home</Link> {' / '}
      <Link href="/shop" className="hover:underline">Shop</Link>
      {category && (
        <>
          {' / '}
          <Link 
            href={`/categories/${category.slug}`} 
            className="hover:underline"
          >
            {category.name}
          </Link>
        </>
      )}
      {' / '}
      <span className="font-medium text-gray-700">{product.name}</span>
    </div>
  );
}

export default function SingleProduct({ productId }) {
  // Fetch product data
  const { 
    data: product, 
    isLoading: isLoadingProduct, 
    error: productError 
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const url = new URL('/api/products', window.location.origin);
      url.searchParams.append('id', productId.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      return response.json();
    },
    enabled: !!productId,
  });
  
  // Fetch categories
  const {
    data: categoriesData = { categories: [] },
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });

  // Extract attribute IDs
  const { colors, sizes, colorAttributeId, sizeAttributeId } = getProductAttributes(product || {});
  
  // Fetch size attribute terms if available
  const { 
    data: sizeTermsData
  } = useQuery({
    queryKey: ['attribute-terms', sizeAttributeId],
    queryFn: async () => {
      const url = new URL('/api/product-attributes', window.location.origin);
      url.searchParams.append('attribute_id', sizeAttributeId.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch size attribute terms');
      }
      
      return response.json();
    },
    enabled: !!sizeAttributeId,
  });
  
  // Fetch color attribute terms if available
  const { 
    data: colorTermsData
  } = useQuery({
    queryKey: ['attribute-terms', colorAttributeId],
    queryFn: async () => {
      const url = new URL('/api/product-attributes', window.location.origin);
      url.searchParams.append('attribute_id', colorAttributeId.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch color attribute terms');
      }
      
      return response.json();
    },
    enabled: !!colorAttributeId,
  });
  
  // Extract terms data
  const sizeOptions = sizeTermsData?.terms || [];
  const colorOptions = colorTermsData?.terms || [];
  
  // Error state
  if (productError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-600">Failed to load product</h2>
        <p className="mt-2 text-gray-500">{productError.message}</p>
        <div className="mt-6">
          <Link 
            href="/shop" 
            className="px-5 py-2 bg-black text-white hover:bg-gray-800 rounded-md inline-block"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoadingProduct || isLoadingCategories) {
    return <ProductLoadingSkeleton />;
  }

  // No product found or out of stock
  if (!product || product.error || product.stock_status === 'outofstock') {
    notFound();
  }
  
  const rating = product.average_rating || 0;
  const reviewCount = product.rating_count || 0;
  const categories = categoriesData.categories || [];
  
  // Log the attribute options to help with debugging
  console.log('Attribute options:', { 
    colorAttributeId, 
    sizeAttributeId,
    colors, 
    sizes, 
    colorOptions, 
    sizeOptions 
  });
  
  return (
    <>
      {/* Breadcrumb navigation */}
      <Breadcrumbs product={product} categories={categories} />
      
      <div className="product-layout">
        {/* Product Image */}
        <div className="product-image-container" style={{ 
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
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
          />
        </div>
      </div>
    </>
  );
}

// Inline loading skeleton for product
function ProductLoadingSkeleton() {
  return (
    <>
      {/* Breadcrumb Skeleton */}
      <div className="text-sm text-gray-300 mb-6 animate-pulse">
        <span className="inline-block bg-gray-200 rounded w-10 h-4 mr-2"></span> {' / '}
        <span className="inline-block bg-gray-200 rounded w-10 h-4 mr-2"></span> {' / '}
        <span className="inline-block bg-gray-200 rounded w-24 h-4"></span>
      </div>
      
      <div className="product-layout">
        {/* Product Image Skeleton */}
        <div className="product-image-container" style={{ 
          position: 'relative', 
          height: '500px',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          overflow: 'hidden',
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
        
        {/* Product Details Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title Skeleton */}
          <div style={{ 
            height: '36px', 
            width: '70%', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.25rem',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}></div>
          
          {/* Rating Skeleton */}
          <div style={{ 
            height: '24px', 
            width: '120px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.25rem',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}></div>
          
          {/* Price Skeleton */}
          <div style={{ 
            height: '30px', 
            width: '100px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.25rem',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}></div>
          
          {/* Description Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array(4).fill(0).map((_, index) => (
              <div 
                key={index}
                style={{ 
                  height: '16px', 
                  width: index === 3 ? '60%' : '100%', 
                  backgroundColor: '#f3f4f6', 
                  borderRadius: '0.25rem',
                  background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite'
                }}
              ></div>
            ))}
          </div>
          
          {/* Interactive Elements Skeleton */}
          <div style={{ 
            height: '200px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.25rem',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            marginTop: '1rem'
          }}></div>
        </div>
      </div>
    </>
  );
} 