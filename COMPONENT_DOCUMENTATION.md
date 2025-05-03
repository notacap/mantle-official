# Component Documentation

This document provides an overview of all components in the `src/app/components` directory, categorized by their functionality.

## Navigation Components

### `Navbar.jsx`
- **Description**: Main navigation bar at the top of the site.
- **Features**:
  - Responsive design with mobile menu
  - Shop dropdown with categories and collections fetched from the API
  - Cart indicator
  - Dynamic navigation links

### `Footer.jsx`
- **Description**: Site-wide footer component.
- **Features**:
  - Logo
  - Navigation links
  - Copyright information
  
### `FooterLink.jsx`
- **Description**: Reusable link component specifically styled for the footer.
- **Features**:
  - Custom hover effects
  - Standard styling for footer links

## UI Components

### `ButtonWithHover.jsx`
- **Description**: Reusable button component with hover effects.
- **Features**:
  - Two variants: `outline` and `filled`
  - Animated hover state
  - Support for Next.js Link integration

### `HeroSlideshow.jsx`
- **Description**: Hero banner slideshow for the homepage.
- **Features**:
  - Auto-advancing slides
  - Navigation indicators
  - Call-to-action buttons

### `NewsletterSignup.jsx`
- **Description**: Email newsletter subscription form component.
- **Features**:
  - Form validation
  - Success/error states
  - Loading state during submission

### `InstagramSection.jsx`
- **Description**: Displays Instagram feed or gallery.
- **Features**:
  - Grid layout of images
  - Hover effects
  - Link to Instagram profile

## Product Components

### `FeaturedProducts.jsx`
- **Description**: Displays a scrollable row of featured products.
- **Features**:
  - Horizontal scrolling with navigation buttons
  - Product cards with hover effects
  - Loading skeleton state while data is being fetched
  - Uses React Query to fetch products from the `/api/products/featured` endpoint

### `ProductCategories.jsx`
- **Description**: Displays product categories and collections in a grid layout.
- **Features**:
  - Responsive grid
  - Category cards with hover effects
  - Internal `CategoryCard` component for consistency

### `ShopSidebar.jsx`
- **Description**: Sidebar for the shop pages showing categories and collections.
- **Features**:
  - Lists categories and collections with counts
  - Highlights current selection
  - Loading skeleton state
  - Uses React Query to prefetch data when hovering over links

## Shop Components

### `shop/AllProducts.jsx`
- **Description**: Component for displaying all products.
- **Features**:
  - Fetches products from `/api/products/all` endpoint
  - Loading, error, and empty states
  - Uses React Query for data fetching

### `shop/CategoryProducts.jsx`
- **Description**: Displays products filtered by category.
- **Features**:
  - Fetches products from `/api/products/category` endpoint
  - Loading, error, and empty states
  - Uses React Query for data fetching

### `shop/CollectionProducts.jsx`
- **Description**: Displays products filtered by collection (tag).
- **Features**:
  - Fetches products from `/api/products/tag` endpoint
  - Loading, error, and empty states
  - Uses React Query for data fetching

### `shop/ProductActions.jsx`
- **Description**: Product actions section on the product detail page.
- **Features**:
  - Size and color selection
  - Quantity selector
  - Add to cart functionality
  - Integration with cart context
  - **Cart Integration**: Uses `useCart` hook from CartContext to add products to the cart, including handling variations (sizes, colors).

### `shop/ProductGrid.jsx`
- **Description**: Grid layout for displaying products.
- **Features**:
  - Responsive grid
  - Consistent product card styling
  - Handles image fallbacks

### `shop/ProductSkeleton.jsx`
- **Description**: Loading skeleton for product cards.
- **Features**:
  - Shimmer animation effect
  - Matches product card dimensions

### `shop/SingleProduct.jsx`
- **Description**: Detailed view of a single product.
- **Features**:
  - Product images, description, price
  - Size and color options
  - Integration with `ProductActions` for cart functionality
  - Breadcrumb navigation
  - Uses React Query to fetch product data from `/api/products` endpoint

## About Components

### `about/AboutSidebar.jsx`
- **Description**: Navigation sidebar for the About page.
- **Features**:
  - Section navigation
  - Active section highlighting
  - Responsive design (horizontal on mobile, vertical on desktop)

## Contact Components

### `contact/ContactForm.jsx`
- **Description**: Contact form with multiple form types.
- **Features**:
  - Toggle between general inquiry and order-related forms
  - Form validation
  - Basic CAPTCHA/bot protection
  - Submission handling

## API Integration

Many components interact with the site's API endpoints, particularly:

1. **Product-related components**: Fetch data from `/api/products/*` endpoints
2. **ShopSidebar**: Uses `/api/categories` and `/api/collections` endpoints
3. **Navbar**: Uses the same endpoints for dropdown menus

See `API_DOCUMENTATION.md` for details on the available API endpoints.

## Cart Integration

The `shop/ProductActions.jsx` component is the primary integration point with the cart functionality. It uses the `useCart` hook from `CartContext` to:

1. Access the cart state and Nonce
2. Add products to cart via `callCartApi`
3. Handle variation selection (sizes, colors)

See `CART_DOCUMENTATION.md` for more details on the cart system. 