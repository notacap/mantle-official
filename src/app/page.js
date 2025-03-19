import HeroSlideshow from './components/HeroSlideshow';
import ButtonWithHover from "./components/ButtonWithHover";
import FeaturedProducts from "./components/FeaturedProducts";
import ProductCategories from "./components/ProductCategories";
import InstagramSection from "./components/InstagramSection";
import NewsletterSignup from "./components/NewsletterSignup";
import Image from "next/image";

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
    
    {/* Instagram Section */}
    <InstagramSection />
    
    {/* Newsletter Signup Section */}
    <NewsletterSignup />
  </main>
  );
}
