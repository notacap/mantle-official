'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { FiX } from 'react-icons/fi';
import { createPortal } from 'react-dom';

export default function ShopSidebar({ currentSlug, isCategoryPage = true, isMobileMode = false, isOpen = false, onClose = () => {} }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [isHoveredCategory, setIsHoveredCategory] = useState(null);
  const [isHoveredCollection, setIsHoveredCollection] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories using React Query
  const { 
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    }
  });
  
  // Fetch collections using React Query
  const { 
    data: collectionsData,
    isLoading: isLoadingCollections,
    error: collectionsError
  } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await fetch('/api/collections');
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      return response.json();
    }
  });
  
  // Log errors if they occur
  useEffect(() => {
    if (categoriesError) console.error('Categories error:', categoriesError);
    if (collectionsError) console.error('Collections error:', collectionsError);
  }, [categoriesError, collectionsError]);
  
  // Extract data
  const categories = categoriesData?.categories || [];
  const collections = collectionsData?.collections || [];
  
  // Define the desired category order
  const categoryOrder = ['Pants', 'Tops', 'Outerwear', 'Accessories'];
  
  // Filter out the 'Uncategorized' category and sort by specified order
  const sortedCategories = categories
    .filter(category => category?.name?.toLowerCase() !== 'uncategorized')
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a?.name);
      const indexB = categoryOrder.indexOf(b?.name);
      // If both categories are in the order list, sort by their position
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only one category is in the order list, it should come first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither category is in the order list, sort alphabetically
      return a?.name?.localeCompare(b?.name);
    });
  
  // Prefetch data for categories/collections on hover
  useEffect(() => {
    if (isHoveredCategory) {
      queryClient.prefetchQuery({
        queryKey: ['products', 'category', isHoveredCategory],
        queryFn: async () => {
          const response = await fetch(`/api/products/category?category=${isHoveredCategory}&limit=24`);
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        }
      });
    }
    
    if (isHoveredCollection) {
      queryClient.prefetchQuery({
        queryKey: ['products', 'tag', isHoveredCollection],
        queryFn: async () => {
          const response = await fetch(`/api/products/tag?tag=${isHoveredCollection}&limit=24`);
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        }
      });
    }
  }, [isHoveredCategory, isHoveredCollection, queryClient]);
  
  const sidebarInnerContent = (
    <>
      {isMobileMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333' }}>Filters</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX size={24} color="#333" />
          </button>
        </div>
      )}
      <div style={{ 
        padding: isMobileMode ? '1rem' : '1rem 0',
        overflowY: isMobileMode ? 'auto' : 'visible',
        height: isMobileMode ? 'calc(100% - 65px)' : 'auto',
        backgroundColor: isMobileMode ? '#f9fafb' : 'transparent'
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
            {sortedCategories.map((category) => (
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
                  onMouseEnter={() => setIsHoveredCategory(category.id)}
                  onMouseLeave={() => setIsHoveredCategory(null)}
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
                  onMouseEnter={() => setIsHoveredCollection(collection.slug)}
                  onMouseLeave={() => setIsHoveredCollection(null)}
                >
                  {collection.name} ({collection.count})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
  
  // Generate loading skeleton when data is loading
  if (isLoadingCategories || isLoadingCollections) {
    if (isMobileMode) {
      if (!isOpen || !mounted) return null;
      return createPortal(
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              zIndex: 999,
              transition: 'opacity 0.3s ease-in-out',
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? 'auto' : 'none',
            }}
            onClick={onClose}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '280px',
            maxWidth: 'calc(100vw - 40px)',
            height: '100%',
            backgroundColor: '#f9fafb',
            zIndex: 1000,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease-in-out',
            boxShadow: '0 0 15px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333' }}>Filters</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FiX size={24} color="#333" />
              </button>
            </div>
            <div style={{ padding: '1rem', flexGrow: 1, overflowY: 'auto' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ height: '24px', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} style={{ height: '30px', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
              <div>
                <div style={{ height: '24px', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} style={{ height: '30px', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', marginBottom: '0.5rem', animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      );
    }
    // Original skeleton for desktop
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
            {Array(4).fill(0).map((_, i) => (
              <li key={i} style={{ 
                marginBottom: '0.5rem',
                height: '30px',
                backgroundColor: '#e5e7eb',
                borderRadius: '0.25rem',
                animation: 'pulse 1.5s infinite'
              }} />
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
            {Array(3).fill(0).map((_, i) => (
              <li key={i} style={{ 
                marginBottom: '0.5rem',
                height: '30px',
                backgroundColor: '#e5e7eb',
                borderRadius: '0.25rem',
                animation: 'pulse 1.5s infinite'
              }} />
            ))}
          </ul>
        </div>
      </div>
    );
  }
  
  // Mobile mode rendering
  if (isMobileMode) {
    if (!isOpen || !mounted) return null;

    return createPortal(
      <>
        {/* Overlay */}
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            zIndex: 999,
            transition: 'opacity 0.3s ease-in-out',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          onClick={onClose}
        />
        {/* Sidebar Panel */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          maxWidth: 'calc(100vw - 40px)',
          height: '100%',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          boxShadow: '0 0 15px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {sidebarInnerContent}
        </div>
      </>,
      document.body
    );
  }

  // Default (desktop) rendering
  return (
    <div style={{ 
      width: '250px',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.5rem',
      height: 'fit-content'
    }}>
      {sidebarInnerContent}
    </div>
  );
} 