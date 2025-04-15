"use client";

import { useState } from 'react';
import { formatPrice } from '@/app/services/woocommerce';

export default function ProductActions({ productId, price, sizes, colors }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1) {
      setQuantity(value);
    }
  };
  
  // Increase/decrease quantity
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  // Add to cart handler
  const handleAddToCart = async () => {
    // In a real application, this would add the product to the cart
    // For now, we'll just simulate the action
    setIsAddingToCart(true);
    
    try {
      // console.log('Adding to cart:', {
      //   productId,
      //   quantity,
      //   selectedSize,
      //   selectedColor,
      //   price
      // });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success message (could be replaced with a toast notification)
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
            Size
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                style={{
                  padding: '0.5rem 1rem',
                  border: `1px solid ${selectedSize === size ? '#9CB24D' : '#e5e7eb'}`,
                  borderRadius: '0.375rem',
                  backgroundColor: selectedSize === size ? '#f3f6e8' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: selectedSize === size ? '#9CB24D' : 'inherit',
                  fontWeight: selectedSize === size ? '500' : 'normal'
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
            Color
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  padding: '0.5rem 1rem',
                  border: `1px solid ${selectedColor === color ? '#9CB24D' : '#e5e7eb'}`,
                  borderRadius: '0.375rem',
                  backgroundColor: selectedColor === color ? '#f3f6e8' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: selectedColor === color ? '#9CB24D' : 'inherit',
                  fontWeight: selectedColor === color ? '500' : 'normal'
                }}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Quantity Selector */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
          Quantity
        </h3>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: 'fit-content'
        }}>
          <button
            onClick={decreaseQuantity}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              cursor: quantity > 1 ? 'pointer' : 'not-allowed',
              opacity: quantity > 1 ? 1 : 0.5
            }}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            style={{
              width: '3.5rem',
              height: '2.5rem',
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              textAlign: 'center'
            }}
          />
          <button
            onClick={increaseQuantity}
            style={{
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>
      </div>
      
      {/* Total Price */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Total
        </h3>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#9CB24D' }}>
          {formatPrice((parseFloat(price) * quantity).toString())}
        </p>
      </div>
      
      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: isAddingToCart ? '#bac989' : '#9CB24D',
          color: 'white',
          borderRadius: '0.375rem',
          fontWeight: '500',
          cursor: isAddingToCart ? 'wait' : 'pointer',
          width: '100%',
          transition: 'background-color 0.2s',
          border: 'none',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          position: 'relative'
        }}
      >
        {isAddingToCart ? 'Adding to Cart...' : 'Add to Cart'}
      </button>
    </div>
  );
} 