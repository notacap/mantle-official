# Shopping Cart Functionality Documentation

This document explains how the shopping cart system works within the application.

## Core Components

1.  **`src/context/CartContext.js`:** This is the central hub for cart management.
    *   Uses React Context (`CartContext`) to provide global access to cart state and functions.
    *   `CartProvider` wraps the application to enable context access.
    *   **Initialization:** On load (`fetchCartAndNonce`), it fetches the current cart state and a security `Nonce` directly from the WooCommerce Store API (`/wp-json/wc/store/v1/cart`). This `Nonce` is crucial for authenticating subsequent cart actions.
    *   **API Interaction:** The `callCartApi` function handles all interactions with the WooCommerce Store API cart endpoints (e.g., `/cart/add-item`, `/cart/update-item`). It automatically includes the required `Nonce` header and updates the local cart state and nonce upon success.
    *   **State Management:** Manages `cart` data, the security `nonce`, `isLoading` status, and `error` messages.
    *   **`useCart` Hook:** Provides a convenient way for components to access the context's values (`cart`, `nonce`, `isLoading`, `error`, `callCartApi`, etc.).

2.  **`src/app/cart/page.js`:** The main page for displaying and managing the cart.
    *   Uses the `useCart` hook to access cart data and functions.
    *   Displays items from the `cart` state.
    *   Handles quantity updates (`updateQuantity`) and item removal (`removeItem`) by calling `callCartApi` with the appropriate WooCommerce Store API endpoint and parameters.

3.  **`src/app/components/shop/ProductActions.jsx`:** Component used on product pages/listings to add items to the cart.
    *   Manages local state for quantity and selected variations (size, color).
    *   **Adding Items (`handleAddToCart`):** Constructs the item payload (product ID, quantity, variation slugs) and uses `callCartApi` (obtained via `useCart`) to send the request to the `/wp-json/wc/store/v1/cart/add-item` endpoint, including the necessary `Nonce`.
    *   **Variation Handling:** Contains helper functions (`getSizeSlug`, `getColorSlug`) to convert user-friendly display names to system slugs required by the API.
    *   **User Interface:** Provides UI for selecting product variations, quantity adjustment, and the Add to Cart button with proper loading and error states.

4.  **`src/app/services/woocommerce.js`:** Primarily used for fetching product/category data *from internal API routes*. Its direct role in the cart is limited to providing utility functions like `formatPrice`.

## Workflow Summary

1.  **Initialization:** `CartProvider` fetches the initial cart state and security `Nonce` from the WooCommerce Store API.
2.  **State Access:** Components use the `useCart` hook to get the current cart state, nonce, and API interaction functions.
3.  **Adding Items:** `ProductActions` uses `callCartApi` to send item data and the `Nonce` to the WooCommerce `/cart/add-item` endpoint.
4.  **Viewing/Managing Cart:** `cart/page.js` displays the cart state and uses `callCartApi` to send requests for updates or removals to the relevant WooCommerce endpoints, always including the `Nonce`.
5.  **Direct API Interaction:** The system interacts *directly* with the WooCommerce Store API (`/wp-json/wc/store/v1/cart/...`) for all cart operations, rather than going through the internal API routes documented in `API_DOCUMENTATION.md`. 