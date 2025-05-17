"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/app/services/woocommerce';
import ButtonWithHover from './ButtonWithHover';

// Helper function to decode HTML entities (can be moved to a utility file later)
function decodeHtmlEntities(text) {
  if (typeof window === 'undefined') {
    let decodedText = text?.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    decodedText = decodedText?.replace(/&#8211;/g, '–');
    decodedText = decodedText?.replace(/&mdash;/g, '—');
    decodedText = decodedText?.replace(/&amp;/g, '&');
    return decodedText || '';
  }
  try {
    const doc = new DOMParser().parseFromString(text || '', 'text/html');
    return doc.body.textContent || '';
  } catch (e) {
    console.error("Error decoding HTML entities:", e);
    return text || '';
  }
}

export default function SideCart() {
  const { cart, callCartApi, isSideCartOpen, closeSideCart, isLoading: isCartLoading } = useCart();
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);

  const handleUpdateQuantity = async (itemKey, newQuantity) => {
    if (newQuantity < 1 || isUpdatingItem || isCartLoading) return;
    setIsUpdatingItem(true);
    try {
      await callCartApi('/wp-json/wc/store/v1/cart/update-item', 'POST', {
        key: itemKey,
        quantity: newQuantity,
      });
    } catch (err) {
      console.error("Failed to update quantity in side cart:", err);
      // Potentially show a small error message within the side cart
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const handleRemoveItem = async (itemKey) => {
    if (isUpdatingItem || isCartLoading) return;
    setIsUpdatingItem(true);
    try {
      await callCartApi('/wp-json/wc/store/v1/cart/remove-item', 'POST', {
        key: itemKey,
      });
    } catch (err) {
      console.error("Failed to remove item from side cart:", err);
      // Potentially show a small error message
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const cartItems = cart?.items || [];
  const subtotal = cart?.totals?.total_items ? parseFloat(cart.totals.total_items) / (10**(cart.totals.currency_minor_unit || 2)) : 0;
  const currencySymbol = cart?.totals?.currency_symbol || '$';

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${isSideCartOpen ? '' : 'opacity-0 pointer-events-none'}`}
        style={isSideCartOpen ? { backgroundColor: 'rgba(0, 0, 0, 0.2)' } : {}}
        onClick={closeSideCart}
      ></div>

      {/* Side Cart Panel */}
      <div 
        className={`fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isSideCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">My Cart</h2>
          <button 
            onClick={closeSideCart} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close cart"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Cart Items */}
        {isCartLoading && cartItems.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <p className="text-gray-600 mb-4">Your cart is currently empty.</p>
            <ButtonWithHover href="/shop" variant="filled" onClick={closeSideCart}>
              Continue Shopping
            </ButtonWithHover>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {cartItems.map(item => {
              const imageUrl = item.images && item.images.length > 0 ? item.images[0].src : '/placeholder.png';
              const itemPrice = item.prices?.price ? parseFloat(item.prices.price) / (10**(cart.totals.currency_minor_unit || 2)) : 0;
              const variationText = item.variation?.map(v => `${v.attribute}: ${v.value}`).join(', ') || '';

              return (
                <div key={item.key} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                  <Link href={`/shop/product/${item.id}`} legacyBehavior>
                    <a className="w-20 h-20 relative flex-shrink-0 rounded-md overflow-hidden border border-gray-200 cursor-pointer">
                      <Image
                        src={imageUrl}
                        alt={decodeHtmlEntities(item.name)}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </a>
                  </Link>
                  <div className="flex-grow">
                    <Link href={`/shop/product/${item.id}`} legacyBehavior>
                     <a className="text-sm font-medium text-gray-800 hover:text-[#9CB24D] cursor-pointer">{decodeHtmlEntities(item.name)}</a>
                    </Link>
                    {variationText && <p className="text-xs text-gray-500 mt-0.5">{variationText}</p>}
                    <p className="text-sm font-semibold text-gray-900 mt-1">{currencySymbol}{itemPrice.toFixed(2)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.key, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdatingItem || isCartLoading}
                        className="p-1 text-gray-500 hover:text-[#9CB24D] disabled:opacity-50"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="px-2 text-sm tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.key, item.quantity + 1)}
                        disabled={isUpdatingItem || isCartLoading}
                        className="p-1 text-gray-500 hover:text-[#9CB24D] disabled:opacity-50"
                        aria-label="Increase quantity"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.key)}
                    disabled={isUpdatingItem || isCartLoading}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-50 ml-2"
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-md font-semibold text-gray-700">Subtotal:</span>
              <span className="text-lg font-bold text-gray-900">{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">Shipping & taxes calculated at checkout.</p>
            <div className="flex justify-center items-center space-x-4">
              <ButtonWithHover
                href="/checkout"
                variant="filled"
                onClick={(e) => {
                  closeSideCart();
                }}
                disabled={isCartLoading || isUpdatingItem}
              >
                Checkout
              </ButtonWithHover>
              <ButtonWithHover
                href="/cart"
                variant="outline"
                onClick={(e) => {
                  closeSideCart();
                }}
                disabled={isCartLoading || isUpdatingItem}
              >
                Edit Cart
              </ButtonWithHover>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 