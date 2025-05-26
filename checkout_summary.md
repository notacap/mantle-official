# Checkout, Payment, and Order Process Summary

This document outlines the process of adding items to the cart, managing the cart, and completing a purchase through the checkout page, including payment processing via Stripe.

## 1. Product Interaction and Adding to Cart (`ProductActions.jsx`)

-   **Client-Side Component**: `ProductActions.jsx` is a client component (`"use client"`) responsible for handling product-specific actions like selecting size, color, amount, and quantity on a product page.
-   **State Management**: It uses `useState` for managing selected options (size, color, amount), quantity, unit price, and a local loading state for the "Add to Cart" button (`isAddingToCart`).
-   **Price Calculation**:
    -   The `unitPrice` is determined based on the selected `amount` if available; otherwise, it defaults to the product's base price.
    -   The total price is dynamically calculated as `unitPrice * quantity` and formatted using `formatPrice`.
-   **Slug Conversion**:
    -   Helper functions (`getSizeSlug`, `getColorSlug`, `getAmountSlug`) convert selected display names (e.g., "Large", "Red") into their corresponding slugs (e.g., "large", "red") by looking them up in `sizeOptions`, `colorOptions`, or `amountOptions` props. This is crucial for preparing the `variation` data for the WooCommerce API.
-   **Adding to Cart**:
    -   The `handleAddToCart` function is an `async` function that prepares the item data for the WooCommerce Store API.
    -   It requires a `nonce` from `CartContext` to proceed.
    -   It sets both local (`isAddingToCart`) and global (`setCartLoading` from `useCart`) loading states.
    -   **Variation Data**: Selected size, color, and amount (as slugs) are compiled into a `variation` array of objects, e.g., `[{ attribute: 'size', value: 'large' }]`.
    -   **API Call**: It uses `callCartApi` (from `useCart`) to make a `POST` request to `/wp-json/wc/store/v1/cart/add-item`.
    -   The item data includes `productId`, `quantity`, and `variation` (if any).
    -   On success, it calls `openSideCart()` (from `useCart`) to display the side cart.
    -   Error handling includes displaying alerts and logging errors.
    -   The "Add to Cart" button is disabled based on `isAddingToCart`, global cart loading state (`isCartLoading`), or if the `nonce` is unavailable.

## 2. Cart Management (`CartContext.js`)

-   **Context Provider**: `CartProvider` manages the global cart state, nonce, cart token, loading states, and error messages.
-   **State**:
    -   `cart`: Stores the cart data fetched from WooCommerce.
    -   `nonce`: Security token required for cart operations.
    -   `cartToken`: A token for persistent carts, stored in `localStorage` (`wooCartToken`).
    -   `isLoading`: Global loading state for cart operations.
    -   `error`: Stores error messages related to cart operations.
    -   `lastKnownCartUpdateTimestamp` & `thisTabLastUpdateTimestampRef`: Used for cross-tab cart synchronization.
    -   `isSideCartOpen`, `openSideCart`, `closeSideCart`: Manage the visibility of the side cart component.
-   **Initialization (`useEffect`, `fetchCartAndNonce`)**:
    -   On mount, it attempts to load `wooCartToken` from `localStorage`.
    -   `fetchCartAndNonce` is called (once `isTokenLoadAttempted` is true) to get the current cart state and a fresh `nonce` from `/wp-json/wc/store/v1/cart` (GET request).
    -   It sends the `Cart-Token` header if available.
    -   If the initial fetch fails with a 401/403 and a token was sent, the local token is cleared.
    -   It extracts and sets the `Nonce` from response headers (tries `X-WC-Store-API-Nonce`, `X-WP-Nonce`, `Nonce`).
    -   If the GET request returns a new `Cart-Token`, it's persisted.
-   **`callCartApi` Function**:
    -   A `useCallback` memoized function for making authenticated API calls to WooCommerce cart endpoints.
    -   Requires `nonce` to be present.
    -   Constructs API URL using `NEXT_PUBLIC_WORDPRESS_URL`.
    -   Sends `Content-Type: application/json` and the current `Nonce` in headers.
    -   Sends `Cart-Token` header if `cartTokenRef.current` exists.
    -   On successful API call:
        -   Updates cart state (`setCart`) and nonce (`setNonce`) with data from the response.
        -   Stores the `Cart-Token` from the response headers (if present) using `persistCartToken`.
        -   Updates `wooCartLastUserUpdate` in `localStorage` to trigger cross-tab sync.
    -   Handles API errors, including clearing `Cart-Token` on 401/403 errors if a token was used.
-   **Cart Token Persistence (`persistCartToken`)**:
    -   Manages saving, updating, or removing the `wooCartToken` in `localStorage` and updates the `cartToken` state. Uses a ref (`cartTokenRef`) to avoid stale closures.
-   **Cross-Tab Synchronization**:
    -   An effect listens to `storage` events on `wooCartLastUserUpdate`.
    -   If an update is detected from another tab, it re-fetches the cart using `fetchCartAndNonce`.
