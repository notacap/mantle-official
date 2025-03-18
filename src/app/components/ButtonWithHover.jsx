"use client";

import Link from "next/link";

export default function ButtonWithHover({ href, children, variant = "outline" }) {
  const baseStyles = {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.25rem',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  };

  const variants = {
    outline: {
      backgroundColor: 'transparent',
      color: '#9CB24D',
      border: '2px solid #9CB24D',
    },
    filled: {
      backgroundColor: '#9CB24D',
      color: 'white',
      border: '2px solid #9CB24D',
    }
  };

  const hoverVariants = {
    outline: {
      backgroundColor: '#9CB24D',
      color: 'white',
    },
    filled: {
      backgroundColor: '#8CA23D',
    }
  };

  return (
    <Link 
      href={href} 
      style={{ ...baseStyles, ...variants[variant] }}
      onMouseEnter={(e) => {
        Object.entries(hoverVariants[variant]).forEach(([key, value]) => {
          e.currentTarget.style[key] = value;
        });
      }}
      onMouseLeave={(e) => {
        Object.entries(variants[variant]).forEach(([key, value]) => {
          e.currentTarget.style[key] = value;
        });
      }}
    >
      {children}
    </Link>
  );
} 