const SITE_URL = 'https://www.mantle-clothing.com';

export default function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Mantle Clothing',
    url: SITE_URL,
    description:
      'Premium tactical and outdoor apparel for law enforcement, first responders, and operational professionals.',
    inLanguage: 'en-US',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