-   **Side Cart**: Provides `openSideCart` and `closeSideCart` functions to control the visibility of a side cart UI (the UI itself is not defined in this context).

## 3. Checkout Process (`src/app/checkout/page.js`)

-   **Client-Side Page**: The checkout page is a client component.
-   **Stripe Integration**:
    -   Uses `@stripe/stripe-js` and `@stripe/react-stripe-js`.
    -   `stripePromise` is initialized with `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
    -   The main content is wrapped in `<Elements stripe={stripePromise}>`.
-   **State Management**:
    -   `formData`: Holds billing address, shipping address (if different), payment method, and order notes. Initialized with default country 'US'.
    -   `shipToDifferentAddress`: Boolean to toggle display of shipping address form.
    -   `isProcessing`: Loading state for the entire submission process.
    -   `submissionError`: Stores errors from form submission or payment processing.
    -   `availablePaymentMethods`: Array of payment method strings (e.g., 'stripe') fetched from the cart object (`cart.payment_methods` or `cart.payment_requirements.payment_methods`).
-   **Address Form (`AddressForm` component)**:
    -   A reusable component for billing and shipping address inputs.
    -   Input names are prefixed (e.g., `billing_address.first_name`) to match WooCommerce API structure.
-   **Data Fetching**:
    -   Uses `useCart()` to get cart data, `callCartApi`, `isLoading`, `error`, and `fetchCartAndNonce`.
    -   `useEffect` populates `availablePaymentMethods` from the `cart` object when it loads (excluding PayPal if it was previously listed).
-   **Form Handling**:
    -   `handleChange`: Updates `formData` based on input changes, handling nested address objects.
    -   `handlePaymentMethodChange`: Updates the selected payment method and clears previous submission errors.
-   **Submission Logic (`handleSubmit` in `CheckoutPage`, called by `localHandleSubmit` in `CheckoutFormContent`)**:
    -   This function is primarily for Stripe.
    -   **Common Steps (before payment method specific logic)**:
        -   Sets `isProcessing` to true, clears `submissionError`.
        -   Prepares `dataToSend` object with billing/shipping addresses, payment method, and customer note.
        -   Calls `callCartApi` to `/wp-json/wc/store/v1/cart/update-customer` to save/update customer address and details in WooCommerce.
    -   **Stripe Payment Flow**:
        -   If `formData.payment_method` is 'stripe':
            -   Ensures Stripe.js (`stripe`) and Elements (`elements`) are loaded.
            -   Gets the `CardElement`.
            -   Calls `stripe.createPaymentMethod()` with card details and billing information.
            -   If successful, it receives a `paymentMethod.id` (e.g., `pm_xxx`).
            -   Adds this `paymentMethod.id` to `dataToSend` as `payment_data: [{ key: 'stripe_token', value: paymentMethod.id }]`.
            -   Calls `callCartApi` to `/wp-json/wc/store/v1/checkout` (POST) with `dataToSend`. This endpoint processes the payment with Stripe via the WooCommerce Stripe Gateway plugin and creates the WooCommerce order.
            -   On successful order creation:
                -   Calls `fetchCartAndNonce()` to clear the cart and get a new nonce.
                -   Redirects to `/order-confirmation` page with `order_number` and `order_key`.
-   **UI (`CheckoutFormContent`)**:
    -   Displays billing and shipping address forms.
    -   Shows available payment methods as radio buttons (Stripe will be the primary one shown).
    -   Conditionally renders the Stripe `CardElement` if 'stripe' is selected.
    -   A "Place Order" button is shown. This button is disabled during processing, cart loading, or if Stripe isn't ready.
    -   Displays a `CheckoutCartSummary` component (details not provided in the files).
    -   Shows submission errors.

## 4. Order Confirmation

-   After successful payment processing (for Stripe), the user is redirected to an order confirmation page:
    `/order-confirmation?order_number=${orderNumber}&order_key=${orderKey}`
-   The `order_number` and `order_key` are used to display order details to the customer.
-   The cart is cleared by calling `fetchCartAndNonce()` from `CartContext` after a successful order.

## 5. Summary Flow

1.  **Product Page**: User selects product options -> `ProductActions.handleAddToCart()` -> `CartContext.callCartApi()` to add item to WC cart -> `CartContext.openSideCart()`.
2.  **Cart Context**: Manages cart state, nonce, and token. Fetches cart and provides API for modifications. Handles cross-tab sync.
3.  **Checkout Page**:
    *   User fills billing/shipping details.
    *   Selects payment method (Stripe).
    *   **If Stripe**:
        1.  Address data sent to `wc/store/v1/cart/update-customer`.
        2.  Stripe Payment Method created client-side.
        3.  Data (including Stripe token) sent to `wc/store/v1/checkout`. WooCommerce backend processes Stripe payment and creates order.
        4.  Redirect to confirmation.
4.  **Order Confirmation Page**: Displays order details.

This flow ensures that customer and cart data are updated in WooCommerce before payment is attempted, and that order statuses are correctly reflected after payment completion for Stripe. 