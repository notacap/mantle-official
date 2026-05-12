const SITE_URL = 'https://www.mantle-clothing.com';

export const metadata = {
  title: 'Collections - The Rain Collection & The Range Collection | Mantle Clothing',
  description:
    'Shop Mantle Clothing by collection. The Rain Collection delivers operational waterproof gear; The Range Collection covers instruction and training apparel. Purpose-built tactical apparel for those who work in the elements.',
  openGraph: {
    title: 'Shop Mantle Clothing Collections',
    description:
      'The Rain Collection (waterproof operational gear) and The Range Collection (training & instruction apparel) — designed for law enforcement and outdoor professionals.',
    type: 'website',
    locale: 'en_US',
    url: `${SITE_URL}/collections`,
    siteName: 'Mantle Clothing',
    images: [
      {
        url: '/images/banner-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Mantle Clothing - Tactical Apparel Collections',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collections - Mantle Clothing',
    description:
      'The Rain Collection and The Range Collection — tactical apparel built for the elements.',
    images: ['/images/banner-1.jpg'],
  },
  alternates: { canonical: `${SITE_URL}/collections` },
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

export default function CollectionsLayout({ children }) {
  return <>{children}</>;
}
