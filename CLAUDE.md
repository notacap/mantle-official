# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an e-commerce website for Mantle Clothing built with Next.js 15 (App Router), React 19, and integrates with WooCommerce as the backend CMS and product management system. The site sells premium tactical and outdoor apparel for law enforcement and outdoor professionals.

## Tech Stack

- **Framework**: Next.js 15.5.7 (App Router)
- **React**: 19.0.0
- **Styling**: Tailwind CSS 4.0, Shadcn UI, Radix UI
- **State Management**: React Context (CartContext), TanStack Query (React Query)
- **URL State**: nuqs for search parameter state management
- **Backend**: WooCommerce (headless via REST API & Store API)
- **Payment**: Stripe, PayPal
- **Analytics**: Google Analytics, Vercel Analytics

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Directory Structure

- **`src/app/`** - Next.js App Router pages and layouts
  - **`api/`** - API routes that proxy requests to WooCommerce
  - **`components/`** - Page-level and shared components
  - **`hooks/`** - Custom React hooks (e.g., `useWooCommerce.js`)
  - **`lib/`** - Utility functions (cache, validation, sanitization, WooCommerce API wrappers)
  - **`utils/`** - Additional utility functions
- **`src/components/`** - Global UI components (Shadcn UI components)
- **`src/context/`** - React Context providers
  - **`CartContext.js`** - Global cart state and WooCommerce Store API integration
- **`src/lib/`** - Shared library code
- **`src/middleware.js`** - Next.js middleware for geo-blocking and route protection

### Key Architecture Patterns

#### WooCommerce Integration

The app uses two WooCommerce API approaches:

1. **Internal API Routes** (`src/app/api/`): Next.js routes that fetch product data from WooCommerce REST API
   - Products: `/api/products/*` (all, featured, by category, by tag)
   - Categories: `/api/categories/*` (all, single, tree structure)
   - Collections: `/api/collections/*` (WooCommerce tags)
   - Attributes: `/api/product-attributes`
   - Reviews: `/api/product-reviews`

2. **Direct WooCommerce Store API** (used by CartContext): Client-side cart operations communicate directly with WooCommerce Store API
   - Endpoints: `/wp-json/wc/store/v1/cart/*`
   - Uses `Nonce` header for authentication
   - Uses `Cart-Token` header for cart persistence

**Important**: Cart operations bypass internal API routes and talk directly to WooCommerce Store API.

#### Cart System Architecture

Managed by `src/context/CartContext.js`:

- Fetches cart state and security `Nonce` on initialization
- `callCartApi()` function handles all cart operations with proper authentication
- Stores `Cart-Token` in localStorage for persistence
- Cross-tab synchronization via localStorage events (`wooCartLastUserUpdate`)
- Side cart UI state management

**Cart Flow**:
1. Product page → `ProductActions.jsx` → adds item via `callCartApi()`
2. Cart page → displays items, handles quantity/removal
3. Checkout → saves customer info, processes payment, creates order

#### Payment Processing

**Stripe Flow**:
1. Customer enters billing/shipping on `/checkout`
2. Address saved to WooCommerce via `/cart/update-customer`
3. Stripe Payment Method created client-side
4. Order submitted to `/checkout` endpoint with Stripe token
5. Redirect to `/order-confirmation` on success

**PayPal Flow**: Uses PayPal SDK for client-side PayPal button integration

#### Caching Strategy

- Internal API routes use `revalidate: 300` (5 minutes) for product/category data
- Custom cache utilities in `src/app/lib/cache.js` and `src/app/lib/woocommerce-cache.js`
- React Query for client-side data fetching and caching

### Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_WORDPRESS_URL` - WooCommerce site URL
- `WORDPRESS_APPLICATION_PASSWORD` - WordPress app password
- `WOOCOMMERCE_CONSUMER_KEY` / `WOOCOMMERCE_CONSUMER_SECRET` - WooCommerce API credentials
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `NEXT_STRIPE_PRIVATE_KEY` - Stripe keys
- `PAYPAL_CLIENT_ID` / `NEXT_PUBLIC_PAYPAL_CLIENT_ID` / `PAYPAL_SECRET_KEY` / `PAYPAL_ENVIRONMENT` - PayPal credentials
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_SITE_URL` - Site URL (defaults to localhost:3000 in dev)

### Middleware

`src/middleware.js` implements:
- **Geo-blocking**: Restricts access to allowed countries only (US, CA, Western Europe)
- **Route blocking**: Blocks `/blog` route (temporary, until ready for launch)

### SEO Focus

**Critical**: This project prioritizes SEO optimization. All implementations should:
- Maximize Web Vitals (LCP, CLS, FID)
- Favor Server Components over Client Components
- Implement proper metadata and Open Graph tags
- Use semantic HTML and structured data where applicable

## Code Style Guidelines

### General Patterns

- **Functional & declarative programming**: Avoid classes, prefer pure functions
- **Use `"function"` keyword** for pure functions
- **File structure**: Exported component → subcomponents → helpers → static content → types
- **Naming**: Descriptive variables with auxiliary verbs (e.g., `isLoading`, `hasError`)
- **Directory naming**: lowercase-with-dashes (e.g., `auth-wizard`)
- **Exports**: Favor named exports for components

### React/Next.js Best Practices

- **Minimize `"use client"`**: Favor React Server Components (RSC)
  - Use `"use client"` only for Web API access in small components
  - Avoid for data fetching or state management
- **Minimize `useEffect` and `setState`**: Use RSC patterns when possible
- **Wrap client components in `<Suspense>` with fallback**
- **Dynamic imports** for non-critical components
- **Follow Next.js docs** for Data Fetching, Rendering, and Routing

### Styling

- **Tailwind CSS**: Mobile-first responsive design
- **Shadcn UI & Radix UI** for component primitives
- **Image optimization**: WebP format, size data, lazy loading

### Conditionals

- Avoid unnecessary curly braces
- Use concise syntax for simple statements
- Use declarative JSX

## Important Documentation Files

- **`API_DOCUMENTATION.md`** - Detailed API route documentation
- **`CART_DOCUMENTATION.md`** - Shopping cart system workflow
- **`checkout_summary.md`** - Complete checkout and payment flow
- **`COMPONENT_DOCUMENTATION.md`** - Component architecture details
- **`PAYPAL_SETUP.md`** - PayPal integration details
- **`IMAGE_PLACEMENT.md`** - Image usage guidelines

## Common Development Tasks

### Working with Products

- Product data fetching uses custom hook: `src/app/hooks/useWooCommerce.js`
- Product variations (size, color, amount) must be converted to slugs before sending to WooCommerce API
- Product pages dynamically route via `/product/[slug]/page.js`

### Working with Cart

- Always use `useCart()` hook from `CartContext` to access cart state and functions
- Cart operations require a valid `nonce` from CartContext
- Use `callCartApi()` for all cart modifications (add, update, remove)
- Cart variations must include both `attribute` and `value` as slugs

### Adding New API Routes

- Create in `src/app/api/[route-name]/route.js`
- Use WooCommerce API wrappers from `src/app/lib/woocommerce-api.js`
- Implement caching with `revalidate` or custom cache utilities
- Handle errors gracefully with proper HTTP status codes

### Working with Forms

- Use validation utilities from `src/app/lib/validation.js`
- Sanitize user input with `src/app/lib/sanitization.js`
- Contact forms submit to `/api/submit-contact`
- Newsletter forms submit to `/api/submit-newsletter`
