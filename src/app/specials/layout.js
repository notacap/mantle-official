const SITE_URL = 'https://www.mantle-clothing.com';

export const metadata = {
  title: 'Specials & Current Promotions | Mantle Clothing',
  description:
    'Current deals and limited-time promotions on Mantle Clothing tactical and outdoor apparel for law enforcement, first responders and outdoor professionals.',
  alternates: { canonical: `${SITE_URL}/specials` },
  openGraph: {
    title: 'Specials & Current Promotions | Mantle Clothing',
    description:
      'Current deals and limited-time promotions on Mantle Clothing tactical and outdoor apparel.',
    url: `${SITE_URL}/specials`,
    siteName: 'Mantle Clothing',
    type: 'website',
    locale: 'en_US',
  },
};

export default function SpecialsLayout({ children }) {
  return children;
}
