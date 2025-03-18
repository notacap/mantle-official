"use client";

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1000);
  };

  return (
    <section style={{ 
      padding: '4rem 1rem',
      backgroundColor: '#F8F8F8',
      borderTop: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb',
      position: 'relative',
    }}>
      {/* Decorative accent line at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100px',
        height: '3px',
        backgroundColor: '#9CB24D',
        maxWidth: '1200px',
      }} />
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1rem',
        position: 'relative',
      }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          marginBottom: '1rem',
          color: '#333333',
        }}>
          Stay Connected
        </h2>
        
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#4b5563', 
          maxWidth: '600px', 
          margin: '0 auto 2rem' 
        }}>
          Join our newsletter for exclusive offers, new product announcements, and sustainable fashion tips.
        </p>
        
        <form 
          onSubmit={handleSubmit}
          style={{ 
            width: '100%',
            maxWidth: '500px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ 
            display: 'flex',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            borderRadius: '0.25rem',
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              disabled={isSubmitting || isSubmitted}
              style={{
                flex: '1',
                padding: '0.875rem 1.25rem',
                borderRadius: '0.25rem 0 0 0.25rem',
                border: '1px solid #e5e7eb',
                borderRight: 'none',
                outline: 'none',
                fontSize: '1rem',
                backgroundColor: 'white',
                transition: 'all 0.3s ease',
                borderColor: error ? '#ef4444' : '#e5e7eb',
              }}
              onFocus={(e) => e.target.style.borderColor = '#9CB24D'}
              onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb'}
            />
            <button
              type="submit"
              disabled={isSubmitting || isSubmitted}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.875rem 1.5rem',
                backgroundColor: '#9CB24D',
                color: 'white',
                border: 'none',
                borderRadius: '0 0.25rem 0.25rem 0',
                fontWeight: '500',
                cursor: isSubmitting || isSubmitted ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: isSubmitting || isSubmitted ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !isSubmitted) {
                  e.currentTarget.style.backgroundColor = '#8CA23D';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9CB24D';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : isSubmitted ? (
                'Subscribed!'
              ) : (
                <>
                  Subscribe
                  <Send size={16} style={{ marginLeft: '0.5rem' }} />
                </>
              )}
            </button>
          </div>
          
          {/* Error message */}
          {error && (
            <p style={{ 
              color: '#ef4444', 
              fontSize: '0.875rem', 
              marginTop: '0.5rem', 
              textAlign: 'left' 
            }}>
              {error}
            </p>
          )}
          
          {/* Success message */}
          {isSubmitted && (
            <p style={{ 
              color: '#10b981', 
              fontSize: '0.875rem', 
              marginTop: '0.5rem' 
            }}>
              Thank you for subscribing to our newsletter!
            </p>
          )}
          
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            marginTop: '1rem' 
          }}>
            We respect your privacy and will never share your information.
          </p>
        </form>
      </div>
      
      {/* Decorative accent line at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100px',
        height: '3px',
        backgroundColor: '#9CB24D',
        maxWidth: '1200px',
      }} />
    </section>
  );
} 