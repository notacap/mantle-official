import HeroSlideshow from './components/HeroSlideshow';
import SaleBanner from './components/SaleBanner';
import ButtonWithHover from "./components/ButtonWithHover";
import FeaturedProducts from "./components/FeaturedProducts";
import ProductCategories from "./components/ProductCategories";
import InstagramSection from "./components/InstagramSection";
import NewsletterSignup from "./components/NewsletterSignup";
import Image from "next/image";

export const metadata = {
  title: 'Mantle Clothing - Premium Tactical & Outdoor Apparel for Law Enforcement',
  description: 'Purpose-built technical clothing designed for operational use. Premium law enforcement and outdoor apparel featuring waterproof, articulated designs with integrated protection. Tough, warm, water-resistant gear for those who work in the elements.',
  keywords: 'tactical clothing, law enforcement apparel, outdoor gear, waterproof work pants, technical clothing, police gear, security apparel, operational clothing, tactical jacket, work bibs',
  icons: {
    icon: '/images/MANTLE_LOGO.svg?v=2',
    shortcut: '/images/MANTLE_LOGO.svg?v=2',
    apple: '/images/MANTLE_LOGO.svg?v=2',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/images/MANTLE_LOGO.svg?v=2',
    },
  },
  metadataBase: new URL('https://www.mantle-clothing.com'),
  alternates: {
    canonical: 'https://www.mantle-clothing.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Mantle Clothing - Premium Tactical & Outdoor Apparel',
    description: 'Purpose-built technical clothing merging high-end outdoor performance with tactical functionality. Designed for law enforcement, security, and outdoor professionals.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mantle-clothing.com',
    siteName: 'Mantle Clothing',
    images: [
      {
        url: '/images/banner-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Mantle Clothing - Sustainable Apparel',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mantle Clothing - Premium Tactical & Outdoor Apparel',
    description: 'Purpose-built technical clothing for operational use. Premium gear for law enforcement and outdoor professionals.',
    images: ['/images/banner-1.jpg'],
  },
};

export default function Home() {
  // console.log('Homepage Metadata:', JSON.stringify(metadata, null, 2));
  return (
    <main style={{ backgroundColor: '#F8F8F8' }}>
    {/* Sale Banner - controlled by saleConfig */}
    <SaleBanner />

    {/* Hero Slideshow */}
    <section style={{ width: '100%' }}>
      <HeroSlideshow />
    </section>
    
    {/* Featured Products Section */}
    <FeaturedProducts />
    
    {/* Product Categories Section */}
    <ProductCategories />
    
    {/* Instagram Section */}
    <InstagramSection />
    
    {/* Newsletter Signup Section */}
    <NewsletterSignup />
  </main>
  );
}
