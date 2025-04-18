import { Suspense } from 'react';
import { getCollections } from '../services/woocommerce';
import Link from 'next/link';

export const metadata = {
  title: 'Collections | Mantle Clothing',
  description: 'Browse our collections of sustainable, eco-friendly clothing and accessories.',
};

// Component to fetch and display collections
async function CollectionsData() {
  // Fetch collections from the API
  const collectionsData = await getCollections();
  const collections = collectionsData.collections || [];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Link 
          href={`/collections/${collection.slug}`} 
          key={collection.id}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold mb-2">{collection.name}</h2>
          <p className="text-gray-600 mb-3">{collection.count} products</p>
          {collection.description && (
            <div 
              className="text-sm text-gray-500"
              dangerouslySetInnerHTML={{ __html: collection.description }}
            />
          )}
        </Link>
      ))}
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#333'
      }}>
        Collections
      </h1>
      
      {/* Collections list with suspense fallback */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <div key={index} className="block p-6 bg-gray-100 rounded-lg animate-pulse h-32">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      }>
        <CollectionsData />
      </Suspense>
    </div>
  );
} 