"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';

export default function InstagramSection() {
  // Sample Instagram posts - in a real app, these would come from an Instagram API
  const instagramPosts = [
    { id: 1, image: '/images/DSCF1858.jpg', alt: 'Customer wearing Mantle clothing outdoors' },
    { id: 2, image: '/images/DSCF4564-scaled.jpg', alt: 'Mantle clothing in the wild' },
    { id: 3, image: '/images/DSCF6361-scaled.jpg', alt: 'Mantle apparel on an adventure' },
    { id: 4, image: '/images/IMG_20220928_142005.jpg', alt: 'Mantle gear in action' },
  ];

  const [hoveredPost, setHoveredPost] = useState(null);

  return (
    <section style={{ 
      padding: '4rem 1rem',
      backgroundColor: 'white',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem' 
          }}>
            #MantleInTheWild
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#4b5563', 
            maxWidth: '600px', 
            margin: '0 auto 1.5rem' 
          }}>
            Tag your photos with #MantleInTheWild for a chance to be featured on our page
          </p>
          <Link 
            href="https://www.instagram.com/" 
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              color: '#9CB24D',
              fontWeight: '500',
              transition: 'color 0.3s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#8CA23D'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#9CB24D'}
          >
            <Instagram size={20} style={{ marginRight: '0.5rem' }} />
            Follow us @mantleclothing
          </Link>
        </div>

        {/* Instagram Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1rem',
        }}>
          {instagramPosts.map((post) => (
            <div 
              key={post.id}
              style={{ 
                position: 'relative',
                aspectRatio: '1/1',
                borderRadius: '0.25rem',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                style={{ 
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                  transform: hoveredPost === post.id ? 'scale(1.05)' : 'scale(1)',
                }}
                sizes="(max-width: 768px) 100vw, 250px"
              />
              
              {/* Hover Overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: hoveredPost === post.id ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}>
                <Instagram size={32} color="white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 