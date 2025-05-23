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
  const [sizeChartData, setSizeChartData] = useState(null);
  const [sizeChartError, setSizeChartError] = useState(null);
  const [sizeChartFootnote, setSizeChartFootnote] = useState('');
  
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

      if (newUniqueImages.length > 0 && !currentImage) {
        setCurrentImage(newUniqueImages[0]);
      }
    } else if (product && (!product.images || product.images.length === 0)) {
      // Handle case where product exists but has no images
      setProcessedImages(prevImages => {
        if (prevImages.length === 0) return prevImages;
        return [];
      });
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
  
  // Extract care_info and fabric_technology from meta_data
  const metaData = product?.meta_data || [];
  const careInfoString = metaData.find(meta => meta.key === 'care_info')?.value || '';
  const fabricTechnologyString = metaData.find(meta => meta.key === 'fabric_technology')?.value || '';

  const careInfoList = careInfoString.split(',').map(item => item.trim()).filter(item => item);
  const fabricTechnologyList = fabricTechnologyString.split(',').map(item => item.trim()).filter(item => item);

  const ogDescriptionValue = metaData.find(meta => meta.key === 'description')?.value || '';
  
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

  // Log the attribute options to help with debugging
  // console.log('Attribute options and product images:', {
  //   colorAttributeId, 
  //   sizeAttributeId,
  //   amountAttributeId,
  //   colors, 
  //   sizes, 
  //   amounts,
  //   colorOptions, 
  //   sizeOptions,
  //   amountOptions,
  //   productImages: product?.images
  // });
  
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
            {(() => {
              const minPriceValue = parseFloat(product.price);
              const maxPriceValue = product.max_price ? parseFloat(product.max_price) : null;

              if (maxPriceValue !== null && !isNaN(minPriceValue) && !isNaN(maxPriceValue) && maxPriceValue > minPriceValue) {
                return `${formatPrice(product.price)} – ${formatPrice(product.max_price)}`;
              } else if (product.price_html && (product.price_html.includes('–') || product.price_html.includes('-'))) {
                return stripHtml(product.price_html);
              } else {
                return formatPrice(product.price);
              }
            })()}
          </p>
          
          <div dangerouslySetInnerHTML={{ __html: ogDescriptionValue }} 
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
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Sizing Chart</h3>
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
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Sizing Chart</h3>
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