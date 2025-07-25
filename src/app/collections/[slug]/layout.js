import { getCollections } from '@/app/services/woocommerce';

export async function generateMetadata({ params: rawParams }) {
  // Ensure params is properly destructured or awaited if necessary,
  // but typically Next.js passes resolved params here.
  const params = await Promise.resolve(rawParams);
  const slug = params.slug;
  
  // It's good practice to use a unique context string for calls to shared services
  const collectionsData = await getCollections(`CollectionSlugLayout-GenerateMetadata-${slug}`);
  const collections = collectionsData.collections || [];
  const collection = collections.find(col => col.slug === slug);
  
  if (!collection) {
    return {
      title: 'Shop Collections | Mantle Clothing',
      description: 'The requested collection could not be found.'
    };
  }
  
  return {
    title: `${collection.name} | Mantle Clothing`,
    description: `Browse our ${collection.name} collection of sustainable products. ${collection.description ? collection.description.replace(/<[^>]*>/g, '') : ''}`.trim()
  };
}

export default function CollectionSlugLayout({ children }) {
  return <>{children}</>;
} 