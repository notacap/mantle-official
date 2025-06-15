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
  title: "Mantle Clothing | Premium Sustainable Apparel",
  description: "Discover Mantle Clothing's premium sustainable apparel. Shop our collection of eco-friendly, ethically-made clothing for conscious consumers.",
  keywords: "sustainable clothing, eco-friendly apparel, ethical fashion, Mantle Clothing, outdoor apparel, rain collection, range collection",
  icons: {
    icon: '/images/MANTLE_LOGO.svg?v=2',
    shortcut: '/images/MANTLE_LOGO.svg?v=2',
    apple: '/images/MANTLE_LOGO.svg?v=2',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/images/MANTLE_LOGO.svg?v=2',
    },
  },
  metadataBase: new URL('https://mantleclothing.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Mantle Clothing | Premium Sustainable Apparel",
    description: "Discover Mantle Clothing's premium sustainable apparel. Shop our collection of eco-friendly, ethically-made clothing for conscious consumers.",
    url: 'https://mantleclothing.com',
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
    title: "Mantle Clothing | Premium Sustainable Apparel",
    description: "Discover Mantle Clothing's premium sustainable apparel. Shop our collection of eco-friendly, ethically-made clothing for conscious consumers.",
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
