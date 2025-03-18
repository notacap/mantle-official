"use client";

import Link from 'next/link';
import { useState } from 'react';

export default function FooterLink({ href, children }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Link 
      href={href}
      style={{
        color: isHovered ? '#9CB24D' : '#E0E0E0',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: '500',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Link>
  );
} 