'use client';

import { Suspense, useEffect, useState } from 'react';
import { getCollections } from '../services/woocommerce';
import Link from 'next/link';
import Image from 'next/image';

// Mapping collection names to image paths
const collectionImageMap = {
  'The Rain Collection': '/images/rain_collection.jpg',
  'The Range Collection': '/images/range_collection.png',
  // Add more collections here if needed
  // Fallback image if a collection isn't in the map
  'default': '/images/placeholder.jpg' 
};

// export const metadata = { // Removed due to "use client"
//   title: 'Collections | Mantle Clothing',
//   description: 'Browse our collections of sustainable, eco-friendly clothing and accessories.',
// };

// CollectionCard component (adapted from CategoryCard)
function CollectionCard({ collection, imageUrl }) {
  return (
    <div style={{ 
      position: 'relative',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
      height: '300px', // Default height
      width: '100%',
      boxSizing: 'border-box'
    }} className="xl:h-400 2xl:h-450 group"> {/* Taller on larger screens, added group class */}
      {/* Image container */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        boxSizing: 'border-box'
      }}>
        <Image
          src={imageUrl}
          alt={collection.name}
          fill
          style={{ 
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Adjusted sizes
          priority // Consider if all cards visible initially need priority
          className="group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1.5rem',
          transition: 'background-color 0.3s ease',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          boxSizing: 'border-box'
        }} className="group-hover:bg-black/65">
          <h3 style={{
            color: 'white',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            marginBottom: '0.75rem',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease',
          }} className="group-hover:translate-y-[-5px] xl:text-4xl">
            {collection.name}
          </h3>
          
          <p style={{
            color: 'white',
            fontSize: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            maxWidth: '90%',
          }} className="xl:text-lg">
            {collection.count} products
          </p>
          
          <div style={{
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: 0,
            transform: 'translateY(20px)',
          }} className="group-hover:opacity-100 group-hover:translate-y-0">
            <div
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.25rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#9CB24D',
                color: 'white',
                border: '2px solid #9CB24D',
              }}
              className="hover:bg-[#8CA23D] xl:text-lg xl:px-6 xl:py-3 cursor-pointer"
            >
              Explore
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component to fetch and display collections
function CollectionsData() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const collectionsData = await getCollections('CollectionsPage-Client');
        setCollections(collectionsData.collections || []);
      } catch (err) {
        console.error("[CollectionsPage] Error in fetchData catch block:", err);
        setError(err.message || 'Failed to load collections.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    // Return the same skeleton/loading UI as the Suspense fallback
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="block p-6 bg-gray-100 rounded-lg animate-pulse h-32">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }

  // Fetch collections from the API
  // const collectionsData = await getCollections();
  // const collections = collectionsData.collections || [];
  
  return (
    <div className="flex flex-wrap justify-center items-start gap-6"> {/* Changed from grid to flex for centering */}
      {collections.map((collection) => {
        // Get image URL from map, or use default if not found
        const imageUrl = collectionImageMap[collection.name] || collectionImageMap.default;
        
        return (
          <div key={collection.id} className="group w-full max-w-sm"> {/* Added w-full max-w-sm for flex item sizing */}
            <Link 
              href={`/collections/${collection.slug}`} 
              className="block" // Ensure Link takes full space for clickability
            >
              <CollectionCard collection={collection} imageUrl={imageUrl} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Breadcrumb navigation */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Home</Link> {' / '}
        <Link href="/shop" className="hover:underline">Shop</Link> {' / '}
        <span className="font-medium text-gray-700">Collections</span>
      </div>

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