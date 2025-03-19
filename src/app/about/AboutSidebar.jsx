"use client";

import { useState, useEffect } from 'react';

export default function AboutSidebar() {
  const [activeSection, setActiveSection] = useState('our-story');

  // List of sections for navigation
  const sections = [
    { id: 'our-story', label: 'Our Story' },
    { id: 'our-mission', label: 'Our Mission' },
    { id: 'materials', label: 'Our Materials' },
    { id: 'design', label: 'Design Philosophy' }
  ];

  // Simple scroll event handling for highlighting active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for better UX

      // Find the section that's currently in view
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Scroll to section when clicking a nav item
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 50, // Offset to account for any fixed headers
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  return (
    <nav className="about-sidebar" style={{
      backgroundColor: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      padding: '2rem 1rem',
      borderRadius: '0 8px 8px 0',
      marginTop: '1rem'
    }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', paddingLeft: '1rem' }}>
        About Mantle
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sections.map((section) => (
          <li key={section.id} style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => scrollToSection(section.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                backgroundColor: activeSection === section.id ? 'rgba(156, 178, 77, 0.1)' : 'transparent',
                borderLeft: activeSection === section.id ? '3px solid #9CB24D' : '3px solid transparent',
                borderRadius: '0 4px 4px 0',
                fontWeight: activeSection === section.id ? 'bold' : 'normal',
                color: activeSection === section.id ? '#9CB24D' : '#666',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                outline: 'none'
              }}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
} 