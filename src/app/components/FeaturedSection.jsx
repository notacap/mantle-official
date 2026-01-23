"use client";

import { useState, useEffect } from "react";
import FeaturedProducts from "./FeaturedProducts";
import NewProductFeatured from "./NewProductFeatured";
import {
  isNewProductMarketingActive,
  getFeaturedNewProductIds,
} from "@/config/newProductConfig";

/**
 * FeaturedSection - Wrapper component that conditionally renders
 * either the NewProductFeatured component (when new product marketing is active)
 * or the standard FeaturedProducts component.
 *
 * Controlled by newProductConfig.js
 */
export default function FeaturedSection() {
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check if new product marketing is active and has featured products
    const isActive = isNewProductMarketingActive();
    const featuredIds = getFeaturedNewProductIds();

    setShowNewProduct(isActive && featuredIds.length > 0);
  }, []);

  // During SSR or before hydration, show a minimal placeholder to avoid layout shift
  if (!isClient) {
    return (
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "4rem 1rem",
          minHeight: "400px",
        }}
      />
    );
  }

  // Render the appropriate component based on config
  if (showNewProduct) {
    return <NewProductFeatured />;
  }

  return <FeaturedProducts />;
}
