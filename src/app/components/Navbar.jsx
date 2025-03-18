"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
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
              <Link href="/shop" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                Shop
              </Link>
              <Link href="/about" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                About
              </Link>
              <Link href="/partners" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                Partners
              </Link>
              <Link href="/in-the-wild" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                In the Wild
              </Link>
              <Link href="/contact" className="text-black hover:text-[#9CB24D] transition-colors font-medium text-lg">
                Contact
              </Link>
            </div>
          </div>
          
          {/* Cart icon and mobile menu button */}
          <div className="flex items-center">
            {/* Cart Icon (always visible) */}
            <Link href="/cart" className="text-[#9CB24D] hover:text-black transition-colors mr-6">
              <span className="flex items-center">
                <FiShoppingCart className="h-6 w-6" />
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
              href="/shop" 
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg"
              onClick={toggleMenu}
            >
              Shop
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
            <Link 
              href="/contact" 
              className="block px-3 py-2 text-black hover:text-[#9CB24D] hover:bg-gray-50 font-medium text-lg"
              onClick={toggleMenu}
            >
              Contact
            </Link>
            <Link 
              href="/cart" 
              className="block px-3 py-2 text-[#9CB24D] hover:text-black hover:bg-gray-50 font-medium text-lg md:hidden"
              onClick={toggleMenu}
            >
              <span className="flex items-center">
                <FiShoppingCart className="h-6 w-6 mr-2" />
                Shopping Cart
              </span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 