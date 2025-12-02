"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BlackFridayBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set end date to December 8, 2025 at 12:00 AM Central Time (CST = UTC-6)
    const endDate = new Date("2025-12-08T06:00:00Z").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = endDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(timer);
        setIsVisible(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          opacity: 0.5,
        }}
      />

      {/* Shine effect */}
      <div
        className="animate-shimmer"
        style={{
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "200%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          animation: "shimmer 3s infinite",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Main content row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            width: "100%",
          }}
        >
          {/* Black Friday badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, #ff4444 0%, #cc0000 100%)",
                color: "white",
                padding: "6px 14px",
                borderRadius: "4px",
                fontWeight: "800",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                boxShadow: "0 2px 10px rgba(255, 68, 68, 0.4)",
              }}
            >
              CYBER MONDAY
            </span>
          </div>

          {/* Main text */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: "1.1rem",
                fontWeight: "600",
                letterSpacing: "0.02em",
              }}
            >
              Buy Pants, Get
            </span>
            <span
              style={{
                background: "linear-gradient(135deg, #9CB24D 0%, #b8d45a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "2rem",
                fontWeight: "900",
                letterSpacing: "-0.02em",
                textShadow: "0 0 30px rgba(156, 178, 77, 0.5)",
              }}
            >
              30% OFF
            </span>
            <span
              style={{
                color: "#ffffff",
                fontSize: "1.1rem",
                fontWeight: "600",
                letterSpacing: "0.02em",
              }}
            >
              a Top
            </span>
          </div>

          {/* CTA Button */}
          <Link
            href="/specials"
            style={{
              background: "linear-gradient(135deg, #9CB24D 0%, #8aa542 100%)",
              color: "#1a1a1a",
              padding: "10px 24px",
              borderRadius: "4px",
              fontWeight: "700",
              fontSize: "0.875rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(156, 178, 77, 0.4)",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(156, 178, 77, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(156, 178, 77, 0.4)";
            }}
          >
            Shop Deals
          </Link>
        </div>

        {/* Countdown timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#999",
              fontSize: "0.75rem",
              fontWeight: "500",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Ends in:
          </span>
          <div
            style={{
              display: "flex",
              gap: "6px",
            }}
          >
            {[
              { value: timeLeft.days, label: "D" },
              { value: timeLeft.hours, label: "H" },
              { value: timeLeft.minutes, label: "M" },
              { value: timeLeft.seconds, label: "S" },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    fontFamily: "monospace",
                    minWidth: "28px",
                    textAlign: "center",
                    display: "inline-block",
                  }}
                >
                  {String(item.value).padStart(2, "0")}
                </span>
                <span
                  style={{
                    color: "#666",
                    fontSize: "0.65rem",
                    fontWeight: "600",
                  }}
                >
                  {item.label}
                </span>
                {index < 3 && (
                  <span
                    style={{
                      color: "#444",
                      marginLeft: "4px",
                      fontWeight: "bold",
                    }}
                  >
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
