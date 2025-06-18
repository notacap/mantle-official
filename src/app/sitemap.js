const URL = process.env.NEXT_PUBLIC_SITE_URL;

async function fetchAllWooCommerceItems(endpoint) {
  let allItems = [];
  let page = 1;
  let totalPages = 1;
  const consumer_key = process.env.WOOCOMMERCE_CONSUMER_KEY;
  const consumer_secret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
  const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;

  if (!consumer_key || !consumer_secret || !wordpressUrl) {
    console.error("WooCommerce API credentials are not set in environment variables.");
    return [];
  }

  do {
    const apiUrl = new URL(`${wordpressUrl}/wp-json/wc/v3/${endpoint}`);
    apiUrl.searchParams.append('per_page', '100');
    apiUrl.searchParams.append('page', page.toString());
    apiUrl.searchParams.append('consumer_key', consumer_key);
    apiUrl.searchParams.append('consumer_secret', consumer_secret);
    
    // For products, only get published and in-stock items
    if (endpoint === 'products') {
        apiUrl.searchParams.append('status', 'publish');
        apiUrl.searchParams.append('stock_status', 'instock');
    }

    const response = await fetch(apiUrl.toString(), {
        // Use Next.js's built-in fetch caching
        next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
        console.error(`Failed to fetch ${endpoint} from WooCommerce: ${response.status}`);
        break;
    }

    const items = await response.json();
    if (items.length > 0) {
        allItems = allItems.concat(items);
    }
    
    const totalPagesHeader = response.headers.get('X-WP-TotalPages');
    if (totalPagesHeader) {
        totalPages = parseInt(totalPagesHeader, 10);
    } else {
        // If the header is missing, we assume we got all items in the first page
        totalPages = 0;
    }

    page++;
  } while (page <= totalPages);

  return allItems;
}

export default async function sitemap() {
  const allProducts = await fetchAllWooCommerceItems('products');
  const allCategories = await fetchAllWooCommerceItems('products/categories');
  const allCollections = await fetchAllWooCommerceItems('products/tags');

  const products = allProducts.map(({ slug, date_modified }) => ({
    url: `${URL}/product/${slug}`,
    lastModified: date_modified,
  }));

  const categories = allCategories.filter(c => c.count > 0).map(({ slug }) => ({
    url: `${URL}/categories/${slug}`,
    lastModified: new Date().toISOString(),
  }));

  const collections = allCollections.filter(c => c.count > 0).map(({ slug }) => ({
    url: `${URL}/collections/${slug}`,
    lastModified: new Date().toISOString(),
  }));

  const routes = [
    '',
    '/about',
    '/blog',
    '/cart',
    '/categories',
    '/checkout',
    '/collections',
    '/contact',
    '/in-the-wild',
    // '/order-confirmation', // This page is not useful for SEO
    '/partners',
    '/shop',
    '/warranty',
  ].map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date().toISOString(),
  }));

  return [...routes, ...products, ...categories, ...collections];
} 