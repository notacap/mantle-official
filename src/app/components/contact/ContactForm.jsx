"use client";

import { useState, useEffect } from 'react';

const MIN_SUBMISSION_TIME_MS = 3000; // 3 seconds

export default function ContactForm() {
  const [formType, setFormType] = useState('general'); // 'general' or 'order'
  const [formLoadTime, setFormLoadTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ error: '', success: '' });
  
  useEffect(() => {
    setFormLoadTime(Date.now());
    setSubmitStatus({ error: '', success: '' }); // Reset status on form type change
  }, [formType]);
  
  const handleFormTypeChange = (type) => {
    setFormType(type);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ error: '', success: '' });
    setIsSubmitting(true);

    const submissionTime = Date.now();
    if (submissionTime - formLoadTime < MIN_SUBMISSION_TIME_MS) {
      console.log('Bot detected: Form submitted too quickly.');
      setSubmitStatus({ error: 'Form submission too fast. Please try again.', success: '' });
      setIsSubmitting(false);
      return;
    }

    const honeypotInput = e.target.website;
    if (honeypotInput && honeypotInput.value) {
      console.log('Bot detected via honeypot');
      // Silently fail for honeypot, or show a generic success message
      // For now, we'll just stop and not show an error to the bot.
      setIsSubmitting(false);
      return;
    }

    const formElement = e.target;
    const formData = new FormData(formElement);
    let submissionData = {};
    let currentFormId = '';

    if (formType === 'general') {
      currentFormId = '2';
      submissionData = {
        input_1_3: formData.get('firstName'), // First Name
        input_1_6: formData.get('lastName'),  // Last Name
        input_2: formData.get('email'),
        input_4: formData.get('message'),
      };
    } else { // 'order' form
      currentFormId = '3';
      submissionData = {
        input_1_3: formData.get('firstName'),
        input_1_6: formData.get('lastName'),
        input_2: formData.get('orderEmail'), 
        input_4: formData.get('phone'),
        input_3: formData.get('message'), 
        input_5: formData.get('orderNumber'),
      };
    }

    try {
      const response = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formId: currentFormId, submissionData }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({ error: '', success: 'Your message has been sent successfully!' });
        formElement.reset();
        setFormLoadTime(Date.now()); // Reset load time for the next interaction
        setTimeout(() => setSubmitStatus({ error: '', success: '' }), 5000); // Clear success message
      } else {
        setSubmitStatus({ error: result.error || 'An error occurred. Please try again.', success: '' });
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setSubmitStatus({ error: 'An error occurred. Please try again.', success: '' });
    } finally {
      setIsSubmitting(false);
    }
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
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="generalFirstName">First Name<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
              <input 
                type="text" 
                id="generalFirstName" 
                name="firstName" 
                required 
                placeholder="Your first name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="generalLastName">Last Name<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
              <input 
                type="text" 
                id="generalLastName" 
                name="lastName" 
                required 
                placeholder="Your last name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="generalEmail">Email<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
            <input 
              type="email" 
              id="generalEmail" 
              name="email" 
              required 
              placeholder="your.email@example.com"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="generalMessage">Message<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
            <textarea 
              id="generalMessage" 
              name="message" 
              required 
              placeholder="How can we help you?"
            ></textarea>
          </div>
          
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
          
          {submitStatus.error && <p className="form-message error">{submitStatus.error}</p>}
          {submitStatus.success && <p className="form-message success">{submitStatus.success}</p>}
          
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
              <label htmlFor="orderFirstName">First Name<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
              <input 
                type="text" 
                id="orderFirstName" 
                name="firstName" 
                required 
                placeholder="Your first name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="orderLastName">Last Name<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
              <input 
                type="text" 
                id="orderLastName" 
                name="lastName" 
                required 
                placeholder="Your last name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="orderEmail">Email<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
            <input 
              type="email" 
              id="orderEmail" 
              name="orderEmail" 
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
            <label htmlFor="orderNumber">Order Number<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
            <input 
              type="text" 
              id="orderNumber" 
              name="orderNumber" 
              required 
              placeholder="Your order number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="orderMessage">Message<span style={{ color: 'red', marginLeft: '2px' }}>*</span></label>
            <textarea 
              id="orderMessage" 
              name="message" 
              required 
              placeholder="Please describe your issue or question regarding your order"
            ></textarea>
          </div>
          
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
          
          {submitStatus.error && <p className="form-message error">{submitStatus.error}</p>}
          {submitStatus.success && <p className="form-message success">{submitStatus.success}</p>}
          
          <div className="form-info">
            For agency or department purchases, please email <a href="mailto:info@mantle-clothing.com">info@mantle-clothing.com</a>.
          </div>
        </form>
      )}
    </div>
  );
} 