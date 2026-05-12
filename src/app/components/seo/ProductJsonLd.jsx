const SITE_URL = 'https://www.mantle-clothing.com';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

function parsePrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : null;
}

function extractPriceRange(priceHtml) {
  if (!priceHtml) return null;
  const range = priceHtml.match(/\$?([\d,]+\.?\d*)\s*[–\-]\s*\$?([\d,]+\.?\d*)/);
  if (!range) return null;
  const low = parsePrice(range[1]);
  const high = parsePrice(range[2]);
  if (low === null || high === null) return null;
  return { low, high };
}

export default function ProductJsonLd({ product }) {
  if (!product) return null;

  const url = `${SITE_URL}/product/${product.slug}`;
  const images = Array.isArray(product.images)
    ? product.images.map((img) => img.src).filter(Boolean)
    : [];
  const description = stripHtml(
    product.short_description || product.description || ''
  );

  const availability =
    product.stock_status === 'instock'
      ? 'https://schema.org/InStock'
      : product.stock_status === 'onbackorder'
      ? 'https://schema.org/BackOrder'
      : 'https://schema.org/OutOfStock';

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    url,
    image: images.length > 0 ? images : undefined,
    description: description || undefined,
    sku: product.sku || undefined,
    brand: {
      '@type': 'Brand',
      name: 'Mantle Clothing',
    },
  };

  const priceRange = extractPriceRange(product.price_html);
  const singlePrice = parsePrice(product.price || product.regular_price);

  if (product.type === 'variable' && priceRange) {
    data.offers = {
      '@type': 'AggregateOffer',
      url,
      priceCurrency: 'USD',
      lowPrice: priceRange.low.toFixed(2),
      highPrice: priceRange.high.toFixed(2),
      offerCount: Array.isArray(product.variations) ? product.variations.length : undefined,
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    };
  } else if (singlePrice !== null) {
    data.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: singlePrice.toFixed(2),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    };
  }

  const ratingValue = parseFloat(product.average_rating);
  const ratingCount = parseInt(product.rating_count, 10);
  if (Number.isFinite(ratingValue) && ratingValue > 0 && Number.isFinite(ratingCount) && ratingCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      reviewCount: ratingCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
