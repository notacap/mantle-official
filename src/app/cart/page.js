"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import ButtonWithHover from '../components/ButtonWithHover';
import NewsletterSignup from '../components/NewsletterSignup';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/app/services/woocommerce';

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
  if (typeof window === 'undefined') {
    // Fallback for server-side or environments without DOMParser
    // This might not be perfect but handles common cases.
    // For &#xxxx; entities
    let decodedText = text?.replace(/&#(\\d+);/g, (match, dec) => String.fromCharCode(dec));
    // For &mdash;, &ndash;, etc. (add more as needed)
    decodedText = decodedText?.replace(/&#8211;/g, '–'); // En dash
    decodedText = decodedText?.replace(/&mdash;/g, '—');  // Em dash
    decodedText = decodedText?.replace(/&amp;/g, '&');    // Ampersand
    // Add other common named entities if necessary
    return decodedText || '';
  }
  try {
    const doc = new DOMParser().parseFromString(text || '', 'text/html');
    return doc.body.textContent || '';
  } catch (e) {
    console.error("Error decoding HTML entities:", e);
    return text || ''; // Fallback to original text on error
  }
}

export default function Cart() {
  const { cart, isLoading, error, callCartApi } = useCart();
  const [isUpdatingCartItems, setIsUpdatingCartItems] = useState(false);
  const [editableQuantities, setEditableQuantities] = useState({});

  // Effect to initialize/synchronize editableQuantities when cart items change
  useEffect(() => {
    if (cart?.items) {
      const initialQuantities = {};
      cart.items.forEach(item => {
        // Only update if not already being actively edited or if the cart quantity truly differs
        // This helps prevent user input from being overwritten during minor re-renders unless cart.item.quantity changed
        if (editableQuantities[item.key] === undefined || parseInt(editableQuantities[item.key], 10) !== item.quantity) {
          initialQuantities[item.key] = item.quantity.toString();
        }
      });
      // Only set state if there are actual changes to avoid potential loops with other effects
      if (Object.keys(initialQuantities).length > 0) {
         setEditableQuantities(prev => ({ ...prev, ...initialQuantities }));
      }
    }
  }, [cart?.items]); // Removed editableQuantities from deps to avoid loops, sync is one-way from cart.items

  const handleQuantityInputChange = (itemKey, value) => {
    setEditableQuantities(prev => ({ ...prev, [itemKey]: value }));
  };

  const handleQuantityInputBlur = async (itemKey) => {
    const currentInputValue = editableQuantities[itemKey];
    const originalQuantity = cart.items.find(item => item.key === itemKey)?.quantity;

    if (currentInputValue === undefined || originalQuantity === undefined) return; // Should not happen

    const newQuantity = parseInt(currentInputValue, 10);

    if (isNaN(newQuantity) || newQuantity < 1) {
      // If invalid, revert to original quantity in the input field
      setEditableQuantities(prev => ({ ...prev, [itemKey]: originalQuantity.toString() }));
      alert("Quantity must be a number greater than or equal to 1.");
      return;
    }

    if (newQuantity !== originalQuantity) {
      await updateQuantity(itemKey, newQuantity);
    }
    // If valid but same, or after successful update, ensure the input reflects the confirmed quantity (string form)
    // This is important if updateQuantity internally modifies the cart and triggers a re-sync
    // We rely on the useEffect above to re-sync from cart.items if the actual quantity was updated by API successfully.
  };

  const updateQuantity = async (itemKey, newQuantity) => {
    if (newQuantity < 1 || isUpdatingCartItems || isLoading) return;
    console.log('Attempting to update quantity - Item Key:', itemKey, 'New Quantity:', newQuantity);
    setIsUpdatingCartItems(true);
    try {
      const updatedCart = await callCartApi('/wp-json/wc/store/v1/cart/update-item', 'POST', {
        key: itemKey,
        quantity: newQuantity,
      });
      console.log('API Response - Updated Cart:', updatedCart);
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert(`Error updating quantity: ${err.message}`);
    } finally {
      setIsUpdatingCartItems(false);
    }
  };

  const removeItem = async (itemKey) => {
    if (isUpdatingCartItems || isLoading) return;
    setIsUpdatingCartItems(true);
    try {
      await callCartApi('/wp-json/wc/store/v1/cart/remove-item', 'POST', {
        key: itemKey,
      });
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert(`Error removing item: ${err.message}`);
    } finally {
      setIsUpdatingCartItems(false);
    }
  };

  if (isLoading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-600">Could not load cart information.</p>
      </div>
    );
  }

  const cartItems = cart.items || [];

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
        
        <div className="mt-12 mb-12 bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-600 text-sm text-center">
            Please note, for international orders, Mantle Clothing is not responsible for paying duties/taxes or customs fees. The customer will be responsible for paying these charges. Please check in advance to avoid any surprise fees.
          </p>
        </div>
        
        <NewsletterSignup />
      </div>
    );
  }

  const subtotal = cart.totals?.total_items ? parseFloat(cart.totals.total_items) / (10**cart.totals.currency_minor_unit) : 0;
  const shipping = cart.totals?.total_shipping ? parseFloat(cart.totals.total_shipping) / (10**cart.totals.currency_minor_unit) : 0;
  const total = cart.totals?.total_price ? parseFloat(cart.totals.total_price) / (10**cart.totals.currency_minor_unit) : 0;
  const currencySymbol = cart.totals?.currency_symbol || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      { (isUpdatingCartItems) && 
         <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
           <svg className="animate-spin h-10 w-10 text-[#9CB24D] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <p className="text-lg text-gray-700">Updating cart...</p>
         </div>
      }

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="hidden md:grid md:grid-cols-12 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
              <div className="md:col-span-6">Product</div>
              <div className="md:col-span-2 text-center">Price</div>
              <div className="md:col-span-2 text-center">Quantity</div>
              <div className="md:col-span-2 text-right">Total</div>
            </div>
            
            {cartItems.map((item) => {
              console.log('Rendering Item - Key:', item.key, 'Quantity:', item.quantity);
              const imageUrl = item.images && item.images.length > 0 ? item.images[0].src : '/placeholder.png';
              const itemTotal = item.totals?.line_total ? parseFloat(item.totals.line_total) / (10**cart.totals.currency_minor_unit) : 0;
              const itemPrice = item.prices?.price ? parseFloat(item.prices.price) / (10**cart.totals.currency_minor_unit) : 0;
              const variationText = item.variation?.map(v => `${v.attribute}: ${v.value}`).join(', ') || '';

              return (
                <div key={item.key} className="p-4 md:p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6 flex items-center">
                    <div className="w-24 h-24 relative flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{decodeHtmlEntities(item.name)}</h3>
                      {variationText && 
                        <p className="mt-1 text-sm text-gray-500">
                          {variationText}
                        </p>
                      }
                      <button 
                        onClick={() => removeItem(item.key)}
                        disabled={isUpdatingCartItems || isLoading}
                        className="mt-2 inline-flex items-center text-sm text-[#9CB24D] hover:text-black md:hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiTrash2 className="mr-1 h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                    <span className="md:hidden text-sm text-gray-500">Price:</span>
                    <span className="text-gray-900">{currencySymbol}{itemPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                    <span className="md:hidden text-sm text-gray-500">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdatingCartItems || isLoading}
                        className="p-2 text-gray-600 hover:text-[#9CB24D] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="h-3 w-3" />
                      </button>
                      <input 
                        type="number"
                        value={editableQuantities[item.key] || item.quantity.toString()}
                        onChange={(e) => handleQuantityInputChange(item.key, e.target.value)}
                        onBlur={() => handleQuantityInputBlur(item.key)}
                        disabled={isUpdatingCartItems || isLoading}
                        className="px-1 py-1 text-center w-12 border-none focus:ring-0 focus:outline-none text-sm rounded-md tabular-nums"
                        min="1"
                      />
                      <button 
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        disabled={isUpdatingCartItems || isLoading}
                        className="p-2 text-gray-600 hover:text-[#9CB24D] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-between md:justify-end items-center">
                    <span className="md:hidden text-sm text-gray-500">Total:</span>
                    <span className="text-gray-900 font-medium">{currencySymbol}{itemTotal.toFixed(2)}</span>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.key)}
                    disabled={isUpdatingCartItems || isLoading}
                    className="ml-2 hidden md:block text-gray-400 hover:text-[#9CB24D] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remove item"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-900">{currencySymbol}{shipping.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between font-medium">
                <span className="text-gray-900">Total</span>
                <span className="text-[#9CB24D] text-lg">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <Link 
                href="/checkout"
                passHref
                legacyBehavior
              >
                <button 
                  disabled={isLoading || isUpdatingCartItems || cartItems.length === 0}
                  className="w-full bg-[#9CB24D] hover:bg-[#8CA23D] text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </Link>
              
              <Link 
                href="/shop" 
                className="block w-full text-center text-[#9CB24D] hover:text-[#8CA23D] font-medium"
              >
                Continue Shopping
              </Link>
            </div>
            
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
      
      <div className="mt-12 mb-12 bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-600 text-sm text-center">
          Please note, for international orders, Mantle Clothing is not responsible for paying duties/taxes or customs fees. The customer will be responsible for paying these charges. Please check in advance to avoid any surprise fees.
        </p>
      </div>
      
      <NewsletterSignup />
    </div>
  );
}