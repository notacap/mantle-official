import { Suspense } from 'react';
import { getProducts } from '../services/woocommerce';
import ProductGrid from '../components/shop/ProductGrid';
import ProductSkeleton from '../components/shop/ProductSkeleton';
import Link from 'next/link';
import './products.css';
import ShopSidebar from '../components/ShopSidebar';

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