# BOGO Banner & Sale Page Implementation Guide

This document outlines how to implement a promotional banner and sale page that displays when BOGO deals are active.

## Background

A custom WordPress plugin (`custom_plugins/mantle-bogo/`) has been created to manage BOGO deals. The plugin provides REST API endpoints that the Next.js frontend can use to:
1. Check which deals are currently active
2. Validate cart items for discounts

## Existing Infrastructure

### API Endpoints (WordPress)

**Get Active Deals:**
```
GET https://api.mantle-clothing.com/wp-json/mantle/v1/active-deals
```

Response:
```json
{
  "success": true,
  "deals": [
    {
      "id": "2",
      "name": "BOGO Test",
      "type": "same_category",  // or "cross_product" or "sitewide"
      "discount_percent": 100,
      "start_date": "2025-11-17 16:19:00",
      "end_date": "2025-11-28 16:19:00",
      "description": "Buy 1 Get 1 at 100.00% off"
    }
  ]
}
```

**Validate Cart (for reference):**
```
POST https://api.mantle-clothing.com/wp-json/mantle/v1/validate-cart
Body: { "items": [{ "product_id": 123, "quantity": 1 }] }
```

### Next.js API Proxy Routes

- `src/app/api/bogo/deals/route.js` - Proxies to `/active-deals`
- `src/app/api/bogo/validate/route.js` - Proxies to `/validate-cart`

### Existing Hooks

- `src/app/hooks/useActiveDeals.js` - Fetches active deals
- `src/app/hooks/useBOGOValidation.js` - Validates cart against deals

## Implementation Tasks

### 1. Create Sale Banner Component

**Location:** `src/app/components/SaleBanner.jsx`

**Requirements:**
- Conditionally render only when deals are active (use `useActiveDeals` hook)
- Display deal name and discount percentage
- Link to sale page (`/sale` or `/deals`)
- Dismissible (store in localStorage)
- Responsive design matching site aesthetics
- Use brand colors: primary green `#9CB24D`

**Example structure:**
```jsx
"use client";

import { useActiveDeals } from '@/app/hooks/useActiveDeals';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SaleBanner() {
  const { deals, isLoading } = useActiveDeals();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissed state
  }, []);

  if (isLoading || !deals?.length || dismissed) return null;

  const activeDeal = deals[0]; // or combine multiple deals

  return (
    // Banner UI here
  );
}
```

### 2. Add Banner to Layout

**Location:** `src/app/layout.js` or `src/app/components/Header.jsx`

Add the `SaleBanner` component above the header or as a sticky top banner.

### 3. Create Sale Page

**Location:** `src/app/sale/page.js` (or `src/app/deals/page.js`)

**Requirements:**
- Server component for SEO
- Fetch active deals and their associated products
- Display products in a grid similar to `/shop` or `/collections/[slug]`
- Show deal information (name, discount %, dates)
- Filter products by the deal's categories/tags

**Reference existing pages:**
- `src/app/shop/page.js` - Product grid layout
- `src/app/collections/[slug]/page.js` - Collection-specific products
- `src/app/categories/[slug]/page.js` - Category-specific products

### 4. Create API Route for Sale Products

**Location:** `src/app/api/bogo/products/route.js`

This route should:
1. Fetch active deals from WordPress
2. For each deal, get the `buy_category_ids` and `buy_tag_ids`
3. Fetch products from those categories/tags
4. Return combined product list

**WordPress side:** You may need to extend the plugin's REST API to return category/tag IDs with the deals. Currently the `/active-deals` endpoint returns formatted data but not the raw category/tag IDs.

Check `custom_plugins/mantle-bogo/includes/class-bogo-rest-api.php` - the `get_active_deals` method formats deals but strips some data. You may need to include:
- `buy_category_ids`
- `buy_tag_ids`
- `get_category_ids`
- `get_tag_ids`

### 5. Database Structure (Reference)

The BOGO deals are stored in `wp_mantle_bogo_deals` table with these relevant columns:
- `deal_name` - Display name
- `deal_type` - "same_category", "cross_product", or "sitewide"
- `buy_category_ids` - JSON array of WooCommerce category IDs
- `buy_tag_ids` - JSON array of WooCommerce tag IDs (collections)
- `get_category_ids` - JSON array (for cross_product type)
- `get_tag_ids` - JSON array (for cross_product type)
- `discount_percent` - The discount amount
- `start_date` / `end_date` - When deal is active
- `active` - Boolean flag

### 6. Update Active Deals API Response

**File:** `custom_plugins/mantle-bogo/includes/class-bogo-rest-api.php`

Modify the `get_active_deals` method to include category/tag IDs:

```php
$formatted_deals[] = array(
    'id' => $deal['id'],
    'name' => $deal['deal_name'],
    'type' => $deal['deal_type'],
    'discount_percent' => floatval($deal['discount_percent']),
    'start_date' => $deal['start_date'],
    'end_date' => $deal['end_date'],
    'description' => self::get_deal_description($deal),
    // ADD THESE:
    'buy_category_ids' => $deal['buy_category_ids'],
    'buy_tag_ids' => $deal['buy_tag_ids'],
    'get_category_ids' => $deal['get_category_ids'],
    'get_tag_ids' => $deal['get_tag_ids'],
);
```

### 7. Styling Guidelines

- Follow existing Tailwind patterns in the codebase
- Use Shadcn UI components where applicable (`src/components/ui/`)
- Mobile-first responsive design
- Match existing product card styles from shop pages
- Brand colors: `#9CB24D` (green), grays for text

### 8. SEO Considerations

- Add proper metadata to sale page
- Use semantic HTML
- Include structured data for sale/discount schema if applicable
- Ensure page is server-rendered for crawlability

## File Structure Summary

```
src/
├── app/
│   ├── api/
│   │   └── bogo/
│   │       ├── deals/route.js      (existing)
│   │       ├── validate/route.js   (existing)
│   │       └── products/route.js   (NEW - fetch sale products)
│   ├── components/
│   │   └── SaleBanner.jsx          (NEW)
│   ├── hooks/
│   │   ├── useActiveDeals.js       (existing)
│   │   └── useBOGOValidation.js    (existing)
│   └── sale/
│       └── page.js                 (NEW - sale page)
└── custom_plugins/
    └── mantle-bogo/
        └── includes/
            └── class-bogo-rest-api.php  (UPDATE - add category/tag IDs to response)
```

## Testing

1. Create a test deal in WordPress Admin (WooCommerce > BOGO Deals)
2. Verify banner appears on homepage when deal is active
3. Click through to sale page and verify products display
4. Verify banner doesn't appear when no deals are active
5. Test dismissing the banner
6. Test on mobile devices

## Notes

- The plugin already handles product variations by checking parent product categories/tags
- Collections in this codebase = WooCommerce tags (not categories)
- Deals can target categories OR tags (they work as OR logic, not AND)
- The discount is applied server-side during checkout via WooCommerce fees
