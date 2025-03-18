"use client";

import Image from 'next/image';
import Link from 'next/link';
import FooterLink from './FooterLink';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Footer links configuration
  const footerLinks = [
    { name: 'Shop All', href: '/shop' },
    { name: 'About Mantle', href: '/about' },
    { name: 'In Action', href: '/in-the-wild' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Partners', href: '/partners' },
    { name: 'Warranty', href: '/warranty' },
  ];
  
  return (
    <footer style={{
      backgroundColor: '#2A2A2A', // Dark background color
      borderTop: '1px solid #3A3A3A',
      padding: '4rem 1rem',
      width: '100%',
      color: 'white',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        {/* Logo */}
        <Link href="/" aria-label="Mantle Clothing Home">
          <Image 
            src="/images/logo.svg" 
            alt="Mantle Clothing Logo" 
            width={140} 
            height={70} 
            style={{ height: 'auto' }}
          />
        </Link>
        
        {/* Navigation Links */}
        <nav style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1.5rem 2rem',
          maxWidth: '800px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {footerLinks.map((link) => (
            <FooterLink key={link.name} href={link.href}>
              {link.name}
            </FooterLink>
          ))}
        </nav>
        
        {/* Divider */}
        <div style={{
          width: '60px',
          height: '2px',
          backgroundColor: '#9CB24D',
          margin: '0.5rem 0',
        }} />
        
        {/* Copyright */}
        <p style={{
          fontSize: '0.875rem',
          color: '#A0A0A0',
          textAlign: 'center',
          margin: 0,
          width: '100%',
          boxSizing: 'border-box'
        }}>
          2025 © Mantle Clothing. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
} 