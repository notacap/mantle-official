"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/context/CartContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopHovered, setIsShopHovered] = useState(false);
  const [hoveredSection, setHoveredSection] = useState(null);
  
  const shopMenuRef = useRef(null);
  const categoryRef = useRef(null);
  const collectionRef = useRef(null);
  const categorySubmenuRef = useRef(null);
  const collectionSubmenuRef = useRef(null);

  const { cart } = useCart();
  const itemCount = cart?.items_count || 0;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle shop hover
  const handleShopMouseEnter = () => {
    setIsShopHovered(true);
  };

  const handleShopMouseLeave = (e) => {
    // Check if we're moving to any of the submenus before closing
    const relatedTargets = [
      categoryRef.current, 
      collectionRef.current,
      categorySubmenuRef.current, 
      collectionSubmenuRef.current
    ];
    
    // Don't close if hovering over or moving to any of our menu elements
    for (const target of relatedTargets) {
      if (target && (target.contains(e.relatedTarget) || target === e.relatedTarget)) {
        return;
      }
    }
    
    setIsShopHovered(false);
    setHoveredSection(null);
  };

  // Handle category hover
  const handleCategoryMouseEnter = () => {
    setHoveredSection('categories');
  };

  const handleCategoryMouseLeave = (e) => {
    // Don't close the menu if moving to the submenu
    if (
      categorySubmenuRef.current && 
      (categorySubmenuRef.current.contains(e.relatedTarget) || categorySubmenuRef.current === e.relatedTarget)
    ) {
      return;
    }
    
    // Only clear hoveredSection if we're not moving to another menu item
    if (
      !collectionRef.current?.contains(e.relatedTarget) &&
      e.relatedTarget !== collectionRef.current
    ) {
      setHoveredSection(null);
    }
  };

  // Handle submenu hover
  const handleCategorySubmenuMouseLeave = (e) => {
    // Keep the menu open only if we're moving to the category link
    if (
      categoryRef.current && 
      (categoryRef.current.contains(e.relatedTarget) || categoryRef.current === e.relatedTarget)
    ) {
      return;
    }
    
    // If we're moving outside the dropdown entirely, close everything
    if (
      !shopMenuRef.current?.contains(e.relatedTarget) ||
      (!categoryRef.current?.contains(e.relatedTarget) && 
       !collectionRef.current?.contains(e.relatedTarget))
    ) {
      setHoveredSection(null);
    }
  };

  // Handle collection hover
  const handleCollectionMouseEnter = () => {
    setHoveredSection('collections');
  };

  const handleCollectionMouseLeave = (e) => {
    // Don't close the menu if moving to the submenu
    if (
      collectionSubmenuRef.current && 
      (collectionSubmenuRef.current.contains(e.relatedTarget) || collectionSubmenuRef.current === e.relatedTarget)
    ) {
      return;
    }
    
    // Only clear hoveredSection if we're not moving to another menu item
    if (
      !categoryRef.current?.contains(e.relatedTarget) &&
      e.relatedTarget !== categoryRef.current
    ) {
      setHoveredSection(null);
    }
  };

  // Handle submenu hover
  const handleCollectionSubmenuMouseLeave = (e) => {
    // Keep the menu open only if we're moving to the collection link
    if (
      collectionRef.current && 
      (collectionRef.current.contains(e.relatedTarget) || collectionRef.current === e.relatedTarget)
    ) {
      return;
    }
    
    // If we're moving outside the dropdown entirely, close everything
    if (
      !shopMenuRef.current?.contains(e.relatedTarget) ||
      (!categoryRef.current?.contains(e.relatedTarget) && 
       !collectionRef.current?.contains(e.relatedTarget))
    ) {
      setHoveredSection(null);
    }
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target)) {
        setIsShopHovered(false);
        setHoveredSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch categories using React Query
  const { 
    data: categoriesData,
    isLoading: isLoadingCategories,
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
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a?.name?.localeCompare(b?.name);
    });

  return (
    <nav className="bg-white border-b border-gray-200 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo - left aligned */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image 
                src="/images/logo.svg" 
                alt="Mantle Clothing" 
                width={150} 
                height={75} 
                className="h-16 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation - centered with more spacing */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="flex space-x-12">
              <Link
                href="/black-friday"
                className="text-red-600 hover:text-red-700 transition-colors font-bold text-lg flex items-center gap-1.5"
              >
                <span className="animate-pulse">Black Friday</span>
              </Link>
              <div
                ref={shopMenuRef}
                className="relative group"
                onMouseEnter={handleShopMouseEnter}
                onMouseLeave={handleShopMouseLeave}
              >
                <Link href="/shop" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                  Shop
                </Link>
                
                {/* Shop Dropdown Menu */}
                {isShopHovered && (
                  <div className="absolute left-0 mt-1 w-52 bg-white border border-gray-200 rounded-md shadow-lg z-20 overflow-visible">
                    {/* Create an invisible connector to prevent hover gap issues */}
                    <div className="absolute w-full h-2 -top-2 left-0"></div>
                    
                    <div 
                      ref={categoryRef}
                      className="relative py-1 hover:bg-gray-50"
                      onMouseEnter={handleCategoryMouseEnter}
                      onMouseLeave={handleCategoryMouseLeave}
                    >
                      <Link 
                        href="/categories" 
                        className="block px-4 py-2 text-black hover:text-[#9CB24D] transition-colors w-full"
                      >
                        Categories
                      </Link>
                      
                      {/* Categories Submenu */}
                      {hoveredSection === 'categories' && (
                        <div 
                          ref={categorySubmenuRef}
                          className="absolute left-full top-0 w-56 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
                          onMouseLeave={handleCategorySubmenuMouseLeave}
                        >
                          {/* Create an invisible connector to prevent hover gap issues */}
                          <div className="absolute w-2 h-full -left-2 top-0"></div>
                          {isLoadingCategories ? (
                            <div className="px-4 py-3 text-gray-500">Loading...</div>
                          ) : sortedCategories.length > 0 ? (
                            sortedCategories.map((category) => (
                              <Link 
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="block px-4 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 transition-colors"
                              >
                                {category.name} ({category.count})
                              </Link>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500">No categories found</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div 
                      ref={collectionRef}
                      className="relative py-1 hover:bg-gray-50"
                      onMouseEnter={handleCollectionMouseEnter}
                      onMouseLeave={handleCollectionMouseLeave}
                    >
                      <Link 
                        href="/collections" 
                        className="block px-4 py-2 text-black hover:text-[#9CB24D] transition-colors w-full"
                      >
                        Collections
                      </Link>
                      
                      {/* Collections Submenu */}
                      {hoveredSection === 'collections' && (
                        <div 
                          ref={collectionSubmenuRef}
                          className="absolute left-full top-0 w-56 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
                          onMouseLeave={handleCollectionSubmenuMouseLeave}
                        >
                          {/* Create an invisible connector to prevent hover gap issues */}
                          <div className="absolute w-2 h-full -left-2 top-0"></div>
                          {isLoadingCollections ? (
                            <div className="px-4 py-3 text-gray-500">Loading...</div>
                          ) : collections.length > 0 ? (
                            collections.map((collection) => (
                              <Link 
                                key={collection.id}
                                href={`/collections/${collection.slug}`}
                                className="block px-4 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 transition-colors"
                              >
                                {collection.name} ({collection.count})
                              </Link>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500">No collections found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <Link href="/about" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                About
              </Link>
              <Link href="/partners" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                Partners
              </Link>
              <Link href="/in-the-wild" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                In the Wild
              </Link>
              <div className="flex items-center space-x-2 cursor-not-allowed">
                <span className="text-gray-400 font-medium text-lg">Blog</span>
                <span className="text-xs bg-gray-200 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
              <Link href="/contact" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                Contact
              </Link>
            </div>
          </div>
          
          {/* Cart icon and mobile menu button */}
          <div className="flex items-center">
            {/* Cart Icon (always visible) */}
            <Link href="/cart" className="text-[#9CB24D] hover:text-black transition-colors mr-6 relative">
              <span className="flex items-center">
                <FiShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {itemCount}
                  </span>
                )}
              </span>
            </Link>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-black hover:text-[#9CB24D] focus:outline-none"
                onClick={toggleMenu}
              >
                {isMenuOpen ? (
                  <FiX className="h-7 w-7" />
                ) : (
                  <FiMenu className="h-7 w-7" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
            <Link
              href="/black-friday"
              className="block px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-bold text-lg"
              onClick={toggleMenu}
            >
              Black Friday Sale
            </Link>
            <Link
              href="/shop"
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg"
              onClick={toggleMenu}
            >
              Shop
            </Link>
            <Link 
              href="/categories" 
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg pl-6"
              onClick={toggleMenu}
            >
              Categories
            </Link>
            <Link 
              href="/collections" 
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg pl-6"
              onClick={toggleMenu}
            >
              Collections
            </Link>
            <Link 
              href="/about" 
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg"
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link 
              href="/partners" 
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg"
              onClick={toggleMenu}
            >
              Partners
            </Link>
            <Link 
              href="/in-the-wild" 
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg"
              onClick={toggleMenu}
            >
              In the Wild
            </Link>
            <div className="flex cursor-not-allowed items-center space-x-3 px-3 py-2">
                <span className="text-gray-400 font-medium text-lg">Blog</span>
                <span className="text-xs bg-gray-200 text-gray-500 font-semibold px-2 py-0.5 rounded-full">
                    Coming Soon
                </span>
            </div>
            <Link 
              href="/contact" 
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            <Link 
              href="/cart" 
              className="block px-3 py-2 text-[#9CB24D] hover:text-black hover:bg-gray-50 font-medium text-lg md:hidden relative"
              onClick={toggleMenu}
            >
              <span className="flex items-center">
                <FiShoppingCart className="h-6 w-6 mr-2" />
                Shopping Cart
                {itemCount > 0 && (
                  <span className="absolute top-1 left-6 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {itemCount}
                  </span>
                )}
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 