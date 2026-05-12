import { getCollections } from '@/app/services/woocommerce';
import BreadcrumbsJsonLd from '@/app/components/seo/BreadcrumbsJsonLd';

const SITE_URL = 'https://www.mantle-clothing.com';

async function findCollection(slug, contextLabel) {
  const collectionsData = await getCollections(contextLabel);
  const collections = collectionsData.collections || [];
  return collections.find((col) => col.slug === slug) || null;
}

export async function generateMetadata({ params: rawParams }) {
  const params = await Promise.resolve(rawParams);
  const slug = params.slug;

  const collection = await findCollection(
    slug,
    `CollectionSlugLayout-GenerateMetadata-${slug}`
  );

  if (!collection) {
    return {
      title: 'Shop Collections | Mantle Clothing',
      description: 'The requested collection could not be found.',
    };
  }

  return {
    title: `${collection.name} | Mantle Clothing`,
    description: `Browse our ${collection.name}. ${
      collection.description
        ? collection.description.replace(/<[^>]*>/g, '')
        : 'Purpose-built tactical apparel for law enforcement and outdoor professionals.'
    }`.trim(),
    alternates: { canonical: `${SITE_URL}/collections/${slug}` },
  };
}

export default async function CollectionSlugLayout({ children, params: rawParams }) {
  const params = await Promise.resolve(rawParams);
  const slug = params.slug;

  const collection = await findCollection(
    slug,
    `CollectionSlugLayout-Render-${slug}`
  );

  const breadcrumbItems = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Shop', url: `${SITE_URL}/shop` },
    { name: 'Collections', url: `${SITE_URL}/collections` },
  ];
  if (collection?.name) {
    breadcrumbItems.push({
      name: collection.name,
      url: `${SITE_URL}/collections/${slug}`,
    });
  }

  return (
    <>
      <BreadcrumbsJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
