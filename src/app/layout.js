import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ReactQueryProvider from "./lib/reactQuery";

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
        <ReactQueryProvider>
          <Navbar />
          <main className="relative flex-grow min-h-0">
            {children}
          </main>
          <Footer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
