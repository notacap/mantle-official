'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductImageUrl, formatPrice } from '@/app/services/woocommerce';
import ProductActions from './ProductActions';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ProductReviewsSection from './ProductReviewsSection';

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
  if (!product || !product.attributes) return { colors: [], sizes: [], amounts: [], colorOptions: [], sizeOptions: [], amountOptions: [] };
  
  const colorAttribute = product.attributes.find(attr => 
    attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colours');
  
  const sizeAttribute = product.attributes.find(attr => 
    attr.name.toLowerCase() === 'size');

  const amountAttribute = product.attributes.find(attr =>
    attr.name.toLowerCase() === 'amount');
  
  const colors = colorAttribute?.options || [];
  const sizes = sizeAttribute?.options || [];
  const amounts = amountAttribute?.options || [];
  
  // Extract attribute IDs for fetching terms
  const colorAttributeId = colorAttribute?.id;
  const sizeAttributeId = sizeAttribute?.id;
  const amountAttributeId = amountAttribute?.id;
  
  return { 
    colors, 
    sizes,
    amounts,
    colorAttributeId, 
    sizeAttributeId,
    amountAttributeId
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
  const [currentImage, setCurrentImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);
  const [isAllPhotosModalOpen, setIsAllPhotosModalOpen] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [isProductNotFound, setIsProductNotFound] = useState(false);
  
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
  const { colors, sizes, amounts, colorAttributeId, sizeAttributeId, amountAttributeId } = getProductAttributes(product || {});
  
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
  
  // Fetch amount attribute terms if available
  const {
    data: amountTermsData
  } = useQuery({
    queryKey: ['attribute-terms', amountAttributeId],
    queryFn: async () => {
      const url = new URL('/api/product-attributes', window.location.origin);
      url.searchParams.append('attribute_id', amountAttributeId.toString());
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch amount attribute terms');
      }
      
      return response.json();
    },
    enabled: !!amountAttributeId,
  });

  // Extract terms data
  const sizeOptions = sizeTermsData?.terms || [];
  const colorOptions = colorTermsData?.terms || [];
  const amountOptions = amountTermsData?.terms || [];
  
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      const uniqueImages = [];
      const seenSources = new Set();
      for (const img of product.images) {
        if (img && img.src && !seenSources.has(img.src)) {
          seenSources.add(img.src);
          uniqueImages.push(img);
        }
      }
      setProcessedImages(uniqueImages);
      if (uniqueImages.length > 0 && !currentImage) {
        setCurrentImage(uniqueImages[0]);
      }
    } else if (product && (!product.images || product.images.length === 0)) {
      // Handle case where product exists but has no images
      setProcessedImages([]);
      setCurrentImage(null);
    }
  }, [product, currentImage]);

  useEffect(() => {
    if (product && (product.error || product.stock_status === 'outofstock')) {
      setIsProductNotFound(true);
    } else if (!product && !isLoadingProduct && productId) {
      setIsProductNotFound(true);
    } else {
      setIsProductNotFound(false);
    }
  }, [product, isLoadingProduct, productId]);
  
  const handleThumbnailClick = (image) => {
    setCurrentImage(image);
  };

  const handleMainImageClick = () => {
    setSelectedImageForModal(currentImage);
    setIsModalOpen(true);
  };
  
  // Early returns for loading and critical errors handled by useQuery error state
  if (productError) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium text-gray-600">Failed to load product data</h2>
        <p className="mt-2 text-gray-500">{productError.message}</p>
      </div>
    );
  }

  if (isLoadingProduct || isLoadingCategories) {
    return <ProductLoadingSkeleton />;
  }

  // Handle not found after all hooks and loading states
  if (isProductNotFound) {
    notFound();
    return null;
  }
  
  const rating = product?.average_rating || 0;
  const reviewCount = product?.rating_count || 0;
  const categories = categoriesData.categories || [];
  
  // Log the attribute options to help with debugging
  console.log('Attribute options and product images:', {
    colorAttributeId, 
    sizeAttributeId,
    amountAttributeId,
    colors, 
    sizes, 
    amounts,
    colorOptions, 
    sizeOptions,
    amountOptions,
    productImages: product?.images
  });
  
  return (
    <>
      {/* Breadcrumb navigation */}
      <Breadcrumbs product={product} categories={categories} />
      
      <div className="product-layout">
        {/* Product Image Section */}
        <div className="product-image-section">
          {/* Main Product Image */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <div 
                className="product-image-container cursor-pointer" 
                style={{ 
                  position: 'relative', 
                  height: '500px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                }}
                onClick={handleMainImageClick}
              >
                {currentImage && currentImage.src && (
                  <Image
                    src={currentImage.src}
                    alt={currentImage.alt || product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] p-0">
              {selectedImageForModal && (
                <>
                  <VisuallyHidden>
                    <DialogTitle>
                      {`Enlarged product image: ${product?.name || 'Product Image'}`}
                    </DialogTitle>
                  </VisuallyHidden>
                  <Image
                    src={selectedImageForModal.src}
                    alt={selectedImageForModal.alt || product.name}
                    width={1200} 
                    height={1200}
                    style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '80vh' }}
                  />
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Thumbnail Gallery */}
          {processedImages && processedImages.length > 1 && (
            <div className="thumbnail-gallery mt-4 grid grid-cols-4 gap-2">
              {processedImages.slice(0, 4).map((img) => (
                <div
                  key={img.src}
                  className={`thumbnail-item cursor-pointer border-2 ${currentImage && currentImage.src === img.src ? 'border-black' : 'border-transparent'} rounded-md overflow-hidden relative aspect-square`}
                  onClick={() => handleThumbnailClick(img)}
                  style={{ height: '100px' }} 
                >
                  <Image
                    src={img.src} 
                    alt={img.alt || `Thumbnail of ${product.name}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="100px"
                  />
                </div>
              ))}
            </div>
          )}
          {processedImages && processedImages.length > 4 && (
            <Dialog open={isAllPhotosModalOpen} onOpenChange={setIsAllPhotosModalOpen}>
              <DialogTrigger asChild>
                <button 
                  onClick={() => setIsAllPhotosModalOpen(true)} 
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  View more photos ({processedImages.length - 4} more)
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-4">
                <VisuallyHidden>
                  <DialogTitle>
                    {`Product image gallery: ${product?.name || 'All Product Images'}`}
                  </DialogTitle>
                </VisuallyHidden>
                <Carousel className="w-full">
                  <CarouselContent>
                    {processedImages.map((img, index) => (
                      <CarouselItem key={img.src} className="flex justify-center items-center">
                        <div className="p-1 relative aspect-square w-full max-w-[500px] max-h-[70vh]">
                          <Image
                            src={img.src}
                            alt={img.alt || `${product.name} - Image ${index + 1}`}
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="(max-width: 768px) 80vw, 50vw"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {processedImages.length > 1 && (
                    <>
                      <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2" />
                      <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2" />
                    </>
                  )}
                </Carousel>
              </DialogContent>
            </Dialog>
          )}
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
            amounts={amounts}
            sizeOptions={sizeOptions}
            colorOptions={colorOptions}
            amountOptions={amountOptions}
          />
        </div>
      </div>

      {/* Customer Reviews Section */}
      {product && <ProductReviewsSection productId={product.id} />}
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