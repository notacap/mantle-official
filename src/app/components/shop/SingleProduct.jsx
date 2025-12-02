'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductImageUrl, formatPrice, getProductPriceDisplay } from '@/app/services/woocommerce';
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
import StarRating from './StarRating';

// Function to strip HTML tags
function stripHtml(html) {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return html?.replace(/<[^>]*>?/gm, '') || '';
  }
  
  // Client-side rendering
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return doc.body.textContent || '';
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

// Function to calculate combined rating from reviews
function calculateCombinedRating(reviews) {
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

export default function SingleProduct({ productIdentifier }) {
  const [currentImage, setCurrentImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageForModal, setSelectedImageForModal] = useState(null);
  const [isAllPhotosModalOpen, setIsAllPhotosModalOpen] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);
  const [isProductNotFound, setIsProductNotFound] = useState(false);
  const [sizeChartData, setSizeChartData] = useState(null);
  const [sizeChartError, setSizeChartError] = useState(null);
  const [sizeChartFootnote, setSizeChartFootnote] = useState('');
  const [imageSetByVariation, setImageSetByVariation] = useState(false);
  
  // Callback to handle variation image changes - memoized to prevent re-renders
  const handleVariationImageChange = useCallback((newImage) => {
    setCurrentImage(newImage);
    setImageSetByVariation(true);
  }, []);
  
  // Fetch product data
  const { 
    data: product, 
    isLoading: isLoadingProduct, 
    error: productError 
  } = useQuery({
    queryKey: ['product', productIdentifier],
    queryFn: async () => {
      const url = new URL('/api/products', window.location.origin);
      if (isNaN(parseInt(productIdentifier, 10))) {
        url.searchParams.append('slug', productIdentifier);
      } else {
        url.searchParams.append('id', productIdentifier);
      }
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      
      return response.json();
    },
    enabled: !!productIdentifier,
  });
  
  const productId = product?.id;

  // Fetch product variations
  const { 
    data: variations, 
    isLoading: isLoadingVariations,
    error: variationsError,
  } = useQuery({
    queryKey: ['productVariations', productId],
    queryFn: async () => {
      const url = new URL(`/api/products/${productId}/variations`, window.location.origin);
      const response = await fetch(url.toString());
      if (!response.ok) {
        // It's common for simple products to not have variations, so we don't treat it as a critical error.
        // The API route now returns an empty array for products with no variations,
        // but this handles other potential errors gracefully.
        console.warn(`Could not fetch variations for product ${productId}. Status: ${response.status}`);
        return [];
      }
      return response.json();
    },
    enabled: !!productId,
    retry: false, // Don't retry if variations fail, it's likely not a variable product.
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

  // Fetch combined reviews for product 5403 to calculate accurate rating
  const { 
    data: combinedReviews 
  } = useQuery({
    queryKey: ['combinedReviews', productId],
    queryFn: async () => {
      const response = await fetch(`/api/product-reviews?product_id=${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch combined reviews');
      }
      return response.json();
    },
    enabled: !!productId && productId.toString() === '5403',
  });
  
  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      const newUniqueImages = [];
      const seenSources = new Set();
      for (const img of product.images) {
        if (img && img.src && !seenSources.has(img.src)) {
          seenSources.add(img.src);
          newUniqueImages.push(img);
        }
      }

      setProcessedImages(prevImages => {
        if (prevImages.length === newUniqueImages.length &&
            prevImages.every((img, idx) => img.src === newUniqueImages[idx].src && img.alt === newUniqueImages[idx].alt)) {
          return prevImages;
        }
        return newUniqueImages;
      });

      if (newUniqueImages.length > 0 && !currentImage && !imageSetByVariation) {
        // Check if there's a pre-selected variation with an image
        let initialImage = newUniqueImages[0]; // Default to first image
        
        if (variations && variations.length > 0) {
          // Find the default/first in-stock variation
          const firstInStockVariation = variations.find(v => v.stock_status === 'instock');
          
          if (firstInStockVariation && firstInStockVariation.image && firstInStockVariation.image.src) {
            initialImage = {
              src: firstInStockVariation.image.src,
              alt: firstInStockVariation.image.alt || `${product.name} - Default Variation`
            };
          }
        }
        
        setCurrentImage(initialImage);
      }
    } else if (product && (!product.images || product.images.length === 0)) {
      // Handle case where product exists but has no images
      setProcessedImages(prevImages => {
        if (prevImages.length === 0) return prevImages;
        return [];
      });
      setCurrentImage(null);
    }
  }, [product, currentImage, variations, imageSetByVariation]);

  useEffect(() => {
    if (product && (product.error || product.stock_status === 'outofstock')) {
      setIsProductNotFound(true);
    } else if (!product && !isLoadingProduct && productIdentifier) {
      setIsProductNotFound(true);
    } else {
      setIsProductNotFound(false);
    }
  }, [product, isLoadingProduct, productIdentifier]);
  
  useEffect(() => {
    if (product?.meta_data) {
      const tableShortcodeMeta = product.meta_data.find(meta => meta.key === 'table_shortcode');
      if (tableShortcodeMeta && tableShortcodeMeta.value) {
        const match = tableShortcodeMeta.value.match(/\[supsystic-tables id=(\d+)\]/);
        if (match && match[1]) {
          const tableId = match[1];
          // For now, hardcode footnote for table ID 1, can be made dynamic later
          if (tableId === '1') {
            setSizeChartFootnote('These are BODY MEASUREMENTS - Use a tape!');
          } else {
            setSizeChartFootnote(''); // Clear footnote for other tables or implement dynamic logic
          }

          fetch(`/csv/table-${tableId}.tsv`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch sizing table: ${response.statusText}`);
              }
              return response.text();
            })
            .then(textData => {
              const rows = textData.trim().split('\n');
              const parsedData = rows.map(row => row.split('\t'));
              if (parsedData.length > 0) {
                setSizeChartData(parsedData);
                setSizeChartError(null);
              } else {
                throw new Error('Sizing table data is empty or invalid.');
              }
            })
            .catch(err => {
              console.error("Error fetching or parsing size chart:", err);
              setSizeChartError('Sizing chart is currently unavailable.');
              setSizeChartData(null);
            });
        }
      }
    }
  }, [product]);
  
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

  if (isLoadingProduct || isLoadingCategories || (product && !variations && product.type === 'variable')) {
    return <ProductLoadingSkeleton />;
  }

  // Handle not found after all hooks and loading states
  if (isProductNotFound) {
    notFound();
    return null;
  }
  
  // Calculate rating and review count - use combined data for product 5403
  let rating, reviewCount;
  if (productId?.toString() === '5403' && combinedReviews) {
    const combinedRating = calculateCombinedRating(combinedReviews);
    rating = combinedRating.averageRating;
    reviewCount = combinedRating.totalCount;
  } else {
    rating = product?.average_rating || 0;
    reviewCount = product?.rating_count || 0;
  }
  const categories = categoriesData.categories || [];
  
  // Extract care_info and fabric_technology from meta_data
  const metaData = product?.meta_data || [];
  const careInfoString = metaData.find(meta => meta.key === 'care_info')?.value || '';
  const fabricTechnologyString = metaData.find(meta => meta.key === 'fabric_technology')?.value || '';

  const careInfoList = careInfoString.split(',').map(item => item.trim()).filter(item => item);
  const fabricTechnologyList = fabricTechnologyString.split(',').map(item => item.trim()).filter(item => item);

  let ogDescriptionValue = metaData.find(meta => meta.key === 'description')?.value || '';
  // Replace newline characters with <br /> for HTML rendering
  ogDescriptionValue = ogDescriptionValue.replace(/\r\n|\r|\n/g, '<br />');
  
  // Prepare content for Product Features, Care Info, and Fabric Technology sections
  let productFeaturesContent = null;
  if (product.description && typeof window !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(product.description, 'text/html');
    const listItems = Array.from(doc.querySelectorAll('li'));
    if (listItems.length > 0) {
      productFeaturesContent = (
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          {listItems.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item.innerHTML }} />
          ))}
        </ul>
      );
    }
  }

  let careInfoContent = null;
  if (careInfoList.length > 0) {
    careInfoContent = (
      <ul className="list-disc list-inside text-gray-600 space-y-1">
        {careInfoList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  let fabricTechnologyContent = null;
  if (fabricTechnologyList.length > 0) {
    fabricTechnologyContent = (
      <ul className="list-disc list-inside text-gray-600 space-y-1">
        {fabricTechnologyList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }

  const detailSections = [];
  if (productFeaturesContent) {
    detailSections.push({ title: 'Product Features', content: productFeaturesContent });
  }
  if (careInfoContent) {
    detailSections.push({ title: 'Care Information', content: careInfoContent });
  }
  if (fabricTechnologyContent) {
    detailSections.push({ title: 'Fabric Technology', content: fabricTechnologyContent });
  }


  
  // Check if product is eligible for Cyber Monday promo
  const productCategorySlugs = product?.categories?.map(cat => cat.slug?.toLowerCase()) || [];
  const isPantsProduct = productCategorySlugs.includes('pants');
  const isTopsProduct = productCategorySlugs.includes('tops');
  const isPromoEligible = isPantsProduct || isTopsProduct;

  return (
    <>
      {/* Breadcrumb navigation */}
      <Breadcrumbs product={product} categories={categories} />

      {/* Cyber Monday Top Banner - only for Pants/Tops products */}
      <CyberMondayTopBanner isEligible={isPromoEligible} isPants={isPantsProduct} />

      <div className="product-layout">
        {/* Product Image Section */}
        <div className="product-image-section">
          {/* Main Product Image */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <div 
                className="product-image-container cursor-pointer" 
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
          
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9CB24D' }}>
            {(() => {
              const priceInfo = getProductPriceDisplay(product);
              if (priceInfo.hasDiscount) {
                return (
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#6b7280', fontSize: '1.25rem', marginRight: '0.5rem' }}>
                      {priceInfo.regularPrice}
                    </span>
                    <span style={{ color: '#dc2626' }}>
                      {priceInfo.salePrice}
                    </span>
                  </>
                );
              } else {
                return priceInfo.display;
              }
            })()}
          </div>
          
          <div dangerouslySetInnerHTML={{ __html: ogDescriptionValue.replace(/Price range: \$[\d,]+\.?\d* through \$[\d,]+\.?\d*/gi, '') }} 
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
            variations={variations || []}
            onVariationImageChange={handleVariationImageChange}
          />
        </div>
      </div>

      {/* Cyber Monday Cross-Promotion Banner */}
      <CyberMondayPromo product={product} categories={categories} />

      {/* Product Details: Features, Care Info, Fabric Technology */}
      {detailSections.length > 0 && (
        <div className="mt-10 py-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row">
            {detailSections.map((section, index) => (
              <div
                key={section.title}
                className={`flex-1 mb-6 md:mb-0 ${index > 0 ? 'md:pl-6' : ''} ${index < detailSections.length - 1 ? 'md:border-r md:border-gray-300 md:pr-6' : ''}`}
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-800 text-center">{section.title}</h3>
                {section.content}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sizing Chart Section */}
      {sizeChartData && (
        <div className="mt-10 py-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Sizing Chart</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 text-sm">
              <thead>
                {sizeChartData[0] && (
                  <tr className="bg-gray-100">
                    {sizeChartData[0].map((header, index) => (
                      <th key={index} className="p-2 border-b border-gray-300 text-left font-medium text-gray-700">
                        {header}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {sizeChartData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-2 border-b border-gray-300 text-gray-600">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sizeChartFootnote && (
            <p className="mt-3 text-xs text-gray-500 italic">{sizeChartFootnote}</p>
          )}
        </div>
      )}
      {sizeChartError && (
        <div className="mt-10 py-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 text-center">Sizing Chart</h3>
          <p className="text-red-600">{sizeChartError}</p>
        </div>
      )}

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

// Cyber Monday Top Banner Component - appears at top of product page
function CyberMondayTopBanner({ isEligible, isPants }) {
  // Check if the sale is still active (ends December 8, 2025 at 12:00 AM CST)
  const saleEndDate = new Date("2025-12-08T06:00:00Z").getTime();
  const now = new Date().getTime();
  const isSaleActive = now < saleEndDate;

  if (!isSaleActive || !isEligible) return null;

  return (
    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
      <Link
        href="/specials"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: '8px',
          border: '1px solid #333',
          textDecoration: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span
          style={{
            background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            fontWeight: '700',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Cyber Monday
        </span>
        <span style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '500' }}>
          {isPants ? (
            <>
              Buy these pants, get any top{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #9CB24D 0%, #b8d45a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '700',
                }}
              >
                30% OFF
              </span>
            </>
          ) : (
            <>
              Buy any pants, get this top{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #9CB24D 0%, #b8d45a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '700',
                }}
              >
                30% OFF
              </span>
            </>
          )}
        </span>
        <span style={{ color: '#9CB24D', fontSize: '0.8rem', fontWeight: '600' }}>
          Shop Deal →
        </span>
      </Link>
    </div>
  );
}

// Cyber Monday Cross-Promotion Component
function CyberMondayPromo({ product, categories }) {
  // Check if the sale is still active (ends December 8, 2025 at 12:00 AM CST)
  const saleEndDate = new Date("2025-12-08T06:00:00Z").getTime();
  const now = new Date().getTime();
  const isSaleActive = now < saleEndDate;

  if (!isSaleActive || !product?.categories) return null;

  // Check if product is in Pants or Tops category
  const productCategorySlugs = product.categories.map(cat => cat.slug?.toLowerCase());
  const isPants = productCategorySlugs.includes('pants');
  const isTops = productCategorySlugs.includes('tops');

  if (!isPants && !isTops) return null;

  // Determine the cross-sell category
  const targetCategory = isPants ? 'tops' : 'pants';
  const targetCategoryName = isPants ? 'Top' : 'Pants';
  const currentCategoryName = isPants ? 'Pants' : 'Top';

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '24px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        borderRadius: '12px',
        border: '1px solid #333',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontWeight: '700',
                  fontSize: '0.7rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Cyber Monday
              </span>
            </div>
            <h3 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 6px 0' }}>
              {isPants ? (
                <>
                  Complete the Deal - Get a {targetCategoryName} for{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #9CB24D 0%, #b8d45a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    30% OFF
                  </span>
                </>
              ) : (
                <>
                  Buy {targetCategoryName} & Get This {currentCategoryName} for{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #9CB24D 0%, #b8d45a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    30% OFF
                  </span>
                </>
              )}
            </h3>
            <p style={{ color: '#999', fontSize: '0.875rem', margin: 0 }}>
              {isPants
                ? 'Add these pants to your cart, then pick any top to save 30%!'
                : 'Add any pants to your cart and this top will be 30% off!'}
            </p>
          </div>

          <Link
            href={`/categories/${targetCategory}`}
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #9CB24D 0%, #8aa542 100%)',
              color: '#1a1a1a',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.875rem',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 15px rgba(156, 178, 77, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(156, 178, 77, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(156, 178, 77, 0.3)';
            }}
          >
            Shop {targetCategoryName === 'Pants' ? 'Pants' : 'Tops'}
          </Link>
        </div>
      </div>
    </div>
  );
}