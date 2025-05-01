"use client";

import { useState, useEffect } from 'react';
import { formatPrice } from '@/app/services/woocommerce';
import { useCart } from '@/context/CartContext'; // Import useCart hook

export default function ProductActions({ productId, price, sizes, colors, sizeOptions, colorOptions }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Local loading state for the button
  const { callCartApi, setIsLoading: setCartLoading, isLoading: isCartLoading, nonce } = useCart(); // Get context functions
  
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
  
  // Helper function to get slug from display name
  const getSizeSlug = (sizeName) => {
    if (!sizeOptions || !sizeName) return sizeName;
    
    // Find the option with matching name and return its slug
    const option = sizeOptions.find(opt => 
      opt.name.toLowerCase() === sizeName.toLowerCase());
    
    if (option) {
      console.log(`Found size slug for "${sizeName}": "${option.slug}"`);
      return option.slug;
    }
    
    console.warn(`No size slug found for "${sizeName}"`);
    return sizeName; // Fall back to name if no slug found
  };
  
  const getColorSlug = (colorName) => {
    if (!colorOptions || !colorName) return colorName;
    
    // Find the option with matching name and return its slug
    const option = colorOptions.find(opt => 
      opt.name.toLowerCase() === colorName.toLowerCase());
    
    if (option) {
      console.log(`Found color slug for "${colorName}": "${option.slug}"`);
      return option.slug;
    }
    
    console.warn(`No color slug found for "${colorName}"`);
    return colorName; // Fall back to name if no slug found
  };
  
  // Log available options when component mounts or options change
  useEffect(() => {
    if (sizeOptions?.length) {
      console.log('Available size options:', sizeOptions.map(opt => ({
        name: opt.name,
        slug: opt.slug
      })));
    }
    
    if (colorOptions?.length) {
      console.log('Available color options:', colorOptions.map(opt => ({
        name: opt.name,
        slug: opt.slug
      })));
    }
  }, [sizeOptions, colorOptions]);
  
  // Add to cart handler - Updated to use slugs
  const handleAddToCart = async () => {
    if (!nonce) {
      console.error("Add to Cart aborted: Nonce not available.");
      alert("Cannot add to cart. Please refresh the page or try again later.");
      return;
    }

    setIsAddingToCart(true);
    setCartLoading(true);

    // Prepare variation as an array of objects with slugs instead of display names
    const variation = [];
    if (selectedSize) {
      const sizeSlug = getSizeSlug(selectedSize);
      variation.push({ attribute: 'size', value: sizeSlug });
    }
    
    if (selectedColor) {
      const colorSlug = getColorSlug(selectedColor);
      variation.push({ attribute: 'color', value: colorSlug });
    }

    const itemData = {
      id: productId,
      quantity: quantity,
      ...(variation.length > 0 && { variation })
    };

    try {
      console.log('[ProductActions] Attempting to add to cart. Current Nonce:', nonce);
      console.log('Adding to cart with data:', itemData);
      const updatedCart = await callCartApi('/wp-json/wc/store/v1/cart/add-item', 'POST', itemData);
      console.log('Cart updated successfully:', updatedCart);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to add product to cart: ${error.message || 'Please try again.'}`);
    } finally {
      setIsAddingToCart(false);
      setCartLoading(false);
    }
  };
  
  // Determine if the button should be disabled
  const isButtonDisabled = isAddingToCart || isCartLoading || !nonce;

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
            disabled={quantity <= 1} // Disable button explicitly
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
        disabled={isButtonDisabled} // Use combined disabled state
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: isButtonDisabled ? '#d1d5db' : '#9CB24D', // Grey out when disabled
          color: 'white',
          borderRadius: '0.375rem',
          fontWeight: '500',
          cursor: isButtonDisabled ? 'not-allowed' : 'pointer', // Change cursor when disabled
          width: '100%',
          transition: 'background-color 0.2s, cursor 0.2s',
          border: 'none',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          position: 'relative'
        }}
      >
        {isAddingToCart ? 'Adding...' : (isCartLoading ? 'Loading...' : 'Add to Cart')}
      </button>
    </div>
  );
} 