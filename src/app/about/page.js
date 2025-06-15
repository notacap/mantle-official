import Image from 'next/image';
import AboutSidebar from '../components/about/AboutSidebar';
import NewsletterSignup from '../components/NewsletterSignup';
import './about.css';

export const metadata = {
  title: 'About Us - Our Mission & Story | Mantle Clothing',
  description: 'Born from 200+ days on the range. Mantle creates quality, purpose-built clothing for law enforcement and first responders. Designed by cops, for cops who demand better gear.',
  keywords: 'mantle clothing story, william petty, law enforcement clothing brand, first responder apparel, police gear company, tactical clothing designers, range-tested gear, purpose-built clothing',
  openGraph: {
    title: 'About Mantle Clothing - Purpose-Built for Those Who Serve',
    description: 'Founded by range instructor William Petty after 200+ days training officers. We create technical clothing that performs correctly, allowing first responders to focus on their job.',
    type: 'website',
    locale: 'en_US',
    url: 'https://mantle-clothing.com/about',
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
    title: 'About Mantle Clothing - Our Mission & Story',
    description: 'Born from frustration with existing options. Purpose-built clothing designed by law enforcement, for law enforcement.',
    images: ['/images/banner-1.jpg'],
  },
  alternates: {
    canonical: 'https://mantle-clothing.com/about',
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
              Your clothes don&apos;t have to be.
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
                Mantle Clothing emerged from a simple truth: those who protect and serve deserve gear that works as hard as they do. What started as frustrated conversations around the range evolved into a mission to revolutionize tactical apparel.
              </p>
              <p>
                The word &quot;mantle&quot; itself tells our story. Historically, it was the outermost garment worn by those who braved the elements to farm, protect, and build. It represented both physical protection and the weight of responsibility. Today, we carry that tradition forward for modern professionals who still work in the elements.
              </p>
              <p>
                Our journey began with a year of meticulous development: selecting premium European fabrics, testing countless prototypes, and gathering feedback from law enforcement officers across the country. We partnered with seamstresses with over 20 years of technical garment experience and consulted with SWAT officers, range instructors, and outdoor professionals. The result? A 9-piece collection that merges high-end outdoor performance with tactical functionality.
              </p>
              <p>
                We&apos;re not here to make easy clothes or chase profit margins. We&apos;re here because we&apos;ve worn the gear that fits like a trash bag, falls apart after a few uses, and leaves you wet, cold, and fumbling for equipment. We&apos;re the new kids on the block, and we&apos;re proud of it—because it means we&apos;re not bound by &quot;how it&apos;s always been done.&quot;
              </p>
            </section>
            
            {/* Our Mission Section */}
            <section id="our-mission" className="content-section">
              <h2>Our Mission</h2>
              <p>
                Our goal at Mantle is to make quality, purpose-built clothing for law enforcement and other first responders. We believe clothing should perform and function correctly, allowing individuals to focus on their job.
              </p>
              <p>
                Every piece we create addresses real-world operational needs. From waterproof work bibs that actually keep you dry during 12-hour shifts, to pants with integrated D3O knee protection that moves with you, we obsess over the details others ignore. Purpose-built pockets that work in positions other than standing. Air flow vents where you need them. Articulated cuts that facilitate true movement while running, climbing, and yes, doing hero shit.
              </p>
              <p>
                We take pride in clothing those who still work in professions of skill. Your job is to tend to your work, your legacy (our job) is to make it suck less while you do. Because weather (and at times your job) can be shitty. Your clothes shouldn&apos;t be.
              </p>
            </section>
            
            {/* The Team Section */}
            <section id="team" className="content-section team-section">
              <h2>The Team</h2>
              <div className="team-members">
                <div className="team-member">
                  <div
                    className="team-member-image"
                    style={{
                      width: 250,
                      height: 250,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <Image 
                      src="/images/piggy.jpg" 
                      alt="Cait - Co-Owner" 
                      width={250}
                      height={250}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3>Cait</h3>
                  <p className="team-role">Co-Owner</p>
                </div>

                <div className="team-member">
                  <div
                    className="team-member-image"
                    style={{
                      width: 250,
                      height: 250,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <Image 
                      src="/images/will.jpg" 
                      alt="Will - Co-Owner" 
                      width={250}
                      height={250}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3>Will</h3>
                  <p className="team-role">Co-Owner</p>
                </div>
                
                <div className="team-member">
                  <div
                    className="team-member-image"
                    style={{
                      width: 250,
                      height: 250,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <Image 
                      src="/images/chris.jpg" 
                      alt="Chris - Web Dev / Digital Marketing" 
                      width={250}
                      height={250}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3>Chris</h3>
                  <p className="team-role">Web Dev / Digital Marketing</p>
                </div>
              </div>
            </section>
            
            {/* Design Philosophy Section */}
            <section id="design" className="content-section">
              <h2>Design Philosophy</h2>
              <p>
                Mantle was born out of frustration with the existing law enforcement clothing options and a desire to make something better. Co-Founder William Petty is on the range for over 200 days each year, training police officers. He was unhappy with the clothing that fell apart, was uncomfortable, and restrictive. He decided to design a clothing line specifically for police officers and what they do every day.
              </p>
              <p>
                But great gear isn&apos;t designed in a vacuum. Our philosophy centers on three core principles:
              </p>
              <p>
                <strong>1. Purpose Over Fashion</strong> - While you&apos;ll look fly as 1980 David Bowie on perimeter, every feature serves a function. We don&apos;t add zippers, pockets, or panels unless they solve a real problem.
              </p>
              <p>
                <strong>2. Field-Tested Innovation </strong> - Each garment undergoes rigorous testing in actual operational environments. If it doesn&apos;t work on the range deck, in the rain, or during a foot pursuit, it doesn&apos;t make the cut.
              </p>
              <p>
                <strong>3. Uncompromising Quality</strong> - We use top-tier materials and construction methods, even when cheaper alternatives exist. The right high-end fabrics, reinforced stitching in stress points, and components that won&apos;t fail when it matters most.
              </p>
              <p>The devil is in the details, and we&apos;ve built a full-blown cult around getting them right. Because when you&apos;re focused on the job, your gear should be the last thing on your mind.</p>
            </section>
          </div>
        </div>
      </div>
      <NewsletterSignup />
    </main>
  );
} 