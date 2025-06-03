import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
import './in-the-wild.css';
import InstagramSection from '../components/InstagramSection';
import NewsletterSignup from '../components/NewsletterSignup';

export const metadata = {
  title: "In The Wild | Mantle Clothing",
  description: "See how professionals wear Mantle Clothing on the job, featuring real testimonials from our community.",
};

export default function InTheWild() {
  return (
    <main className="in-the-wild-page">
      {/* Hero Banner Section */}
      <section className="hero-section relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <Image 
          src="/images/banner_3.jpg" 
          alt="Mantle Clothing In The Wild" 
          fill
          priority
          sizes="100vw"
          style={{ 
            objectFit: 'cover',
            objectPosition: 'center',
          }} 
        />
        <div className="hero-overlay absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            In The Wild
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Meet the professionals who trust Mantle Clothing to perform when it matters most.
          </p>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Professionals</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Chase Jenkins */}
            <div className="professional-card flex flex-col md:flex-row gap-8 bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="profile-content flex flex-col items-center p-8 md:w-1/3 bg-[--accent]/10">
                <div className="relative w-48 h-48 mb-4">
                  <Image 
                    src="/images/cameo-profile-3.jpg" 
                    alt="Chase Jenkins profile" 
                    fill
                    sizes="(max-width: 768px) 192px, 192px"
                    className="rounded-full object-cover border-4 border-[--accent]"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1">Chase Jenkins</h3>
                <Link 
                  href="https://www.instagram.com/centrifuge_chase" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[--accent] hover:text-[--accent]/80 mb-4"
                >
                  <Instagram className="mr-1" size={18} />
                  <span>@centrifuge_chase</span>
                </Link>
              </div>
              
              <div className="bio-section p-8 md:w-2/3">
                <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/cameo-2.jpg" 
                    alt="Chase Jenkins in action" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="bio-text max-h-64 overflow-y-auto pr-4 text-gray-700">
                  <p className="mb-4">
                    Chase began his law enforcement career in 1992. During his 25 year career he served in various units and fields of the profession. Early on he was tasked with providing training for his department during in-service training.
                  </p>
                  <p className="mb-4">
                    During this time Chase was assigned to the Housing Authority which was a unit responsible for patrolling public housing. The unit was awarded numerous citations for its programs and initiative. The unit worked closely with the Narcotics unit by enforcing street level narcotics activity and serving search and arrest warrants.
                  </p>
                  <p>
                    Chase is currently a sworn/active deputy at a large Sheriff&apos;s Office in Alabama where his primary duties are providing advanced training and assisting in operations at the training facility.
                  </p>
                </div>
              </div>
            </div>

            {/* Dan Smith */}
            <div className="professional-card flex flex-col md:flex-row gap-8 bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="profile-content flex flex-col items-center p-8 md:w-1/3 bg-[--accent]/10">
                <div className="relative w-48 h-48 mb-4">
                  <Image 
                    src="/images/cameo-profile-2.jpg" 
                    alt="Dan Smith profile" 
                    fill
                    sizes="(max-width: 768px) 192px, 192px"
                    className="rounded-full object-cover border-4 border-[--accent]"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1">Dan Smith</h3>
                <Link 
                  href="https://www.instagram.com/danno1812" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[--accent] hover:text-[--accent]/80 mb-4"
                >
                  <Instagram className="mr-1" size={18} />
                  <span>@danno1812</span>
                </Link>
              </div>
              
              <div className="bio-section p-8 md:w-2/3">
                <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/cameo-4.jpg" 
                    alt="Dan Smith in action" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="bio-text max-h-64 overflow-y-auto pr-4 text-gray-700">
                  <p className="mb-4">
                    Dan has been a police officer for an agency in the pacific northwest for over 10 years. He is currently assigned as a K9 handler, working in patrol, detection, and SWAT roles.
                  </p>
                  <p className="mb-4">
                    In addition to K9, he has served on a Multi-Jurisdictional Regional SWAT team for the last 5 years. He is a CJTC certified firearms instructor in handgun, shotgun, and patrol rifle, and currently serves as the lead firearms instructor for both his agency and the SWAT Team.
                  </p>
                  <p>
                    Dan served for six years in the Marine Corps, with a deployment to Iraq in 2005. He also holds a B.A. in Criminal Justice from Washington State University.
                  </p>
                </div>
              </div>
            </div>

            {/* Fred Hawkins */}
            <div className="professional-card flex flex-col md:flex-row gap-8 bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="profile-content flex flex-col items-center p-8 md:w-1/3 bg-[--accent]/10">
                <div className="relative w-48 h-48 mb-4">
                  <Image 
                    src="/images/cameo-profile-1.jpg" 
                    alt="Fred Hawkins profile" 
                    fill
                    sizes="(max-width: 768px) 192px, 192px"
                    className="rounded-full object-cover border-4 border-[--accent]"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1">Fred Hawkins</h3>
                <Link 
                  href="https://www.instagram.com/fred_hawkins" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[--accent] hover:text-[--accent]/80 mb-4"
                >
                  <Instagram className="mr-1" size={18} />
                  <span>@fred_hawkins</span>
                </Link>
              </div>
              
              <div className="bio-section p-8 md:w-2/3">
                <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/cameo-1.jpg" 
                    alt="Fred Hawkins in action" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="bio-text max-h-64 overflow-y-auto pr-4 text-gray-700">
                  <p>
                    Fred began his career in law enforcement in 2018 and serves in the patrol division. He has a desire to see law enforcement training evolve and give officers the skill sets to do the job safely. Fred leads by example – inspiring officers to seek training along with maintaining a healthy lifestyle.
                  </p>
                </div>
              </div>
            </div>

            {/* Bryan Veliz */}
            <div className="professional-card flex flex-col md:flex-row gap-8 bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="profile-content flex flex-col items-center p-8 md:w-1/3 bg-[--accent]/10">
                <div className="relative w-48 h-48 mb-4">
                  <Image 
                    src="/images/cameo-profile-4.jpg" 
                    alt="Bryan Veliz profile" 
                    fill
                    sizes="(max-width: 768px) 192px, 192px"
                    className="rounded-full object-cover border-4 border-[--accent]"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-1">Bryan Veliz</h3>
                <Link 
                  href="https://www.instagram.com/slytactraining" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[--accent] hover:text-[--accent]/80 mb-4"
                >
                  <Instagram className="mr-1" size={18} />
                  <span>@slytactraining</span>
                </Link>
              </div>
              
              <div className="bio-section p-8 md:w-2/3">
                <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                  <Image 
                    src="/images/cameo-3.jpg" 
                    alt="Bryan Veliz in action" 
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="bio-text max-h-64 overflow-y-auto pr-4 text-gray-700">
                  <p>
                    Bryan began his career as a state law enforcement officer in 2012 serving as an active patrol officer for several years. Within his first two years in the field, he was assigned as a member of his agency&apos;s Special Response Team where he later was responsible for conducting firearms training and qualifications, as well as the instruction of both pistol and carbine weapons platforms. Bryan holds several Law Enforcement and Firearms Instructor certifications and continues to serve in law enforcement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Instagram Feed Section */}
      <InstagramSection />
      <NewsletterSignup />
    </main>
  );
} 