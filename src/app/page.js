import HeroSlideshow from './components/HeroSlideshow';
import SaleBanner from './components/SaleBanner';
import ButtonWithHover from "./components/ButtonWithHover";
import FeaturedSection from "./components/FeaturedSection";
import ProductCategories from "./components/ProductCategories";
import InstagramSection from "./components/InstagramSection";
import NewsletterSignup from "./components/NewsletterSignup";
import Image from "next/image";

export const metadata = {
  title: 'Mantle Clothing — Tactical & Outdoor Apparel for Law Enforcement & First Responders',
  description:
    'Shop Mantle Clothing — sustainable, purpose-built tactical and outdoor apparel for law enforcement, first responders, and outdoor professionals. Waterproof pants, jackets, work bibs, and technical gear designed by cops, for cops.',
  keywords:
    'tactical clothing, law enforcement apparel, outdoor gear, waterproof work pants, technical clothing, police gear, security apparel, operational clothing, tactical jacket, work bibs',
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
    title: 'Mantle Clothing — Built for Those Who Work in the Elements',
    description:
      'Purpose-built technical clothing merging high-end outdoor performance with tactical functionality. Sustainably designed for law enforcement, first responders, and outdoor professionals.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mantle-clothing.com',
    siteName: 'Mantle Clothing',
    images: [
      {
        url: '/images/banner-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Mantle Clothing — Tactical Apparel for Professionals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mantle Clothing — Tactical & Outdoor Apparel',
    description:
      'Sustainable, purpose-built technical clothing for law enforcement, first responders, and outdoor professionals.',
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

    {/* Featured Section - shows NewProductFeatured or FeaturedProducts based on config */}
    <FeaturedSection />
    
    {/* Product Categories Section */}
    <ProductCategories />
    
    {/* Instagram Section */}
    <InstagramSection />
    
    {/* Newsletter Signup Section */}
    <NewsletterSignup />
  </main>
  );
}
