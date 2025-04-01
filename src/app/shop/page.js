import { Suspense } from 'react';
import { getProducts } from '../services/woocommerce';
import ProductGrid from './ProductGrid';
import ProductSkeleton from './ProductSkeleton';
import './products.css';

export const metadata = {
  title: 'Shop | Mantle Clothing',
  description: 'Browse our collection of sustainable, eco-friendly clothing and accessories.',
};

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
        Our Products
      </h1>
      
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
  );
} 