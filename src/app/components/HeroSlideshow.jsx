"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ButtonWithHover from "./ButtonWithHover";

export default function HeroSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    { 
      src: "/images/banner-1.jpg", 
      alt: "Sustainable clothing collection",
      heading: "Sustainable Fashion for a Better Tomorrow",
      subheading: "Eco-friendly apparel that doesn't compromise on style"
    },
    { 
      src: "/images/banner-2.jpg", 
      alt: "Eco-friendly apparel",
      heading: "Ethically Made, Responsibly Sourced",
      subheading: "Clothing that respects both people and planet"
    },
    { 
      src: "/images/banner_3.jpg", 
      alt: "Ethical fashion",
      heading: "Designed for Durability",
      subheading: "Quality pieces that stand the test of time"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '600px', 
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: index === currentSlide ? 1 : 0,
            boxSizing: 'border-box'
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            style={{ objectFit: 'cover' }}
            sizes="100vw"
          />
          
          {/* Text Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 2rem',
            textAlign: 'center',
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            boxSizing: 'border-box'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              maxWidth: '800px',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {slide.heading}
            </h2>
            <p style={{
              color: 'white',
              fontSize: '1.25rem',
              marginBottom: '2rem',
              maxWidth: '600px',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              {slide.subheading}
            </p>
            <ButtonWithHover href="/shop" variant="filled">
              Shop Collection
            </ButtonWithHover>
          </div>
        </div>
      ))}

      {/* Slide indicators */}
      <div style={{ 
        position: 'absolute', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        display: 'flex', 
        gap: '10px',
        zIndex: 2,
        boxSizing: 'border-box'
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: index === currentSlide ? '#9CB24D' : 'white',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              transition: 'background-color 0.3s ease'
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 