import Image from 'next/image';
import AboutSidebar from './AboutSidebar';

export const metadata = {
  title: "About Us | Mantle Clothing",
  description: "Learn about Mantle Clothing's story, mission, and commitment to sustainable fashion.",
};

export default function About() {
  return (
    <main style={{ backgroundColor: '#F8F8F8' }}>
      {/* Hero Banner Section */}
      <section style={{ position: 'relative', width: '100%', height: '500px' }}>
        <Image 
          src="/images/banner-2.jpg" 
          alt="Mantle Clothing About Us" 
          fill
          priority
          sizes="100vw"
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center',
          }} 
        />
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem'
        }}>
          <div style={{
            marginBottom: '1rem',
            textAlign: 'center',
          }}>
            <h1 style={{ 
              color: 'white', 
              fontSize: '3rem', 
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              marginBottom: '0.5rem'
            }}>
              Work can be shitty.
            </h1>
            <h1 style={{ 
              color: 'white', 
              fontSize: '3rem', 
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Your clothes don't have to be.
            </h1>
          </div>

          <p style={{ 
            color: 'white', 
            fontSize: '1.25rem',
            maxWidth: '48rem',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            Our goal at Mantle is to produce clothes that function, articulate, last, breathe, look, and protect the way you need them to – allowing you to focus on your job.
          </p>
        </div>
      </section>

      {/* About Content with Fixed Sidebar Position */}
      <div style={{ position: 'relative' }}>
        {/* Sidebar container that only appears after the hero */}
        <div style={{ position: 'sticky', top: '2rem', float: 'left', width: '220px' }}>
          <AboutSidebar />
        </div>
        
        {/* Main Content */}
        <div style={{ marginLeft: '220px', padding: '3rem 4rem 3rem 3rem', maxWidth: '1000px' }}>
          {/* Our Story Section */}
          <section id="our-story" style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Our Story</h2>
            <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem', lineHeight: '1.7' }}>
              Mantle was founded in 2018 with a simple yet powerful mission: to create high-quality, sustainable clothing that could withstand the demands of modern work without compromising on style or comfort.
            </p>
            <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem', lineHeight: '1.7' }}>
              Our founder, drawn from years of experience in both outdoor apparel and sustainable manufacturing, recognized a gap in the market for workwear that was both functional and environmentally responsible.
            </p>
            <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.7' }}>
              What began as a small collection of essential pieces has grown into a comprehensive line of apparel designed for those who demand more from their clothing – whether in the field, at the worksite, or in everyday life.
            </p>
          </section>
          
          {/* Our Mission Section */}
          <section id="our-mission" style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Our Mission</h2>
            <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem', lineHeight: '1.7' }}>
              At Mantle Clothing, we believe that fashion should never come at the expense of our planet. Our mission is to create high-quality, sustainable apparel that looks good, feels good, and does good.
            </p>
            <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.7' }}>
              We're committed to ethical manufacturing processes, using eco-friendly materials, and creating durable products that reduce waste and environmental impact. Every decision we make is guided by our commitment to sustainability and responsibility.
            </p>
          </section>
          
          {/* Materials Section */}
          <section id="materials" style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Our Materials</h2>
            <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem', lineHeight: '1.7' }}>
              We meticulously select materials that balance performance, durability, and environmental impact. Our fabrics include organic cotton, recycled polyester derived from post-consumer plastic bottles, and innovative sustainable blends.
            </p>
            <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.7' }}>
              Each material is chosen not only for its technical properties but also for its reduced environmental footprint. We continuously research and develop new sustainable options to improve our products and minimize our impact.
            </p>
          </section>
          
          {/* Design Philosophy Section */}
          <section id="design" style={{ marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Design Philosophy</h2>
            <p style={{ fontSize: '1.1rem', color: '#444', marginBottom: '1rem', lineHeight: '1.7' }}>
              Our design approach combines function, durability, and timeless style. We create versatile pieces that work across environments and seasons, with thoughtful details that enhance performance and comfort.
            </p>
            <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.7' }}>
              Each garment is engineered to move with you, stand up to repeated wear, and maintain its appearance over time. We believe that truly sustainable clothing must be designed to last, both physically and stylistically.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
} 