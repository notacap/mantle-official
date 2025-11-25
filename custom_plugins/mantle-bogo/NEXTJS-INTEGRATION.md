# Next.js Integration Guide

Complete guide for integrating Mantle BOGO plugin with the Mantle Clothing Next.js frontend.

## Overview

The Next.js site needs to:
1. Call the BOGO validation API when cart changes
2. Display discount information to customers
3. Apply discounts when creating orders
4. Show active deal banners (optional)

## Architecture Notes

This integration works with the existing project architecture:
- **CartContext** (`src/context/CartContext.js`) - Existing cart state management
- **WooCommerce Store API** - Direct cart operations via `callCartApi()`
- **Custom REST API** - BOGO plugin exposes `/wp-json/mantle/v1/*` endpoints

## Step 1: Create BOGO Validation Hook

Create a custom hook that integrates with the existing cart system:

```javascript
// src/app/hooks/useBOGOValidation.js
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from '@/context/CartContext';

/**
 * Hook for validating cart against BOGO deals
 * Integrates with existing CartContext
 */
export function useBOGOValidation() {
  const { cart } = useCart();
  const [bogoDiscount, setBogoDiscount] = useState(0);
  const [bogoMessages, setBogoMessages] = useState([]);
  const [appliedDeals, setAppliedDeals] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Debounce ref to prevent excessive API calls
  const debounceRef = useRef(null);

  const validateCart = useCallback(async () => {
    // Extract cart items in required format
    if (!cart?.items || cart.items.length === 0) {
      setBogoDiscount(0);
      setBogoMessages([]);
      setAppliedDeals([]);
      return;
    }

    // Format cart items for validation API
    const items = cart.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    setIsValidating(true);
    setValidationError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
      const response = await fetch(
        `${baseUrl}/wp-json/mantle/v1/validate-cart`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items })
        }
      );

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setBogoDiscount(data.validation.total_discount || 0);
        setBogoMessages(data.validation.messages || []);
        setAppliedDeals(data.validation.deals_applied || []);
      }
    } catch (error) {
      console.error('BOGO validation error:', error);
      setValidationError(error.message);
      // Don't clear discount on error - keep last known good state
    } finally {
      setIsValidating(false);
    }
  }, [cart?.items]);

  // Debounced validation when cart changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      validateCart();
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [validateCart]);

  return {
    bogoDiscount,
    bogoMessages,
    appliedDeals,
    isValidating,
    validationError,
    revalidate: validateCart
  };
}
```

## Step 2: Create Active Deals Hook

For displaying promotional banners:

```javascript
// src/app/hooks/useActiveDeals.js
"use client";

import { useState, useEffect } from 'react';

/**
 * Hook for fetching currently active BOGO deals
 * Useful for promotional banners and product badges
 */
export function useActiveDeals() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
        const response = await fetch(
          `${baseUrl}/wp-json/mantle/v1/active-deals`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch deals: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setDeals(data.deals);
        }
      } catch (err) {
        console.error('Error fetching active deals:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return { deals, isLoading, error };
}
```

## Step 3: Integrate with Cart Components

### Option A: Update Existing Cart/SideCart Component

Add BOGO discount display to your existing cart component:

```jsx
// In your cart component (e.g., SideCart.jsx or Cart.jsx)
import { useBOGOValidation } from '@/app/hooks/useBOGOValidation';

export default function CartSummary() {
  const { cart } = useCart();
  const { bogoDiscount, bogoMessages, isValidating } = useBOGOValidation();

  // Get subtotal from WooCommerce cart data
  const subtotal = cart?.totals?.total_items
    ? parseFloat(cart.totals.total_items) / 100
    : 0;

  // Calculate final total with BOGO discount
  const total = subtotal - bogoDiscount;

  return (
    <div className="cart-summary">
      {/* BOGO Messages */}
      {bogoMessages.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-green-800 mb-2">
            Deals Applied!
          </p>
          {bogoMessages.map((msg, idx) => (
            <p key={idx} className="text-sm text-green-700">{msg}</p>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {bogoDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>BOGO Discount</span>
            <span>-${bogoDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-base font-semibold border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {isValidating && (
        <p className="text-xs text-gray-500 mt-2">Checking deals...</p>
      )}
    </div>
  );
}
```

### Option B: Create a Dedicated BOGO Summary Component

```jsx
// src/app/components/BOGOSummary.jsx
"use client";

import { useBOGOValidation } from '@/app/hooks/useBOGOValidation';

export default function BOGOSummary() {
  const { bogoDiscount, bogoMessages, isValidating, appliedDeals } = useBOGOValidation();

  if (bogoMessages.length === 0 && !isValidating) {
    return null;
  }

  return (
    <div className="bogo-summary">
      {isValidating ? (
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Checking for deals...</span>
        </div>
      ) : (
        <>
          {bogoMessages.length > 0 && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-green-800">Deals Applied!</p>
                  {bogoMessages.map((msg, idx) => (
                    <p key={idx} className="text-sm text-green-700 mt-1">{msg}</p>
                  ))}
                  <p className="text-sm font-semibold text-green-800 mt-2">
                    You save: ${bogoDiscount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

## Step 4: Handle Checkout with BOGO Discount

When creating orders, include the BOGO discount as a fee line:

```javascript
// In your checkout submission logic
import { useBOGOValidation } from '@/app/hooks/useBOGOValidation';

