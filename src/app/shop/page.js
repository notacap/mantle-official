import { Suspense } from 'react';
import { getProducts, getCategories, getCollections } from '../services/woocommerce';
import ProductGrid from './ProductGrid';
import ProductSkeleton from './ProductSkeleton';
import Link from 'next/link';
import './products.css';

export const metadata = {
  title: 'Shop | Mantle Clothing',
  description: 'Browse our collection of sustainable, eco-friendly clothing and accessories.',
};

// Navigation sidebar component
async function ShopSidebar() {
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
                  transition: 'background-color 0.2s'
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
                  transition: 'background-color 0.2s'
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

// Component to fetch products data
async function ProductsData() {
  // Fetch products from the API
  const products = await getProducts(24); // Show 24 products by default
  return <ProductGrid products={products} />;
}

export default function Shop() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#333'
      }}>
        Shop All
      </h1>
      
      {/* Main content with sidebar */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Sidebar */}
        <Suspense fallback={
          <div style={{ 
            width: '250px',
            height: '400px',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.5rem',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
        }>
          <ShopSidebar />
        </Suspense>
        
        {/* Products grid with suspense fallback */}
        <Suspense fallback={
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {Array(12).fill(0).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        }>
          <ProductsData />
        </Suspense>
      </div>
    </div>
  );
} 