import { getProducts } from '../services/woocommerce';
import ProductGrid from './ProductGrid';

export const metadata = {
  title: 'Shop | Mantle Clothing',
  description: 'Browse our collection of sustainable, eco-friendly clothing and accessories.',
};

export default async function Shop() {
  // Fetch products from the API
  const products = await getProducts(24); // Show 24 products by default
  
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
      
      {/* Products grid */}
      <ProductGrid products={products} />
    </div>
  );
} 