/**
 * Shared SEO helpers (server-safe, no DOM APIs).
 *
 * Used by generateMetadata functions and JSON-LD components so that every
 * description/title that reaches crawlers is cleaned the same way.
 */

export const SITE_URL = 'https://www.mantle-clothing.com';
export const SITE_NAME = 'Mantle Clothing';

const META_DESCRIPTION_MAX = 155;

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  trade: '™',
  reg: '®',
  copy: '©',
  deg: '°',
};

/**
 * Decode numeric (&#8217; / &#x2019;) and common named (&amp;) HTML entities.
 */
export function decodeEntities(text) {
  if (!text) return '';
  return String(text).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const isHex = code[1] === 'x' || code[1] === 'X';
      const num = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(num) ? String.fromCodePoint(num) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

/**
 * Convert an HTML fragment to a single line of plain text.
 * List items and block elements are separated so words don't run together.
 */
export function htmlToText(html) {
  if (!html) return '';
  const text = String(html)
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(li|p|div|h[1-6])>/gi, '. ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
  return decodeEntities(text)
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.!?])(\s*\.)+/g, '$1')
    .replace(/^[\s.]+/, '')
    .trim();
}

/**
 * Trim text to a meta-description-friendly length on a word boundary.
 */
export function truncate(text, max = META_DESCRIPTION_MAX) {
  if (!text) return '';
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.\-–—]+$/, '')}…`;
}

function getMeta(product, key) {
  return product?.meta_data?.find((m) => m.key === key)?.value || '';
}

/**
 * Full plain-text product description for structured data.
 * Prefers the customer-facing description shown on the product page
 * (custom `description` meta field), then WooCommerce short/long descriptions.
 */
export function getProductDescriptionText(product) {
  if (!product) return '';
  const candidates = [
    getMeta(product, 'description'),
    product.short_description,
    product.description,
  ];
  for (const candidate of candidates) {
    const text = htmlToText(candidate);
    if (text.length >= 20) return text;
  }
  return '';
}

/**
 * Meta description for a product page, with layered fallbacks so a product
 * never ships without one:
 *   1. Yoast meta description (hand-written in WP admin)
 *   2. Customer-facing description / short / long description
 *   3. Yoast OG description (auto-generated from content)
 *   4. A generated sentence from name + category
 */
export function getProductMetaDescription(product) {
  if (!product) return '';
  const yoast = product.yoast_head_json || {};

  const handWritten = htmlToText(yoast.description);
  if (handWritten.length >= 50) return truncate(handWritten);

  const fromContent = getProductDescriptionText(product);
  if (fromContent.length >= 50) return truncate(fromContent);

  const ogDescription = htmlToText(yoast.og_description);
  if (ogDescription.length >= 50) return truncate(ogDescription);

  const name = decodeEntities(product.name);
  const category = product.categories?.[0]?.name;
  const generated = `Shop the ${name}${category && category !== 'Uncategorized' ? ` in ${category}` : ''} from Mantle Clothing — purpose-built, sustainable apparel for law enforcement, first responders and outdoor professionals.`;
  return truncate(generated);
}

/**
 * Serialize JSON-LD safely for embedding in a <script> tag.
 * Escapes `<` so CMS content containing "</script>" can't break out.
 */
export function jsonLdString(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
