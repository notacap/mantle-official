const SITE_URL = 'https://www.mantle-clothing.com';

export const metadata = {
  title: 'Shop Categories - Pants, Tops, Outerwear & Accessories | Mantle Clothing',
  description:
    'Browse Mantle Clothing by category. Tactical pants with integrated D3O knee protection, technical tops, waterproof outerwear, and operational accessories for law enforcement, first responders, and outdoor professionals.',
  openGraph: {
    title: 'Shop Mantle Clothing Categories',
    description:
      'Tactical pants, tops, outerwear, and accessories — purpose-built for law enforcement and outdoor professionals.',
    type: 'website',
    locale: 'en_US',
    url: `${SITE_URL}/categories`,
    siteName: 'Mantle Clothing',
    images: [
      {
        url: '/images/banner-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Mantle Clothing - Tactical Apparel Categories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Categories - Mantle Clothing',
    description:
      'Tactical pants, tops, outerwear, and accessories for law enforcement and outdoor professionals.',
    images: ['/images/banner-1.jpg'],
  },
  alternates: { canonical: `${SITE_URL}/categories` },
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
};

export default function CategoriesLayout({ children }) {
  return <>{children}</>;
}
