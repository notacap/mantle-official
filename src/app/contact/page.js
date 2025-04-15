import Image from 'next/image';
import ContactForm from '../components/contact/ContactForm';
import './contact.css';

export const metadata = {
  title: "Contact Us | Mantle Clothing",
  description: "Get in touch with Mantle Clothing for questions, support, or partnership inquiries.",
};

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