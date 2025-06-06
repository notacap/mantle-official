"use client";

import { useState, useEffect } from 'react';
import { formatPrice } from '@/app/services/woocommerce';
import { useCart } from '@/context/CartContext'; // Import useCart hook

export default function ProductActions({ productId, price, sizes, colors, amounts, sizeOptions, colorOptions, amountOptions, variations }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(amounts?.[0] || '');
  const [unitPrice, setUnitPrice] = useState(parseFloat(price) || 0);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Local loading state for the button
  const { callCartApi, setIsLoading: setCartLoading, isLoading: isCartLoading, nonce, openSideCart } = useCart(); // Get context functions
  
  // Effect to set initial selections
  useEffect(() => {
    // Set initial size if available
    if (sizes && sizes.length > 0) {
      setSelectedSize(sizes[0]);
    }
    // Set initial color if available
    if (colors && colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  }, [sizes, colors]);

  // Effect to validate selection when variations load or selections change
  useEffect(() => {
    if (variations && variations.length > 0 && selectedSize && selectedColor) {
      const variation = variations.find(v => {
        const sizeAttr = v.attributes.find(a => (a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes') && a.option === selectedSize);
        const colorAttr = v.attributes.find(a => (a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colours') && a.option === selectedColor);
        return sizeAttr && colorAttr;
      });

      if (!variation || variation.stock_status === 'outofstock') {
        // Current combination is invalid. Try to find the first available size for the selected color.
        const firstAvailableSize = sizes.find(size => {
          const v = variations.find(v => {
            const sizeAttr = v.attributes.find(a => (a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes') && a.option === size);
            const colorAttr = v.attributes.find(a => (a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colours') && a.option === selectedColor);
            return sizeAttr && colorAttr && v.stock_status !== 'outofstock';
          });
          return !!v;
        });

        if (firstAvailableSize) {
          setSelectedSize(firstAvailableSize);
        } else {
          // No size is available for this color, so we must reset something.
          // For now, let's just clear size. This indicates to the user they need to make a new choice.
          setSelectedSize('');
        }
      }
    }
  }, [selectedColor, variations, sizes, selectedSize, colors]);
  
  useEffect(() => {
    if (selectedAmount && amounts && amounts.length > 0) {
      // Assuming selectedAmount might be like "$25.00" or "25.00" or "25"
      const parsedAmount = parseFloat(String(selectedAmount).replace(/[^\d.-]/g, ''));
      if (!isNaN(parsedAmount)) {
        setUnitPrice(parsedAmount);
      } else {
        setUnitPrice(parseFloat(price) || 0); // Fallback to base price if parsing fails
      }
    } else {
      setUnitPrice(parseFloat(price) || 0); // Fallback to base price if no amounts/selection
    }
  }, [selectedAmount, price, amounts]);
  
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
  
  const handleSelectSize = (size) => {
    setSelectedSize(size);
    // When a size is selected, check if the current color is valid with it.
    // If not, clear the color selection to force the user to pick a valid one.
    if (selectedColor && isOptionDisabled('color', selectedColor, size)) {
      setSelectedColor('');
    }
  };

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    // When a color is selected, check if the current size is valid with it.
    // If not, clear the size selection to force the user to pick a valid one.
    if (selectedSize && isOptionDisabled('size', selectedSize, color)) {
      setSelectedSize('');
    }
  };

  const isOptionDisabled = (type, value, localSelected) => {
    if (!variations || variations.length === 0) return false; // No variations data, enable all

    const localSelectedSize = type === 'color' ? localSelected || selectedSize : value;
    const localSelectedColor = type === 'size' ? localSelected || selectedColor : value;

    if (!localSelectedSize || !localSelectedColor) return false;

    const variation = variations.find(v => {
        const sizeAttr = v.attributes.find(a => (a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes') && a.option === localSelectedSize);
        const colorAttr = v.attributes.find(a => (a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colours') && a.option === localSelectedColor);
        return sizeAttr && colorAttr;
    });

    if (!variation) return true; // Combination doesn't exist
    return variation.stock_status === 'outofstock';
  };
  
  // Helper function to get slug from display name
  const getSizeSlug = (sizeName) => {
    if (!sizeOptions || !sizeName) return sizeName;
    
    // Find the option with matching name and return its slug
    const option = sizeOptions.find(opt => 
      opt.name.toLowerCase() === sizeName.toLowerCase());
    
    if (option) {
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
      return option.slug;
    }
    
    console.warn(`No color slug found for "${colorName}"`);
    return colorName; // Fall back to name if no slug found
  };
  
  const getAmountSlug = (amountName) => {
    if (!amountOptions || !amountName) return amountName;
    
    const option = amountOptions.find(opt =>
      opt.name.toLowerCase() === amountName.toLowerCase());
      
    if (option) {
      return option.slug;
    }
    
    console.warn(`No amount slug found for "${amountName}"`);
    return amountName; // Fall back to name if no slug found
  };
  

  
  // Add to cart handler - Updated to use slugs
  const handleAddToCart = async () => {
    if (!nonce) {
      console.error("Add to Cart aborted: Nonce not available.");
      alert("Cannot add to cart. Please refresh the page or try again later.");
      return;
    }

    setIsAddingToCart(true);
    setCartLoading(true); // Uncommented: Set global loading state

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

    if (selectedAmount) {
      const amountSlug = getAmountSlug(selectedAmount);
      variation.push({ attribute: 'amount', value: amountSlug });
    }

    const itemData = {
      id: productId,
      quantity: quantity,
      ...(variation.length > 0 && { variation })
    };

    try {
      const updatedCart = await callCartApi('/wp-json/wc/store/v1/cart/add-item', 'POST', itemData);
      // alert('Product added to cart!'); // Remove existing alert
      openSideCart(); // Open the side cart instead
    } catch (error) {
      console.error('Failed to add to cart:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to add product to cart: ${error.message || 'Please try again.'}`);
    } finally {
      setIsAddingToCart(false);
      setCartLoading(false); // Uncommented: Clear global loading state
    }
  };
  
  const isCurrentSelectionInvalid = () => {
    if (!variations || variations.length === 0) return false;
    
    const hasSizes = sizes && sizes.length > 0;
    const hasColors = colors && colors.length > 0;

    if ((hasSizes && !selectedSize) || (hasColors && !selectedColor)) {
      return true; // A selection is required but not made
    }

    if (selectedSize && selectedColor) {
      return isOptionDisabled('size', selectedSize, selectedColor);
    }
    
    // Handle products with only one attribute type
    if (hasSizes && !hasColors && selectedSize) {
        const variation = variations.find(v => v.attributes.some(a => (a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes') && a.option === selectedSize));
        if (!variation) return true;
        return variation.stock_status === 'outofstock';
    }

    if (hasColors && !hasSizes && selectedColor) {
        const variation = variations.find(v => v.attributes.some(a => (a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colours') && a.option === selectedColor));
        if (!variation) return true;
        return variation.stock_status === 'outofstock';
    }

    return false;
  };

  // Determine if the button should be disabled
  const isButtonDisabled = isAddingToCart || isCartLoading || !nonce || isCurrentSelectionInvalid();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
            Size
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {sizes.map((size) => {
              const isDisabled = isOptionDisabled('size', size, selectedColor);
              return (
                <button
                  key={size}
                  onClick={() => handleSelectSize(size)}
                  disabled={isDisabled}
                  style={{
                    padding: '0.5rem 1rem',
                    border: `1px solid ${selectedSize === size ? '#9CB24D' : '#e5e7eb'}`,
                    borderRadius: '0.375rem',
                    backgroundColor: selectedSize === size ? '#f3f6e8' : 'white',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    color: selectedSize === size ? '#9CB24D' : 'inherit',
                    fontWeight: selectedSize === size ? '500' : 'normal',
                    opacity: isDisabled ? 0.6 : 1,
                    textDecoration: isDisabled ? 'line-through' : 'none',
                  }}
                >
                  {size}
                </button>
              );
            })}
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
            {colors.map((color) => {
              const isDisabled = isOptionDisabled('color', color, selectedSize);
              return (
                <button
                  key={color}
                  onClick={() => handleSelectColor(color)}
                  disabled={isDisabled}
                  style={{
                    padding: '0.5rem 1rem',
                    border: `1px solid ${selectedColor === color ? '#9CB24D' : '#e5e7eb'}`,
                    borderRadius: '0.375rem',
                    backgroundColor: selectedColor === color ? '#f3f6e8' : 'white',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    color: selectedColor === color ? '#9CB24D' : 'inherit',
                    fontWeight: selectedColor === color ? '500' : 'normal',
                    opacity: isDisabled ? 0.6 : 1,
                    textDecoration: isDisabled ? 'line-through' : 'none',
                  }}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Amount Selector */}
      {amounts.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
            Amount
          </h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {amounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                style={{
                  padding: '0.5rem 1rem',
                  border: `1px solid ${selectedAmount === amount ? '#9CB24D' : '#e5e7eb'}`,
                  borderRadius: '0.375rem',
                  backgroundColor: selectedAmount === amount ? '#f3f6e8' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: selectedAmount === amount ? '#9CB24D' : 'inherit',
                  fontWeight: selectedAmount === amount ? '500' : 'normal'
                }}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Quantity Selector and Total Price */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Quantity Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginRight: '0.5rem' }}>Quantity</h3>
          <button 
            onClick={decreaseQuantity} 
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              cursor: 'pointer',
              lineHeight: '1'
            }}
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input 
            type="number" 
            value={quantity} 
            onChange={handleQuantityChange} 
            style={{
              width: '4rem',
              textAlign: 'center',
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem'
            }} 
            aria-label="Current quantity"
          />
          <button 
            onClick={increaseQuantity} 
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              cursor: 'pointer',
              lineHeight: '1'
            }}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Total Price Display */}
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.25rem' }}>Total</h3>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#9CB24D' }}>
            {formatPrice(unitPrice * quantity)}
          </p>
        </div>
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