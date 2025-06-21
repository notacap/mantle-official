import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ReactQueryProvider from "./lib/reactQuery";
import { CartProvider } from "../context/CartContext";
import SideCart from "./components/SideCart";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
                                                                                                                                                                                                       
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
    canonical: '/',
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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8f8f8] text-gray-900 min-h-screen relative flex flex-col`}
      >
        <GoogleAnalytics />
        <ReactQueryProvider>
          <CartProvider>
            <Navbar />
            <main 
              className="relative flex-grow min-h-0"
              style={{ position: 'relative', zIndex: 1 }}
            >
              {children}
            </main>
            <Footer />
            <SideCart />
          </CartProvider>
        </ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
