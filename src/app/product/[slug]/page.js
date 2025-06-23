import { Suspense } from 'react';
import SingleProductComponent from '@/app/components/shop/SingleProduct';
import NewsletterSignup from '@/app/components/NewsletterSignup';
import { getProductBySlug } from '@/app/services/woocommerce';
import '../loading.css';
import '../product.css';

// Function to generate metadata
export async function generateMetadata({ params }) {
    const { slug } = await params;
    
    try {
        const product = await getProductBySlug(slug);

        if (!product) {
            return {
                title: 'Product Not Found',
                description: 'The product you are looking for could not be found.',
            };
        }

        const { yoast_head_json } = product;

        // Define base URLs for replacement
        const oldBaseUrl = 'https://mantle-clothing.com';
        const newBaseUrl = 'https://www.mantle-clothing.com';

        // Replace base URL in Yoast data
        const ogUrl = yoast_head_json?.og_url?.replace(oldBaseUrl, newBaseUrl);
        const canonicalUrl = yoast_head_json?.canonical?.replace(oldBaseUrl, newBaseUrl);

        // Replace base URL in image URLs from Yoast
        const updatedOgImage = yoast_head_json?.og_image?.map(img => ({
            ...img,
            url: img.url?.replace(oldBaseUrl, process.env.NEXT_PUBLIC_WORDPRESS_URL)
        }));

        // Fallback for description
        const description = yoast_head_json?.og_description || product.short_description?.replace(/<[^>]*>?/gm, '') || product.description?.replace(/<[^>]*>?/gm, '');

        const metadata = {
            title: yoast_head_json?.title || product.name,
            description: description,
            keywords: product.tags?.map(tag => tag.name),
            openGraph: {
                title: yoast_head_json?.og_title || product.name,
                description: description,
                url: ogUrl || `${newBaseUrl}/product/${product.slug}`,
                siteName: yoast_head_json?.og_site_name || 'Mantle',
                images: updatedOgImage || product.images?.map(img => ({
                    url: img.src,
                    width: img.src_w || 800,
                    height: img.src_h || 600,
                    alt: img.alt || product.name,
                })),
                locale: yoast_head_json?.og_locale || 'en_US',
                type: yoast_head_json?.og_type || 'article',
            },
            twitter: {
                card: yoast_head_json?.twitter_card || 'summary_large_image',
                title: yoast_head_json?.og_title || product.name,
                description: description,
                images: updatedOgImage?.map(img => img.url) || product.images?.map(img => img.src),
            },
            alternates: {
                canonical: canonicalUrl,
            },
        };

        return metadata;
    } catch (error) {
        console.error(`Error generating metadata for slug "${slug}":`, error);
        return {
            title: "Error",
            description: "An error occurred while generating page metadata."
        };
    }
}

// Main component that wraps everything
export default async function ProductPage({ params }) {
  // Await params before accessing its properties
  const { slug } = await params;
  
  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 1rem',
    }}>
      <Suspense fallback={<ProductLoadingSkeleton />}>
        <SingleProductComponent productIdentifier={slug} />
      </Suspense>
      <NewsletterSignup />
    </div>
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