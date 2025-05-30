'use client';

import { Suspense, useEffect, useState } from 'react';
import { getCategories } from '../services/woocommerce';
import Link from 'next/link';
import Image from 'next/image';

// Mapping category names to image paths
const categoryImageMap = {
  'Pants': '/images/pants.jpg',
  'Tops': '/images/home-4.jpg',
  'Outerwear': '/images/home-1.jpg',
  'Accessories': '/images/accessories.jpg',
};

// Server-side implementation of the category card
function CategoryCard({ category, imageUrl }) {
  return (
    <div style={{ 
      position: 'relative',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
      height: '300px', // Default height for mobile/tablet
      width: '100%',
      boxSizing: 'border-box'
    }} className="xl:h-400 2xl:h-450"> {/* Taller on larger screens */}
      {/* Image container */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        boxSizing: 'border-box'
      }}>
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          style={{ 
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
          }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority
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
          }} className="group-hover:translate-y-[-5px] xl:text-4xl"> {/* Larger text on desktop */}
            {category.name}
          </h3>
          
          <p style={{
            color: 'white',
            fontSize: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
            maxWidth: '90%',
          }} className="xl:text-lg"> {/* Larger text on desktop */}
            {category.count} products
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

// Component to fetch and display categories
function CategoriesData() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        console.log('[CategoriesPage] Fetching categories...');
        const categoriesData = await getCategories('CategoriesPage-Client');
        console.log('[CategoriesPage] Fetched categories data:', JSON.stringify(categoriesData, null, 2));

        const fetchedCategories = categoriesData.categories || [];
        console.log('[CategoriesPage] Parsed categories:', JSON.stringify(fetchedCategories, null, 2));

        // Define the desired category order
        const categoryOrder = ['Pants', 'Tops', 'Outerwear', 'Accessories'];

        // Filter out the 'Uncategorized' category and sort by specified order
        const sortedAndFiltered = fetchedCategories
          .filter(category => category?.name?.toLowerCase() !== 'uncategorized')
          .sort((a, b) => {
            const indexA = categoryOrder.indexOf(a?.name);
            const indexB = categoryOrder.indexOf(b?.name);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a?.name?.localeCompare(b?.name);
          });
        setCategories(sortedAndFiltered);
      } catch (err) {
        console.error("[CategoriesPage] Error in fetchData catch block:", err);
        setError(err.message || 'Failed to load categories.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    // Return the same skeleton/loading UI as the Suspense fallback
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 lg:mt-32 lg:mb-32">
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="block p-6 bg-gray-100 rounded-lg animate-pulse h-80 xl:h-96">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 lg:mt-32 lg:mb-32">
      {categories.map((category) => {
        const imageUrl = categoryImageMap[category.name] || '/images/placeholder.jpg';
        
        return (
          <div key={category.id} className="group">
            <Link href={`/categories/${category.slug}`} className="block">
              <CategoryCard 
                category={category} 
                imageUrl={imageUrl}
              />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="w-full"> {/* Simplified wrapper */}
      <div className="max-w-7xl mx-auto px-4 py-10 xl:py-16"> {/* Changed max-width and padding for larger screens */}
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: '#333'
        }} className="xl:text-5xl xl:mb-12"> {/* Larger title on desktop */}
          Product Categories
        </h1>
        
        {/* Categories list with suspense fallback */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 lg:mt-32 lg:mb-32">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="block p-6 bg-gray-100 rounded-lg animate-pulse h-80 xl:h-96">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
              </div>
            ))}
          </div>
        }>
          <CategoriesData />
        </Suspense>
      </div>
    </div>
  );
} 