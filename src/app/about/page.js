import Image from 'next/image';
import AboutSidebar from '../components/about/AboutSidebar';
import './about.css';

export const metadata = {
  title: "About Us | Mantle Clothing",
  description: "Learn about Mantle Clothing's story, mission, and commitment to sustainable fashion.",
};

export default function About() {
  return (
    <main className="about-page">
      {/* Hero Banner Section */}
      <section className="hero-section">
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
        <div className="hero-overlay">
          <div className="hero-text-container">
            <h1 className="hero-heading">
              Work can be shitty.
            </h1>
            <h1 className="hero-heading">
              Your clothes don't have to be.
            </h1>
          </div>

          <p className="hero-text">
            Our goal at Mantle is to produce clothes that function, articulate, last, breathe, look, and protect the way you need them to – allowing you to focus on your job.
          </p>
        </div>
      </section>

      {/* About Content with Responsive Layout */}
      <div className="about-container">        
        <div className="content-wrapper">
          {/* Sidebar container - horizontal on mobile, vertical on desktop */}
          <div className="sidebar-container">
            <AboutSidebar />
          </div>
          
          {/* Main Content */}
          <div className="about-content">
            {/* Our Story Section */}
            <section id="our-story" className="content-section">
              <h2>Our Story</h2>
              <p>
                Mantle was founded in 2018 with a simple yet powerful mission: to create high-quality, sustainable clothing that could withstand the demands of modern work without compromising on style or comfort.
              </p>
              <p>
                Our founder, drawn from years of experience in both outdoor apparel and sustainable manufacturing, recognized a gap in the market for workwear that was both functional and environmentally responsible.
              </p>
              <p>
                What began as a small collection of essential pieces has grown into a comprehensive line of apparel designed for those who demand more from their clothing – whether in the field, at the worksite, or in everyday life.
              </p>
            </section>
            
            {/* Our Mission Section */}
            <section id="our-mission" className="content-section">
              <h2>Our Mission</h2>
              <p>
                At Mantle Clothing, we believe that fashion should never come at the expense of our planet. Our mission is to create high-quality, sustainable apparel that looks good, feels good, and does good.
              </p>
              <p>
                We're committed to ethical manufacturing processes, using eco-friendly materials, and creating durable products that reduce waste and environmental impact. Every decision we make is guided by our commitment to sustainability and responsibility.
              </p>
            </section>
            
            {/* The Team Section */}
            <section id="team" className="content-section team-section">
              <h2>The Team</h2>
              <div className="team-members">
                <div className="team-member">
                  <div className="team-member-image">
                    <Image 
                      src="/images/piggy.jpg" 
                      alt="Cait - CEO" 
                      width={250}
                      height={250}
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <h3>Cait</h3>
                  <p className="team-role">CEO</p>
                </div>
                
                <div className="team-member">
                  <div className="team-member-image">
                    <Image 
                      src="/images/chris.jpg" 
                      alt="Chris - Web Dev / Digital Marketing" 
                      width={250}
                      height={250}
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <h3>Chris</h3>
                  <p className="team-role">Web Dev / Digital Marketing</p>
                </div>
                
                <div className="team-member">
                  <div className="team-member-image">
                    <Image 
                      src="/images/will.jpg" 
                      alt="Will - Social Media" 
                      width={250}
                      height={250}
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <h3>Will</h3>
                  <p className="team-role">Social Media</p>
                </div>
              </div>
            </section>
            
            {/* Design Philosophy Section */}
            <section id="design" className="content-section">
              <h2>Design Philosophy</h2>
              <p>
                Our design approach combines function, durability, and timeless style. We create versatile pieces that work across environments and seasons, with thoughtful details that enhance performance and comfort.
              </p>
              <p>
                Each garment is engineered to move with you, stand up to repeated wear, and maintain its appearance over time. We believe that truly sustainable clothing must be designed to last, both physically and stylistically.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
} 