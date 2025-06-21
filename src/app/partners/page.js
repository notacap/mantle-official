import Image from 'next/image';
import NewsletterSignup from '../components/NewsletterSignup';
import './partners.css';

export const metadata = {
  title: 'Partners & Dealers - Industry Leaders & Retail Locations | Mantle Clothing',
  description: 'Mantle partners with industry leaders like Triarc Systems, Velocity Systems, Team Wendy, D3O, and High Speed Gear. Find us in-store at Khimaria.',
  keywords: 'mantle clothing partners, khimaria dealer, triarc systems, velocity systems, team wendy, d3o protection, high speed gear, tactical gear partners, mantle retailers, where to buy mantle clothing',
  openGraph: {
    title: 'Partners & Authorized Dealers - Mantle Clothing',
    description: 'Partnering with the best in tactical gear: Triarc Systems, Velocity Systems, Team Wendy, D3O, and High Speed Gear. Visit our exclusive dealer Khimaria for in-store purchases.',
    type: 'website',
    locale: 'en_US',
    url: 'https://www.mantle-clothing.com/partners',
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
    title: 'Partners & Dealers - Mantle Clothing',
    description: 'Industry partners: Triarc Systems, Velocity Systems, Team Wendy, D3O, High Speed Gear. Find us at Khimaria.',
    images: ['/images/banner-1.jpg'],
  },
  alternates: {
    canonical: 'https://www.mantle-clothing.com/partners',
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

export default function Partners() {
  return (
    <main className="partners-page">
      {/* Hero Section with Military Logo */}
      <section className="hero-section">
        <div className="section-container hero-container">
          <div className="hero-image-container">
            <Image 
              src="/images/militarylogo.jpg"
              alt="Mantle Clothing Military Partner" 
              width={500}
              height={500}
              priority
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Dealers Section */}
      <section className="dealers-section">
        <div className="section-container">
          <h2 className="section-title">Dealers</h2>
          <div className="dealer-container">
            <a href="https://khimaira-st.com/" target="_blank" rel="noopener noreferrer" className="dealer-link">
              <Image 
                src="/images/dealer1.png"
                alt="Khimaira Strategy Tactics" 
                width={380}
                height={127}
                className="dealer-logo"
              />
            </a>
            <p className="dealer-description">
              Khimaira Strategy Tactics is dedicated to helping good people save lives (and their own) by researching and developing material and sharing the best techniques. They now carry Mantle Clothing and will be our European distributor. If something is not in stock please contact them to request it.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Partners Section */}
      <section className="industry-partners-section">
        <div className="section-container">
          <h2 className="section-title">Industry Partners</h2>
          <div className="partners-grid">
            <a href="#" className="partner-logo-container">
              <Image 
                src="/images/partner1.jpg"
                alt="Triarc Systems" 
                width={240}
                height={120}
                className="partner-logo"
              />
            </a>
            <a href="#" className="partner-logo-container">
              <Image 
                src="/images/partner2.jpg"
                alt="Velocity Systems" 
                width={240}
                height={120}
                className="partner-logo"
              />
            </a>
            <a href="#" className="partner-logo-container">
              <Image 
                src="/images/partner3.jpg"
                alt="Team Wendy" 
                width={240}
                height={120}
                className="partner-logo"
              />
            </a>
            <a href="#" className="partner-logo-container">
              <Image 
                src="/images/partner4.jpg"
                alt="D3O" 
                width={240}
                height={120}
                className="partner-logo"
              />
            </a>
            <a href="#" className="partner-logo-container">
              <Image 
                src="/images/partner5.jpg"
                alt="Elite Special Forces" 
                width={240}
                height={120}
                className="partner-logo"
              />
            </a>
            <a href="#" className="partner-logo-container">
              <Image 
                src="/images/partner6.jpg"
                alt="High Speed Gear" 
                width={240}
                height={120}
                className="partner-logo"
              />
            </a>
          </div>
        </div>
      </section>
      <NewsletterSignup />
    </main>
  );
} 