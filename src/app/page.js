import HeroSlideshow from './components/HeroSlideshow';
import ButtonWithHover from "./components/ButtonWithHover";
import FeaturedProducts from "./components/FeaturedProducts";
import ProductCategories from "./components/ProductCategories";
import InstagramSection from "./components/InstagramSection";
import NewsletterSignup from "./components/NewsletterSignup";

export const metadata = {
  title: "Mantle Clothing | Premium Sustainable Apparel",
  description: "Discover Mantle Clothing's premium sustainable apparel. Shop our collection of eco-friendly, ethically-made clothing for conscious consumers.",
  openGraph: {
    title: "Mantle Clothing | Premium Sustainable Apparel",
    description: "Discover Mantle Clothing's premium sustainable apparel. Shop our collection of eco-friendly, ethically-made clothing for conscious consumers.",
    url: "https://mantleclothing.com",
    siteName: "Mantle Clothing",
    type: "website",
  },
};

export default function Home() {
  return (
    <main style={{ backgroundColor: '#F8F8F8' }}>
    {/* Hero Slideshow */}
    <section style={{ width: '100%' }}>
      <HeroSlideshow />
    </section>
    
    {/* Featured Products Section */}
    <FeaturedProducts />
    
    {/* Product Categories Section */}
    <ProductCategories />
    
    {/* Mission Statement Section */}
    <section style={{ backgroundColor: 'white', padding: '4rem 1rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
          Our Mission
        </h2>
        <p style={{ fontSize: '1.125rem', maxWidth: '48rem', margin: '0 auto', color: '#4b5563', marginBottom: '2rem' }}>
          At Mantle Clothing, we believe that fashion should never come at the expense of our planet. 
          Our mission is to create high-quality, sustainable apparel that looks good, feels good, and does good.
        </p>
        <ButtonWithHover href="/about" variant="outline">
          Learn More About Us
        </ButtonWithHover>
      </div>
    </section>
    
    {/* Instagram Section */}
    <InstagramSection />
    
    {/* Newsletter Signup Section */}
    <NewsletterSignup />
  </main>
  );
}
