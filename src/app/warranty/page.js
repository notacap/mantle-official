import Image from 'next/image';
import './warranty.css';

export const metadata = {
  title: "Warranty Policy | Mantle Clothing",
  description: "View Mantle Clothing's warranty policy, return information, and warranty claim procedures.",
};

export default function Warranty() {
  return (
    <main className="warranty-page">
      {/* Hero Section */}
      <section className="warranty-hero">
        <div className="hero-image-wrapper">
          <Image 
            src="/images/home-2.jpg"
            alt="Mantle Clothing Warranty" 
            fill
            priority
            className="hero-image"
          />
          <div className="hero-overlay">
            <h1 className="hero-title">Warranty Policy</h1>
          </div>
        </div>
      </section>

      {/* Warranty Content Section */}
      <section className="warranty-content-section">
        <div className="section-container">
          <div className="warranty-container">
            <div className="warranty-header">
              <h2 className="warranty-title">Mantle Clothing Warranty Policy</h2>
            </div>

            <div className="warranty-section">
              <p>
                Returns for sizing exchanges and/or preference must be made within 15 days of purchase. 
                Items must be in new condition or a restocking fee will be applied.
              </p>
              <p>
                Mantle Clothing warrants all apparel to be free of defects in material or workmanship 
                for a period of 30 days from the original date of purchase. The apparel warranty covers 
                defects of workmanship and materials but does not cover damage caused by accident, 
                improper care, negligence, normal wear, and tear, or the natural breakdown of colors 
                and material through time, exposure, or extensive use. If a Mantle Clothing product 
                is found to be defective after inspection by a warranty technician, Mantle Clothing 
                will replace the product with an existing comparable model. Mantle Clothing is not 
                liable for any damages, losses, and/or costs incurred resulting from the loss or 
                usage of our products.
              </p>
            </div>

            <div className="warranty-section">
              <h2>Limited Warranty Policy Limitations</h2>
              <p>The warranty policy is subject to the following limitations:</p>
              <ul>
                <li>All warranty claims must be accompanied by the original purchase receipt.</li>
                <li>All warranty claims returned must have a prior return authorization.</li>
                <li>Replaced products are covered by a new warranty starting from the date of exchange.</li>
              </ul>
            </div>

            <div className="warranty-section">
              <h2>How to Process a Warranty Claim</h2>
              <p>E-mail the warranty department to obtain Warranty Authorization:</p>
              
              <div className="warranty-contact">
                <h3>Contact Information</h3>
                <p>
                  Contact email: <a href="mailto:support@mantle-clothing.com">support@mantle-clothing.com</a>
                </p>
                <p>
                  When emailing, please include:
                </p>
                <ul>
                  <li>Pictures of the item</li>
                  <li>Picture of the proof of purchase</li>
                  <li>Warranty description</li>
                  <li>Customer address</li>
                  <li>Phone number</li>
                </ul>
                
                <p>After contacting the warranty department and receiving your return label:</p>
                <ul>
                  <li>Package your item in an appropriate box.</li>
                  <li>Include a copy of the original receipt.</li>
                </ul>
                
                <div className="warranty-address">
                  <p>Mantle Clothing</p>
                  <p>208 Ellen Street Unit B</p>
                  <p>Garden City, ID 83714</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 