"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

// Helper function to decode HTML entities (can be moved to a utility file later if not already present)
function decodeHtmlEntities(text) {
  if (typeof window === 'undefined') {
    let decodedText = text?.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    decodedText = decodedText?.replace(/&#8211;/g, '–'); // En dash
    decodedText = decodedText?.replace(/&mdash;/g, '—');  // Em dash
    decodedText = decodedText?.replace(/&amp;/g, '&');    // Ampersand
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

export default function CheckoutCartSummary() {
  const { cart, isLoading: isCartLoading } = useCart();
  const router = useRouter();

  if (isCartLoading && !cart) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
        <p className="text-gray-500">Loading summary...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
        <p className="text-gray-600">Your cart is empty.</p>
      </div>
    );
  }

  const cartItems = cart.items || [];
  const currencySymbol = cart.totals?.currency_symbol || '$';
  const currencyMinorUnit = cart.totals?.currency_minor_unit || 2;

  const subtotal = cart.totals?.total_items ? parseFloat(cart.totals.total_items) / (10**currencyMinorUnit) : 0;
  const shipping = cart.totals?.total_shipping ? parseFloat(cart.totals.total_shipping) / (10**currencyMinorUnit) : 0;
  const taxes = cart.totals?.total_tax ? parseFloat(cart.totals.total_tax) / (10**currencyMinorUnit) : 0; // Assuming total_tax exists
  const total = cart.totals?.total_price ? parseFloat(cart.totals.total_price) / (10**currencyMinorUnit) : 0;

  const handleProductLinkClick = async (itemId) => {
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
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">Order Summary</h2>
      
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
        {cartItems.map((item) => {
          const imageUrl = item.images && item.images.length > 0 ? item.images[0].src : '/placeholder.png';
          const itemLineTotal = item.totals?.line_total ? parseFloat(item.totals.line_total) / (10**currencyMinorUnit) : 0;
          const variationText = item.variation?.map(v => `${v.attribute}: ${v.value}`).join(', ') || '';

          return (
            <div key={item.key} className="flex items-start space-x-4 py-3 border-b border-gray-200 last:border-b-0">
              <div onClick={() => handleProductLinkClick(item.id)} className="w-20 h-20 relative flex-shrink-0 rounded-md overflow-hidden border border-gray-200 bg-white cursor-pointer">
                <Image
                  src={imageUrl}
                  alt={decodeHtmlEntities(item.name)}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 20vw, 80px"
                />
              </div>
              <div className="flex-grow">
                <div onClick={() => handleProductLinkClick(item.id)} className="text-md font-medium text-gray-800 hover:text-[#9CB24D] cursor-pointer">
                  {decodeHtmlEntities(item.name)}
                </div>
                {variationText && <p className="text-xs text-gray-500 mt-0.5">{variationText}</p>}
                <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
              </div>
              <div className="text-md font-medium text-gray-900 whitespace-nowrap">
                {currencySymbol}{itemLineTotal.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 border-t pt-6">
        <div className="flex justify-between text-md text-gray-700">
          <span>Subtotal</span>
          <span className="font-medium">{currencySymbol}{subtotal.toFixed(2)}</span>
        </div>
        {shipping > 0 && (
          <div className="flex justify-between text-md text-gray-700">
            <span>Shipping</span>
            <span className="font-medium">{currencySymbol}{shipping.toFixed(2)}</span>
          </div>
        )}
        {taxes > 0 && (
           <div className="flex justify-between text-md text-gray-700">
            <span>Taxes</span>
            <span className="font-medium">{currencySymbol}{taxes.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-semibold text-gray-900 pt-2 mt-2 border-t border-gray-300">
          <span>Total</span>
          <span>{currencySymbol}{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
} 