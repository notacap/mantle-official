import { getCategories } from '@/app/services/woocommerce';
import BreadcrumbsJsonLd from '@/app/components/seo/BreadcrumbsJsonLd';

const SITE_URL = 'https://www.mantle-clothing.com';

async function findCategory(slug, contextLabel) {
  const categoriesData = await getCategories(contextLabel);
  const categories = categoriesData.categories || [];
  return categories.find((cat) => cat.slug === slug) || null;
}

export async function generateMetadata({ params: rawParams }) {
  const params = await Promise.resolve(rawParams);
  const slug = params.slug;

  const category = await findCategory(
    slug,
    `CategorySlugLayout-GenerateMetadata-${slug}`
  );

  if (!category) {
    return {
      title: 'Shop Categories | Mantle Clothing',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} | Mantle Clothing`,
    description: `Browse our ${category.name} collection. ${
      category.description
        ? category.description.replace(/<[^>]*>/g, '')
        : 'Quality, sustainable tactical apparel — purpose-built for law enforcement and outdoor professionals.'
    }`.trim(),
    alternates: { canonical: `${SITE_URL}/categories/${slug}` },
  };
}

export default async function CategorySlugLayout({ children, params: rawParams }) {
  const params = await Promise.resolve(rawParams);
  const slug = params.slug;

  const category = await findCategory(
    slug,
    `CategorySlugLayout-Render-${slug}`
  );

  const breadcrumbItems = [
    { name: 'Home', url: `${SITE_URL}/` },
    { name: 'Shop', url: `${SITE_URL}/shop` },
    { name: 'Categories', url: `${SITE_URL}/categories` },
  ];
  if (category?.name) {
    breadcrumbItems.push({
      name: category.name,
      url: `${SITE_URL}/categories/${slug}`,
    });
  }

  return (
    <>
      <BreadcrumbsJsonLd items={breadcrumbItems} />
      {category?.name && <h1 className="sr-only">{category.name} — Mantle Clothing</h1>}
      {children}
    </>
  );
}
