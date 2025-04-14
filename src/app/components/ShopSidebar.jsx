import Link from 'next/link';
import { getCategories, getCollections } from '../services/woocommerce';

export default async function ShopSidebar({ currentSlug, isCategoryPage = true }) {
  // Fetch categories and collections
  const [categoriesData, collectionsData] = await Promise.all([
    getCategories(),
    getCollections()
  ]);
  
  // Define the desired category order
  const categoryOrder = ['Pants', 'Tops', 'Outerwear', 'Accessories'];
  
  // Filter out the 'Uncategorized' category and sort by specified order
  const categories = (categoriesData.categories || [])
    .filter(category => category.name.toLowerCase() !== 'uncategorized')
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.name);
      const indexB = categoryOrder.indexOf(b.name);
      // If both categories are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only one category is in the order list, it should come first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither category is in the order list, sort alphabetically
      return a.name.localeCompare(b.name);
    });
  
  const collections = collectionsData.collections || [];
  
  return (
    <div style={{ 
      width: '250px',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      height: 'fit-content'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#333'
        }}>
          Categories
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categories.map((category) => (
            <li key={category.id} style={{ marginBottom: '0.5rem' }}>
              <Link 
                href={`/categories/${category.slug}`}
                style={{
                  color: '#4b5563',
                  textDecoration: 'none',
                  display: 'block',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'background-color 0.2s',
                  backgroundColor: isCategoryPage && category.slug === currentSlug ? '#e5e7eb' : 'transparent'
                }}
                className="hover:bg-gray-100"
              >
                {category.name} ({category.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#333'
        }}>
          Collections
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {collections.map((collection) => (
            <li key={collection.id} style={{ marginBottom: '0.5rem' }}>
              <Link 
                href={`/collections/${collection.slug}`}
                style={{
                  color: '#4b5563',
                  textDecoration: 'none',
                  display: 'block',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  transition: 'background-color 0.2s',
                  backgroundColor: !isCategoryPage && collection.slug === currentSlug ? '#e5e7eb' : 'transparent'
                }}
                className="hover:bg-gray-100"
              >
                {collection.name} ({collection.count})
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 