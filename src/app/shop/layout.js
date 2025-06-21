export const metadata = {
  title: 'Shop All Products - Tactical Clothing & Gear | Mantle Clothing',
  description: 'Browse our complete collection of purpose-built tactical clothing. Waterproof pants, jackets, work bibs, and technical apparel designed for law enforcement and outdoor professionals.',
  keywords: 'tactical clothing collection, law enforcement gear, waterproof tactical pants, tactical jackets, work bibs, operational clothing, police apparel, security uniforms, outdoor professional gear',
  openGraph: {
    title: 'Shop All Tactical Clothing & Gear - Mantle Clothing',
    description: 'Explore our 9-piece collection of premium tactical apparel. Purpose-built technical clothing with integrated protection, articulated cuts, and weatherproof materials.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mantle-clothing.com/shop',
    siteName: 'Mantle Clothing',
    images: [
      {
        url: '/images/banner-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Mantle Clothing - Sustainable Apparel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop All Tactical Clothing & Gear - Mantle Clothing',
    description: 'Browse our complete collection of purpose-built tactical clothing for law enforcement and outdoor professionals.',
    images: ['/images/banner-1.jpg'],
  },
  alternates: {
    canonical: 'https://www.mantle-clothing.com/shop',
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
}

export default function ShopLayout({ children }) {
  return <>{children}</>;
} 