"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  formatPrice,
  getProductImageUrl,
  getProductSecondaryImageUrl,
  getProductPriceDisplay,
} from "../services/woocommerce";
import StarRating from "./shop/StarRating";
import { useCombinedRating } from "../utils/productRatings";
import {
  newProductConfig,
  getFeaturedNewProductIds,
} from "@/config/newProductConfig";

export default function NewProductFeatured() {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get featured new product ID
  const featuredIds = getFeaturedNewProductIds();
  const featuredProductId = featuredIds[0];

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", featuredProductId],
    queryFn: async () => {
      const response = await fetch(`/api/products?id=${featuredProductId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product");
      }
      return response.json();
    },
    enabled: !!featuredProductId,
  });

  const { rating, count } = useCombinedRating(product);

  const stripHtml = (html) => {
    if (typeof window === "undefined") {
      return html?.replace(/<[^>]*>?/gm, "") || "";
    }
    const doc = new DOMParser().parseFromString(html || "", "text/html");
    return doc.body.textContent || "";
  };

  const getShortDescription = (prod) => {
    if (prod?.short_description) {
      const text = stripHtml(prod.short_description);
      return text.substring(0, 200) + (text.length > 200 ? "..." : "");
    }

    if (prod?.description) {
      const text = stripHtml(prod.description);
      return text.substring(0, 200) + (text.length > 200 ? "..." : "");
    }

    return "Premium tactical gear designed for professionals.";
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getFallbackImage = () => {
    return "/images/DSCF1858.jpg";
  };

  const { badgeText, messaging, colors } = newProductConfig;

  // Loading skeleton
  if (isLoading) {
    return (
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "4rem 1rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            borderRadius: "1rem",
            overflow: "hidden",
            minHeight: "500px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "4rem",
              gap: "2rem",
            }}
          >
            <div
              style={{
                width: "300px",
                height: "300px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "0.5rem",
                animation: "pulse 2s infinite",
              }}
            />
            <div
              style={{
                width: "200px",
                height: "30px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "0.25rem",
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return null;
  }

  return (
    <section
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 1rem",
      }}
    >
      {/* Section Header */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <span
          className="new-badge-pulse"
          style={{
            display: "inline-block",
            background: colors.badgeBackground,
            color: colors.badgeText,
            padding: "8px 20px",
            borderRadius: "50px",
            fontWeight: "800",
            fontSize: "0.875rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            boxShadow: "0 4px 15px rgba(156, 178, 77, 0.4)",
            marginBottom: "1rem",
          }}
        >
          {badgeText} ARRIVAL
        </span>
        <h2
          style={{
            fontSize: "2.25rem",
            fontWeight: "bold",
            color: "#1f2937",
            margin: 0,
          }}
        >
          {messaging.bannerHeadline}
        </h2>
        <p
          style={{
            color: "#6b7280",
            fontSize: "1.125rem",
            marginTop: "0.5rem",
          }}
        >
          {messaging.bannerSubheadline}
        </p>
      </div>

      {/* Product Card */}
      <Link
        href={`/product/${product.slug}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            transition: "transform 0.4s ease, box-shadow 0.4s ease",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
            setIsHovered(true);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 10px 40px rgba(0,0,0,0.2)";
            setIsHovered(false);
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              pointerEvents: "none",
            }}
          />

          {/* Shine Effect */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "200%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(156, 178, 77, 0.08), transparent)",
              animation: "shimmer 4s infinite",
              pointerEvents: "none",
            }}
          />

          {/* Content Container */}
          <div
            className="new-product-content"
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Product Image Section */}
            <div
              style={{
                width: "100%",
                height: "400px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Image
                src={
                  isHovered
                    ? imageError
                      ? getFallbackImage()
                      : getProductSecondaryImageUrl(product)
                    : imageError
                      ? getFallbackImage()
                      : getProductImageUrl(product)
                }
                alt={product.name}
                fill
                style={{
                  objectFit: "cover",
                  transition: "transform 0.6s ease-in-out",
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                }}
                sizes="(max-width: 768px) 100vw, 1200px"
                onError={handleImageError}
                priority
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background:
                    "linear-gradient(to top, rgba(26, 26, 26, 1) 0%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />

              {/* NEW Badge on Image */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  background: colors.badgeBackground,
                  color: colors.badgeText,
                  padding: "10px 20px",
                  borderRadius: "4px",
                  fontWeight: "800",
                  fontSize: "0.875rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 15px rgba(156, 178, 77, 0.5)",
                }}
              >
                {badgeText}
              </div>
            </div>

            {/* Product Details Section */}
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "700",
                  color: "#ffffff",
                  marginBottom: "0.75rem",
                }}
              >
                {product.name}
              </h3>

              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "1rem",
                  lineHeight: "1.6",
                  marginBottom: "1.5rem",
                  maxWidth: "600px",
                  margin: "0 auto 1.5rem auto",
                }}
              >
                {getShortDescription(product)}
              </p>

              <div
                style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <StarRating rating={rating} count={count} />
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                {/* Price */}
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: "bold",
                  }}
                >
                  {(() => {
                    const priceInfo = getProductPriceDisplay(product);
                    if (priceInfo.hasDiscount) {
                      return (
                        <>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#6b7280",
                              fontSize: "1.25rem",
                              marginRight: "0.5rem",
                            }}
                          >
                            {priceInfo.regularPrice}
                          </span>
                          <span style={{ color: "#ef4444" }}>
                            {priceInfo.salePrice}
                          </span>
                        </>
                      );
                    } else {
                      return (
                        <span
                          style={{
                            background: `linear-gradient(135deg, ${colors.accentColor} 0%, #b8d45a 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                          }}
                        >
                          {priceInfo.display}
                        </span>
                      );
                    }
                  })()}
                </div>

                {/* CTA Button */}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${colors.accentColor} 0%, #8aa542 100%)`,
                    color: "#1a1a1a",
                    padding: "14px 32px",
                    borderRadius: "6px",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    boxShadow: "0 4px 15px rgba(156, 178, 77, 0.4)",
                    transition: "all 0.3s ease",
                    display: "inline-block",
                  }}
                >
                  {messaging.bannerCta}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes newPulse {
          0%,
          100% {
            box-shadow: 0 4px 15px rgba(156, 178, 77, 0.4);
          }
          50% {
            box-shadow: 0 4px 25px rgba(156, 178, 77, 0.7);
          }
        }

        .new-badge-pulse {
          animation: newPulse 2s infinite;
        }

        @media (min-width: 768px) {
          .new-product-content {
            flex-direction: row !important;
          }

          .new-product-content > div:first-child {
            width: 55% !important;
            height: 500px !important;
          }

          .new-product-content > div:last-child {
            width: 45% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            text-align: left !important;
            padding: 3rem !important;
          }

          .new-product-content > div:last-child > div:last-child {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
}