// Inside checkout component
const { bogoDiscount, appliedDeals } = useBOGOValidation();

const handleCheckout = async () => {
  // Build order data
  const orderData = {
    payment_method: 'stripe',
    billing: billingAddress,
    shipping: shippingAddress,
    line_items: cart.items.map(item => ({
      product_id: item.id,
      variation_id: item.variation_id || 0,
      quantity: item.quantity
    })),
    // Include BOGO discount as a negative fee
    fee_lines: bogoDiscount > 0 ? [{
      name: 'Holiday Discount',
      total: (-bogoDiscount).toFixed(2),
      tax_status: 'none'
    }] : [],
    // Store BOGO metadata for order records
    meta_data: appliedDeals.length > 0 ? [
      {
        key: '_bogo_discount_applied',
        value: bogoDiscount.toString()
      },
      {
        key: '_bogo_deals_applied',
        value: JSON.stringify(appliedDeals.map(d => d.deal_name))
      }
    ] : []
  };

  // Submit order...
};
```

## Step 5: Optional - Promotional Banner Component

Display active deals on homepage or product pages:

```jsx
// src/app/components/DealsBanner.jsx
"use client";

import { useActiveDeals } from '@/app/hooks/useActiveDeals';

export default function DealsBanner() {
  const { deals, isLoading, error } = useActiveDeals();

  if (isLoading || error || deals.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-4 text-center">
          {deals.map((deal) => (
            <div key={deal.id} className="flex items-center gap-2">
              <span className="font-semibold">{deal.name}</span>
              <span className="text-green-200">|</span>
              <span className="text-sm text-green-100">{deal.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Step 6: Optional - Next.js API Proxy Route

For additional security or caching, create an internal API route:

```javascript
// src/app/api/bogo/validate/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const response = await fetch(
      `${baseUrl}/wp-json/mantle/v1/validate-cart`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('BOGO validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate cart' },
      { status: 500 }
    );
  }
}
```

```javascript
// src/app/api/bogo/deals/route.js
import { NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    const response = await fetch(
      `${baseUrl}/wp-json/mantle/v1/active-deals`
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}
```

## API Reference

### Validate Cart
**Endpoint:** `POST /wp-json/mantle/v1/validate-cart`

**Request Body:**
```json
{
  "items": [
    { "product_id": 123, "quantity": 2 },
    { "product_id": 456, "quantity": 1 }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "valid": true,
    "deals_applied": [
      {
        "deal_id": 1,
        "deal_name": "Rain Gear BOGO 35% Off",
        "discount_amount": 24.50,
        "message": "Rain Gear BOGO 35% Off: Buy 1 Get 1 at 35% off"
      }
    ],
    "total_discount": 24.50,
    "messages": ["Rain Gear BOGO 35% Off: Buy 1 Get 1 at 35% off"]
  },
  "cart_summary": {
    "subtotal": 100.00,
    "discount": 24.50,
    "total": 75.50
  }
}
```

### Get Active Deals
**Endpoint:** `GET /wp-json/mantle/v1/active-deals`

**Response:**
```json
{
  "success": true,
  "deals": [
    {
      "id": 1,
      "name": "Rain Gear BOGO 35% Off",
      "type": "same_category",
      "discount_percent": 35,
      "start_date": "2025-11-23 00:00:00",
      "end_date": "2025-11-29 23:59:59",
      "description": "Buy 1 Get 1 at 35% off"
    }
  ]
}
```

## Testing Checklist

- [ ] BOGO hook validates cart on item add/remove/update
- [ ] Discount displays correctly in cart summary
- [ ] Messages show which deals are applied
- [ ] Total calculates correctly with discount
- [ ] Checkout includes discount in order
- [ ] Deal banners show current promotions (if implemented)
- [ ] Works on mobile devices
- [ ] Loading states display properly
- [ ] Error states handled gracefully

## Troubleshooting

### Discount Not Appearing
1. Check browser console for API errors
2. Verify `NEXT_PUBLIC_WORDPRESS_URL` is correct
3. Ensure products are in the correct WooCommerce categories
4. Check deal dates in WordPress admin
5. Verify deal is marked as "Active"

### CORS Errors
If you see CORS errors, ensure WordPress has appropriate headers. Add to `wp-config.php` or use a CORS plugin:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

### Cart Not Syncing
The hook relies on `cart.items` from CartContext. Ensure:
1. CartContext is properly wrapping your app
2. Cart is fetched before validation runs
3. Check `isLoading` state from CartContext
