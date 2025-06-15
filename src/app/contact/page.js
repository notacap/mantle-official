import Image from 'next/image';
import ContactForm from '../components/contact/ContactForm';
import './contact.css';

export const metadata = {
  title: 'Contact Us - General Inquiries & Order Support | Mantle Clothing',
  description: 'Get in touch with Mantle Clothing. Contact us for general inquiries, order questions, or product support. Dedicated forms for fast, efficient responses.',
  keywords: 'contact mantle clothing, customer support, order questions, tactical gear support, law enforcement clothing inquiries, mantle customer service, product questions, order status',
  openGraph: {
    title: 'Contact Mantle Clothing - We\'re Here to Help',
    description: 'Questions about your order or our tactical gear? Contact our team for general inquiries or order support. Purpose-built customer service for those who serve.',
    type: 'website',
    locale: 'en_US',
    url: 'https://mantle-clothing.com/contact',
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
    title: 'Contact Us - Mantle Clothing Support',
    description: 'General inquiries or order questions? We\'re here to help. Dedicated support for law enforcement professionals.',
    images: ['/images/banner-1.jpg'],
  },
  alternates: {
    canonical: 'https://mantle-clothing.com/contact',
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

export default function Contact() {
  return (
    <main className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-image-wrapper">
          <Image 
            src="/images/home-3.jpg"
            alt="Contact Mantle Clothing" 
            fill
            priority
            className="hero-image"
          />
          <div className="hero-overlay">
            <h1 className="hero-title">Get In Touch</h1>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="section-container">
          <ContactForm />
        </div>
      </section>
    </main>
  );
} 