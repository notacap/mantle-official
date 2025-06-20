import { getCategories } from '@/app/services/woocommerce';

export async function generateMetadata({ params: rawParams }) {
  const params = await Promise.resolve(rawParams);
  const slug = params.slug;
  
  const categoriesData = await getCategories(`CategorySlugLayout-GenerateMetadata-${slug}`);
  const categories = categoriesData.categories || [];
  const category = categories.find(cat => cat.slug === slug);
  
  if (!category) {
    return {
      title: 'Shop Categories | Mantle Clothing',
      description: 'The requested category could not be found.'
    };
  }
  
  return {
    title: `${category.name} | Mantle Clothing`,
    description: `Browse our ${category.name} collection. ${category.description ? category.description.replace(/<[^>]*>/g, '') : 'Explore sustainable products.'}`.trim()
  };
}

export default function CategorySlugLayout({ children }) {
  return <>{children}</>;
} 