"use client";

import { useState, useEffect } from 'react';

export default function ContactForm() {
  const [formType, setFormType] = useState('general'); // 'general' or 'order'
  const [mathQuestion, setMathQuestion] = useState({ num1: 0, num2: 0, answer: '' });
  const [generalAnswer, setGeneralAnswer] = useState('');
  const [orderAnswer, setOrderAnswer] = useState('');
  const [isGeneralHuman, setIsGeneralHuman] = useState(false);
  const [isOrderHuman, setIsOrderHuman] = useState(false);
  
  // Generate a simple math question
  useEffect(() => {
    generateMathQuestion();
  }, []);
  
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setMathQuestion({
      num1,
      num2,
      answer: String(num1 + num2)
    });
    setGeneralAnswer('');
    setOrderAnswer('');
    setIsGeneralHuman(false);
    setIsOrderHuman(false);
  };
  
  const handleGeneralAnswerChange = (e) => {
    const value = e.target.value;
    setGeneralAnswer(value);
    setIsGeneralHuman(value === mathQuestion.answer);
  };
  
  const handleOrderAnswerChange = (e) => {
    const value = e.target.value;
    setOrderAnswer(value);
    setIsOrderHuman(value === mathQuestion.answer);
  };
  
  // Switch form type
  const handleFormTypeChange = (type) => {
    setFormType(type);
  };
  
  // Form handling (placeholder for now)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if the honeypot field is empty (bots will likely fill it)
    const honeypotValue = e.target.website.value;
    if (honeypotValue) {
      console.log('Bot detected via honeypot');
      return;
    }
    
    // Check if the CAPTCHA was completed correctly
    const isHuman = formType === 'general' ? isGeneralHuman : isOrderHuman;
    if (!isHuman) {
      alert('Please correctly answer the math question to verify you are human.');
      return;
    }
    
    // Will handle form submission later
    console.log('Form submitted by a human');
    
    // Reset the form and CAPTCHA after submission
    e.target.reset();
    generateMathQuestion();
  };
  
  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="form-title">What would you like to contact us about?</h2>
        
        {/* Form Type Selection */}
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
      
      {/* Form Content */}
      {formType === 'general' ? (
        <form className="contact-form" onSubmit={handleSubmit}>
          {/* Honeypot field - hidden from users but bots will fill it */}
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
          
          {/* Simple CAPTCHA */}
          <div className="form-group captcha-group">
            <label htmlFor="captcha">
              Please solve this math problem: {mathQuestion.num1} + {mathQuestion.num2} = ?
            </label>
            <input 
              type="text" 
              id="captcha" 
              name="captcha" 
              value={generalAnswer}
              onChange={handleGeneralAnswerChange}
              required 
              placeholder="Enter the answer"
              className={generalAnswer ? (isGeneralHuman ? 'valid-captcha' : 'invalid-captcha') : ''}
            />
          </div>
          
          <button type="submit" className="submit-button" disabled={!isGeneralHuman}>
            Send Message
          </button>
          
          <div className="form-info">
            For agency or department purchases, please email <a href="mailto:info@mantle-clothing.com">info@mantle-clothing.com</a>.
          </div>
        </form>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit}>
          {/* Honeypot field - hidden from users but bots will fill it */}
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
          
          {/* Simple CAPTCHA */}
          <div className="form-group captcha-group">
            <label htmlFor="orderCaptcha">
              Please solve this math problem: {mathQuestion.num1} + {mathQuestion.num2} = ?
            </label>
            <input 
              type="text" 
              id="orderCaptcha" 
              name="captcha" 
              value={orderAnswer}
              onChange={handleOrderAnswerChange}
              required 
              placeholder="Enter the answer"
              className={orderAnswer ? (isOrderHuman ? 'valid-captcha' : 'invalid-captcha') : ''}
            />
          </div>
          
          <button type="submit" className="submit-button" disabled={!isOrderHuman}>
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