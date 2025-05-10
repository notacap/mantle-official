"use client";

import { useState, useEffect } from 'react';

const MIN_SUBMISSION_TIME_MS = 3000; // 3 seconds

export default function ContactForm() {
  const [formType, setFormType] = useState('general'); // 'general' or 'order'
  const [formLoadTime, setFormLoadTime] = useState(0);
  
  useEffect(() => {
    setFormLoadTime(Date.now());
  }, [formType]); // Reset load time when form type changes
  
  const handleFormTypeChange = (type) => {
    setFormType(type);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submissionTime = Date.now();
    if (submissionTime - formLoadTime < MIN_SUBMISSION_TIME_MS) {
      console.log('Bot detected: Form submitted too quickly.');
      alert('Form submission too fast. Please try again.'); // User-facing message
      return;
    }

    const honeypotValue = e.target.website.value;
    if (honeypotValue) {
      console.log('Bot detected via honeypot');
      return; // Silently fail for honeypot
    }
    
    console.log('Form submitted by a human (passed time check and honeypot)');
    
    e.target.reset();
    setFormLoadTime(Date.now()); // Reset load time for the next interaction on the same form type
  };
  
  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">What would you like to contact us about?</h2>
        
        <div className="form-selector">
          <button 
            type="button" 
            className={`selector-button ${formType === 'general' ? 'active' : ''}`}
            onClick={() => handleFormTypeChange('general')}
          >
            General Inquiry
          </button>
          <button 
            type="button" 
            className={`selector-button ${formType === 'order' ? 'active' : ''}`}
            onClick={() => handleFormTypeChange('order')}
          >
            My Order
          </button>
        </div>
      </div>
      
      {formType === 'general' ? (
        <form key="general" className="contact-form" onSubmit={handleSubmit}>
          <div className="honeypot-field">
            <input 
              type="text" 
              id="website" 
              name="website" 
              autoComplete="off"
              tabIndex="-1"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              placeholder="Your name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="your.email@example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea 
              id="message" 
              name="message" 
              required 
              placeholder="How can we help you?"
            ></textarea>
          </div>
          
          <button type="submit" className="submit-button">
            Send Message
          </button>
          
          <div className="form-info">
            For agency or department purchases, please email <a href="mailto:info@mantle-clothing.com">info@mantle-clothing.com</a>.
          </div>
        </form>
      ) : (
        <form key="order" className="contact-form" onSubmit={handleSubmit}>
          <div className="honeypot-field">
            <input 
              type="text" 
              id="website" 
              name="website" 
              autoComplete="off"
              tabIndex="-1"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                required 
                placeholder="Your first name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                required 
                placeholder="Your last name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="orderEmail">Email</label>
            <input 
              type="email" 
              id="orderEmail" 
              name="email" 
              required 
              placeholder="your.email@example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              placeholder="Your phone number (optional)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="orderNumber">Order Number</label>
            <input 
              type="text" 
              id="orderNumber" 
              name="orderNumber" 
              required 
              placeholder="Your order number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="orderMessage">Message</label>
            <textarea 
              id="orderMessage" 
              name="message" 
              required 
              placeholder="Please describe your issue or question regarding your order"
            ></textarea>
          </div>
          
          <button type="submit" className="submit-button">
            Submit Request
          </button>
          
          <div className="form-info">
            For agency or department purchases, please email <a href="mailto:info@mantle-clothing.com">info@mantle-clothing.com</a>.
          </div>
        </form>
      )}
    </div>
  );
} 