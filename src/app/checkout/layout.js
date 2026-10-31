// Transactional page: keep out of search results (also disallowed in robots.js).
export const metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function CheckoutLayout({ children }) {
  return children;
}
