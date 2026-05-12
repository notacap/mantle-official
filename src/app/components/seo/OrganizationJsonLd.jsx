const SITE_URL = 'https://www.mantle-clothing.com';

export default function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Mantle Clothing',
    legalName: 'Mantle Clothing LLC',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/MANTLE_LOGO.svg`,
      contentUrl: `${SITE_URL}/images/MANTLE_LOGO.svg`,
    },
    description:
      'Purpose-built technical clothing for law enforcement, first responders, and outdoor professionals. Tactical apparel designed by cops, for cops — waterproof, articulated, and field-tested.',
    sameAs: [
      'https://www.instagram.com/mantle_clothing/',
      'https://www.facebook.com/p/Mantle-Clothing-LLC-100063763260203/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${SITE_URL}/contact`,
      availableLanguage: ['English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
