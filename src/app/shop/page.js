import { Suspense } from 'react';
import ProductSkeleton from '../components/shop/ProductSkeleton';
import Link from 'next/link';
import './products.css';
import ShopSidebar from '../components/ShopSidebar';
import AllProducts from '../components/shop/AllProducts';

export const metadata = {
  title: 'Shop | Mantle Clothing',
  description: 'Browse our collection of sustainable, eco-friendly clothing and accessories.',
};

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
        
        {/* Products grid with React Query */}
        <AllProducts />
      </div>
    </div>
  );
} 