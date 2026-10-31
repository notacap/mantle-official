import { Suspense } from 'react';
import SingleProductComponent from '@/app/components/shop/SingleProduct';
import NewsletterSignup from '@/app/components/NewsletterSignup';
import ProductJsonLd from '@/app/components/seo/ProductJsonLd';
import BreadcrumbsJsonLd from '@/app/components/seo/BreadcrumbsJsonLd';
import { getProductBySlug } from '@/app/services/woocommerce';
import { SITE_URL, SITE_NAME, decodeEntities, getProductMetaDescription } from '@/app/lib/seo';
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
                robots: { index: false, follow: true },
            };
        }

        const { yoast_head_json } = product;
        const productName = decodeEntities(product.name);

        // Always self-reference the Next.js URL. Yoast's canonical/og_url use a
        // trailing slash (/product/slug/) which redirects on this site, and if
        // Yoast data is missing the page would otherwise inherit the homepage
        // canonical from the root layout.
        const pageUrl = `${SITE_URL}/product/${product.slug}`;

        // Replace base URL in image URLs from Yoast
        const oldBaseUrl = 'https://mantle-clothing.com';
        const yoastOgImages = (yoast_head_json?.og_image || [])
            .filter(img => img?.url)
            .map(img => ({
                ...img,
                url: img.url.replace(oldBaseUrl, process.env.NEXT_PUBLIC_WORDPRESS_URL),
                alt: img.alt || productName,
            }));
        const productImages = (product.images || [])
            .filter(img => img?.src)
            .map(img => ({
                url: img.src,
                alt: img.alt || productName,
            }));
        const ogImages = yoastOgImages.length > 0 ? yoastOgImages : productImages;

        const description = getProductMetaDescription(product);
        const title = decodeEntities(yoast_head_json?.title) || `${productName} | ${SITE_NAME}`;
        const ogTitle = decodeEntities(yoast_head_json?.og_title) || productName;

        const metadata = {
            title,
            description,
            keywords: product.tags?.map(tag => tag.name),
            openGraph: {
                title: ogTitle,
                description,
                url: pageUrl,
                siteName: SITE_NAME,
                images: ogImages,
                locale: 'en_US',
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: ogTitle,
                description,
                images: ogImages.map(img => img.url),
            },
            alternates: {
                canonical: pageUrl,
            },
        };

        return metadata;
    } catch (error) {
        console.error(`Error generating metadata for slug "${slug}":`, error);
        return {
            title: 'Mantle Clothing',
            alternates: { canonical: `${SITE_URL}/product/${slug}` },
        };
    }
}

// Main component that wraps everything
export default async function ProductPage({ params }) {
  // Await params before accessing its properties
  const { slug } = await params;

  const product = await getProductBySlug(slug).catch(() => null);

  const breadcrumbItems = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Shop', url: `${SITE_URL}/shop` },
  ];
  if (product?.categories?.[0]) {
    const primaryCategory = product.categories[0];
    breadcrumbItems.push({
      name: primaryCategory.name,
      url: `${SITE_URL}/categories/${primaryCategory.slug}`,
    });
  }
  if (product?.name) {
    breadcrumbItems.push({
      name: decodeEntities(product.name),
      url: `${SITE_URL}/product/${product.slug}`,
    });
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem',
    }}>
      {product && <ProductJsonLd product={product} />}
      <BreadcrumbsJsonLd items={breadcrumbItems} />
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