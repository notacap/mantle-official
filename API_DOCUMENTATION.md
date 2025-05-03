# API Route Documentation

This document provides a summary of the purpose for each API route located within the `src/app/api` directory.

## `/api/collections`

*   **`route.js`**: Fetches all product collections (tags) from WooCommerce, with pagination. Revalidates every 5 minutes.
*   **`single/route.js`**: Fetches details for a single product collection (tag) by its ID from WooCommerce.

## `/api/categories`

*   **`route.js`**: Fetches all product categories from WooCommerce, ordered by name, with pagination. Revalidates every 5 minutes.
*   **`single/route.js`**: Fetches details for a single product category by its ID from WooCommerce.
*   **`tree/route.js`**: Fetches all product categories from WooCommerce and structures them into a hierarchical tree (root categories with children and grandchildren).

## `/api/product-attributes`

*   **`route.js`**: Fetches terms (e.g., 'Small', 'Medium', 'Large' for the 'Size' attribute) for a specific product attribute ID from WooCommerce. Caches results for 1 hour.

## `/api/products`

*   **`route.js`**: Fetches details for a single product by its ID from WooCommerce. Returns a 404 if the product is out of stock.
*   **`all/route.js`**: Fetches all published, in-stock products from WooCommerce, ordered by date (newest first), with pagination. Uses `fetchWithCache` and revalidates every 5 minutes.
*   **`category/route.js`**: Fetches published, in-stock products belonging to a specific category ID from WooCommerce, with a limit parameter.
*   **`featured/route.js`**: Fetches featured, published, in-stock products from WooCommerce, with a limit. If no featured products are found, it fetches regular products instead and returns a flag `isFeatured: false`. Uses `fetchWithCache` and revalidates every 5 minutes.
*   **`tag/route.js`**: Fetches published, in-stock products associated with a specific tag (collection) slug or ID from WooCommerce, with a limit. Includes a basic mapping from slugs to known tag IDs.

## `/api/woocommerce`

*   **`[...path]/`**: This directory structure exists but currently contains no active API routes. 