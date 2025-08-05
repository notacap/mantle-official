"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  const { cart, callCartApi, isSideCartOpen, closeSideCart, isLoading: isCartLoading, applyCoupon, removeCoupon } = useCart();
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
  const router = useRouter();

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: 'error', text: 'Please enter a code.' });
      return;
    }
    setIsApplyingCoupon(true);
    setCouponMessage({ type: '', text: '' });
    try {
      await applyCoupon(couponCode);
      setCouponMessage({ type: 'success', text: 'Coupon applied!' });
      setCouponCode('');
    } catch (err) {
      // WooCommerce often returns HTML in errors, let's try to clean it.
      const message = err.message ? err.message.replace(/<[^>]*>?/gm, '') : 'Invalid coupon code.';
      setCouponMessage({ type: 'error', text: message });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async (code) => {
    setIsUpdatingItem(true); // Re-use existing spinner for simplicity
    setCouponMessage({ type: '', text: '' });
    try {
      await removeCoupon(code);
      setCouponMessage({ type: 'success', text: `Coupon "${code}" removed.` });
    } catch (err) {
      setCouponMessage({ type: 'error', text: err.message || `Could not remove coupon.` });
    } finally {
      setIsUpdatingItem(false);
    }
  };

  const cartItems = cart?.items || [];
  const minorUnit = cart?.totals?.currency_minor_unit || 2;
  const subtotal = cart?.totals?.total_items ? parseFloat(cart.totals.total_items) / (10**minorUnit) : 0;
  const discount = cart?.totals?.total_discount ? parseFloat(cart.totals.total_discount) / (10**minorUnit) : 0;
  const total = cart?.totals?.total_price ? parseFloat(cart.totals.total_price) / (10**minorUnit) : 0;
  const currencySymbol = cart?.totals?.currency_symbol || '$';
  const appliedCoupons = cart?.coupons || [];

  const handleProductLinkClick = async (itemId) => {
    closeSideCart();
    try {
      const response = await fetch(`/api/products?id=${itemId}`);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      const productData = await response.json();
      const product = Array.isArray(productData) ? productData[0] : productData;

      if (product && product.parent_id && product.parent_id !== 0) {
        const parentResponse = await fetch(`/api/products?id=${product.parent_id}`);
        if (!parentResponse.ok) throw new Error('Failed to fetch parent product');
        const parentProductData = await parentResponse.json();
        const parentProduct = Array.isArray(parentProductData) ? parentProductData[0] : parentProductData;
        if (parentProduct && parentProduct.slug) {
          router.push(`/product/${parentProduct.slug}`);
        } else {
          router.push(`/product/${product.parent_id}`);
        }
      } else if (product && product.slug) {
        router.push(`/product/${product.slug}`);
      } else {
        router.push(`/product/${itemId}`);
      }
    } catch (err) {
      console.error("Failed to fetch parent product ID:", err);
      router.push(`/product/${itemId}`);
    }
  };

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
                  <div onClick={() => handleProductLinkClick(item.id)} className="w-20 h-20 relative flex-shrink-0 rounded-md overflow-hidden border border-gray-200 cursor-pointer">
                    <Image
                      src={imageUrl}
                      alt={decodeHtmlEntities(item.name)}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="flex-grow">
                    <div onClick={() => handleProductLinkClick(item.id)} className="text-sm font-medium text-gray-800 hover:text-[#9CB24D] cursor-pointer">
                      {decodeHtmlEntities(item.name)}
                    </div>
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
            {/* Coupon Section */}
            <div className="mb-4">
              {appliedCoupons.length > 0 && (
                <div className="mb-3 space-y-1">
                  {appliedCoupons.map((coupon) => (
                    <div key={coupon.code} className="flex justify-between items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      <span><strong>{coupon.code}</strong> applied!</span>
                      <button onClick={() => handleRemoveCoupon(coupon.code)} className="text-green-800 hover:text-red-500"><FiX /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Gift card or discount code"
                  disabled={isApplyingCoupon || isUpdatingItem}
                  className="block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm text-sm focus:ring-[#9CB24D] focus:border-[#9CB24D]"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode || isUpdatingItem}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#9CB24D] hover:bg-[#8CA23D] disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponMessage.text && (
                <p className={`mt-2 text-xs ${couponMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Totals Section */}
            <div className="space-y-1 mb-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-800">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                 <div className="flex justify-between items-center text-green-600">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium">-{currencySymbol}{discount.toFixed(2)}</span>
                 </div>
              )}
              <div className="flex justify-between items-center text-base pt-1 border-t mt-1">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="font-bold text-gray-900">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4 text-center">Shipping & taxes calculated at checkout.</p>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <ButtonWithHover
                href="/checkout"
                variant="filled"
                onClick={closeSideCart}
                disabled={isCartLoading || isUpdatingItem}
                className="px-8 py-2"
              >
                Checkout
              </ButtonWithHover>
              <ButtonWithHover
                href="/cart"
                variant="outline"
                onClick={closeSideCart}
                disabled={isCartLoading || isUpdatingItem}
                className="px-8 py-2"
              >
                View Cart
              </ButtonWithHover>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 