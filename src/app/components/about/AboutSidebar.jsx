"use client";

import { useState, useEffect } from 'react';

export default function AboutSidebar() {
  const [activeSection, setActiveSection] = useState('our-story');
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // List of sections for navigation
  const sections = [
    { id: 'our-story', label: 'Our Story' },
    { id: 'our-mission', label: 'Our Mission' },
    { id: 'team', label: 'The Team' },
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
        top: element.offsetTop - (isMobile ? 100 : 50), // More offset on mobile to account for horizontal nav
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // Mobile horizontal style
  const mobileStyle = {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    padding: '0.75rem',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'auto',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    position: 'relative',
    zIndex: 10
  };

  // Desktop vertical style
  const desktopStyle = {
    backgroundColor: 'white',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    padding: '1.5rem 1rem',
    borderRadius: '8px',
    height: 'fit-content'
  };

  // Mobile button style
  const mobileButtonStyle = (isActive) => ({
    display: 'block',
    padding: '0.75rem 1rem',
    marginRight: '0.5rem',
    backgroundColor: isActive ? 'rgba(156, 178, 77, 0.1)' : 'transparent',
    borderBottom: isActive ? '3px solid #9CB24D' : '3px solid transparent',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderRadius: '4px 4px 0 0',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#9CB24D' : '#666',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    outline: 'none',
    fontSize: '0.95rem'
  });

  // Desktop button style
  const desktopButtonStyle = (isActive) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '0.75rem 1rem',
    backgroundColor: isActive ? 'rgba(156, 178, 77, 0.1)' : 'transparent',
    borderLeft: isActive ? '3px solid #9CB24D' : '3px solid transparent',
    borderRadius: '0 4px 4px 0',
    fontWeight: isActive ? 'bold' : 'normal',
    color: isActive ? '#9CB24D' : '#666',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    outline: 'none'
  });

  return (
    <nav className="about-sidebar" style={isMobile ? mobileStyle : desktopStyle}>
      {!isMobile && (
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', paddingLeft: '1rem' }}>
          About Mantle
        </h3>
      )}
      <ul style={{ 
        listStyle: 'none', 
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'column',
        width: '100%',
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        {sections.map((section) => (
          <li key={section.id} style={{ marginBottom: isMobile ? 0 : '1rem' }}>
            <button
              onClick={() => scrollToSection(section.id)}
              style={isMobile 
                ? mobileButtonStyle(activeSection === section.id)
                : desktopButtonStyle(activeSection === section.id)
              }
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
} 