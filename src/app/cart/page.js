"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import ButtonWithHover from '../components/ButtonWithHover';
import NewsletterSignup from '../components/NewsletterSignup';

export default function Cart() {
  // This would eventually be replaced with real data from WooCommerce
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Sustainable Raincoat",
      price: 149.99,
      quantity: 1,
      image: "/images/DSCF4744-scaled-e1608145214695.jpg",
      color: "Forest Green",
      size: "Medium"
    },
    {
      id: 2,
      name: "Eco-Friendly Hiking Pants",
      price: 89.99,
      quantity: 2,
      image: "/images/DSCF4564-scaled.jpg",
      color: "Khaki",
      size: "32"
    }
  ]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 10.00 : 0;
  const total = subtotal + shipping;

  // Update quantity function
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove item function
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Empty cart message
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600 mb-6">Your cart is currently empty.</p>
          <ButtonWithHover href="/shop" variant="filled">
            Continue Shopping
          </ButtonWithHover>
        </div>
        
        {/* International shipping notice */}
        <div className="mt-12 mb-12 bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-600 text-sm text-center">
            Please note, for international orders, Mantle Clothing is not responsible for paying duties/taxes or customs fees. The customer will be responsible for paying these charges. Please check in advance to avoid any surprise fees.
          </p>
        </div>
        
        {/* Newsletter signup */}
        <NewsletterSignup />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items - Takes up 2/3 of the space on desktop */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Cart Header */}
            <div className="hidden md:grid md:grid-cols-12 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
              <div className="md:col-span-6">Product</div>
              <div className="md:col-span-2 text-center">Price</div>
              <div className="md:col-span-2 text-center">Quantity</div>
              <div className="md:col-span-2 text-right">Total</div>
            </div>
            
            {/* Cart Items */}
            {cartItems.map((item) => (
              <div key={item.id} className="p-4 md:p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Product Info */}
                <div className="md:col-span-6 flex items-center">
                  <div className="w-24 h-24 relative flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.color}, {item.size}
                    </p>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="mt-2 inline-flex items-center text-sm text-[#9CB24D] hover:text-black md:hidden"
                    >
                      <FiTrash2 className="mr-1 h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
                
                {/* Price */}
                <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                  <span className="md:hidden text-sm text-gray-500">Price:</span>
                  <span className="text-gray-900">${item.price.toFixed(2)}</span>
                </div>
                
                {/* Quantity */}
                <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                  <span className="md:hidden text-sm text-gray-500">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-gray-600 hover:text-[#9CB24D]"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus className="h-3 w-3" />
                    </button>
                    <span className="px-3 py-1 text-center w-10">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-gray-600 hover:text-[#9CB24D]"
                      aria-label="Increase quantity"
                    >
                      <FiPlus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                {/* Total */}
                <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                  <span className="md:hidden text-sm text-gray-500">Total:</span>
                  <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                
                {/* Remove button (desktop) */}
                <button 
                  onClick={() => removeItem(item.id)}
                  className="ml-2 hidden md:block text-gray-400 hover:text-[#9CB24D]"
                  aria-label="Remove item"
                >
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Order Summary - Takes up 1/3 of the space on desktop */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">${shipping.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
                <span className="text-gray-900">Total</span>
                <span className="text-[#9CB24D] text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <button 
                className="w-full bg-[#9CB24D] hover:bg-[#8CA23D] text-white py-3 px-4 rounded-md font-medium transition-colors"
              >
                Proceed to Checkout
              </button>
              
              <Link 
                href="/shop" 
                className="block w-full text-center text-[#9CB24D] hover:text-[#8CA23D] font-medium"
              >
                Continue Shopping
              </Link>
            </div>
            
            {/* Promotional code input */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-2">
                Promotional Code
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="promo-code"
                  name="promo-code"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Enter code"
                />
                <button 
                  className="flex-shrink-0 px-3 py-2 border border-[#9CB24D] text-[#9CB24D] rounded-md hover:bg-[#9CB24D] hover:text-white transition-colors text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* International shipping notice */}
      <div className="mt-12 mb-12 bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-600 text-sm text-center">
          Please note, for international orders, Mantle Clothing is not responsible for paying duties/taxes or customs fees. The customer will be responsible for paying these charges. Please check in advance to avoid any surprise fees.
        </p>
      </div>
      
      {/* Newsletter signup */}
      <NewsletterSignup />
    </div>
  );
} 