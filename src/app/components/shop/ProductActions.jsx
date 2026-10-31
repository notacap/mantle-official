"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatPrice } from '@/app/services/woocommerce';
import { useCart } from '@/context/CartContext'; // Import useCart hook

export default function ProductActions({ productId, price, sizes, colors, amounts, sizeOptions, colorOptions, amountOptions, variations, onVariationImageChange }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(amounts?.[0] || '');
  const [unitPrice, setUnitPrice] = useState(parseFloat(price) || 0);
  const [isAddingToCart, setIsAddingToCart] = useState(false); // Local loading state for the button
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const colorDropdownRef = useRef(null);
  const sizeDropdownRef = useRef(null);
  const { cart, callCartApi, setIsLoading: setCartLoading, isLoading: isCartLoading, nonce, openSideCart } = useCart(); // Get context functions
  
  // Helper function to update variation image - memoized to prevent re-renders
  const updateVariationImage = useCallback((color, size) => {
    if (!variations || variations.length === 0 || !onVariationImageChange) return;
    
    const matchingVariation = variations.find(variation => {
      const colorAttr = variation.attributes.find(attr => 
        (attr.name.toLowerCase() === 'color' || attr.name.toLowerCase() === 'colours') && 
        attr.option === color
      );
      const sizeAttr = variation.attributes.find(attr => 
        (attr.name.toLowerCase() === 'size' || attr.name.toLowerCase() === 'sizes') && 
        attr.option === size
      );
      
      const hasColors = colors && colors.length > 0;
      const hasSizes = sizes && sizes.length > 0;
      
      if (hasColors && hasSizes) {
        return colorAttr && sizeAttr;
      } else if (hasColors && !hasSizes) {
        return colorAttr;
      } else if (!hasColors && hasSizes) {
        return sizeAttr;
      }
      
      return false;
    });
    
    if (matchingVariation && matchingVariation.image && matchingVariation.image.src) {
      onVariationImageChange({
        src: matchingVariation.image.src,
        alt: matchingVariation.image.alt || `Product - ${color} ${size}`.trim()
      });
    }
  }, [variations, onVariationImageChange, colors, sizes]);
  
  // Track if we've initialized the default selections
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // This effect replaces the original "set initial selections" effect.
  // It intelligently sets the default options based on stock availability.
  useEffect(() => {
    // Only run initialization once
    if (hasInitialized) {
      return;
    }
    
    // Make sure we have the data we need before initializing
    if (!sizes || sizes.length === 0) {
      return;
    }
    
    // Default to the first option in the list.
    let defaultSize = sizes[0] || '';
    let defaultColor = colors?.[0] || '';

    // If we have variations, try to find a better default.
    if (variations && variations.length > 0) {
        const firstInStockVariation = variations.find(v => v.stock_status === 'instock');

        // If we find a variation that is in stock, we use its attributes as the default.
        if (firstInStockVariation) {
            const colorAttr = firstInStockVariation.attributes.find(a => a.name.toLowerCase() === 'color' || a.name.toLowerCase() === 'colours');
            const sizeAttr = firstInStockVariation.attributes.find(a => a.name.toLowerCase() === 'size' || a.name.toLowerCase() === 'sizes');

            if (colorAttr && colors && colors.includes(colorAttr.option)) {
                defaultColor = colorAttr.option;
            }
            if (sizeAttr && sizes && sizes.includes(sizeAttr.option)) {
                defaultSize = sizeAttr.option;
            }
        }
    }

    // Set the defaults
    setSelectedColor(defaultColor);
    setSelectedSize(defaultSize);
    setHasInitialized(true);
    
    // Update variation image for initial selection
    if (defaultColor || defaultSize) {
      updateVariationImage(defaultColor, defaultSize);
    }

  }, [variations, sizes, colors, updateVariationImage, hasInitialized]);

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

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target)) {
        setIsColorDropdownOpen(false);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target)) {
        setIsSizeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const hasVariations = Boolean(variations && variations.length > 0);
  const hasSizes = Boolean(sizes && sizes.length > 0);
  const hasColors = Boolean(colors && colors.length > 0);

  // Find the variation matching a color/size combination (attributes the product doesn't use are ignored)
  const findVariation = (color, size) => variations?.find(v =>
    (!hasSizes || v.attributes.some(a => isSizeAttribute(a) && a.option === size)) &&
    (!hasColors || v.attributes.some(a => isColorAttribute(a) && a.option === color))
  );

  const isComboAvailable = (color, size) => {
    const variation = findVariation(color, size);
    return Boolean(variation) && variation.stock_status !== 'outofstock';
  };

  const handleSelectSize = (size) => {
    setSelectedSize(size);
    let finalColor = selectedColor;
    // When a size is selected, check if the current color is valid with it.
    // If not, find the first available color for this size.
    if (hasVariations && selectedColor && !isComboAvailable(selectedColor, size)) {
       const firstAvailableColor = colors.find(color => isComboAvailable(color, size));
       finalColor = firstAvailableColor || '';
       setSelectedColor(finalColor);
    }

    // Update variation image
    updateVariationImage(finalColor, size);
  };

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    // When a color is selected, keep the current size if it's available in that color,
    // otherwise fall back to the first available size for the new color.
    const nextSize = selectedSize && !isOptionDisabled('size', selectedSize, color)
      ? selectedSize
      : sizes.find(size => !isOptionDisabled('size', size, color)) || '';
    setSelectedSize(nextSize);

    // Update variation image
    updateVariationImage(color, nextSize);
  };

  const isOptionDisabled = (type, value, otherSelection) => {
    if (!hasVariations) return false; // No variations data, enable all

    if (type === 'color') {
      // A color is only "out of stock" when no size of that color is purchasable.
      // It must NOT depend on the currently selected size: e.g. if "Black / XXL" is selected
      // and "Mantle Green / XXL" is sold out, Mantle Green must still be selectable
      // (handleSelectColor then switches to an in-stock size).
      if (!hasSizes) return !isComboAvailable(value, '');
      return !variations.some(v =>
        v.stock_status !== 'outofstock' &&
        v.attributes.some(a => isColorAttribute(a) && a.option === value)
      );
    }

    // type === 'size': depends on the selected color (color is chosen first in the UI)
    const color = otherSelection || selectedColor;
    if (hasColors && !color) return false; // Can't determine stock until a color is chosen
    return !isComboAvailable(color, value);
  };

  // --- Stock limits for the current selection ---
  // WooCommerce rejects add-to-cart when (requested qty + qty already in cart) > stock,
  // so cap the quantity selector to what can actually still be added.
  const selectedVariation = hasVariations ? findVariation(selectedColor, selectedSize) : null;
  const quantityInCart = selectedVariation
    ? (cart?.items || [])
        .filter(item => item.id === selectedVariation.id)
        .reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;
  const isStockLimited = Boolean(
    selectedVariation?.manage_stock &&
    selectedVariation.backorders === 'no' &&
    Number.isFinite(selectedVariation.stock_quantity)
  );
  const availableQuantity = isStockLimited
    ? Math.max(0, selectedVariation.stock_quantity - quantityInCart)
    : null; // null = no limit known
  const maxSelectableQuantity = availableQuantity === null ? Infinity : Math.max(1, availableQuantity);
  // Derived (not stored) so switching to a lower-stock variation clamps automatically
  const effectiveQuantity = Math.min(quantity, maxSelectableQuantity);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1) {
      setQuantity(Math.min(value, maxSelectableQuantity));
    }
  };

  const decreaseQuantity = () => setQuantity(Math.max(1, effectiveQuantity - 1));

  const increaseQuantity = () => setQuantity(Math.min(effectiveQuantity + 1, maxSelectableQuantity));

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
      quantity: effectiveQuantity,
      ...(variation.length > 0 && { variation })
    };

    try {
      const updatedCart = await callCartApi('/wp-json/wc/store/v1/cart/add-item', 'POST', itemData);
      // alert('Product added to cart!'); // Remove existing alert
      openSideCart(); // Open the side cart instead
    } catch (error) {
      console.error('Failed to add to cart:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to add product to cart: ${decodeHtmlEntities(error.message) || 'Please try again.'}`);
    } finally {
      setIsAddingToCart(false);
      setCartLoading(false); // Uncommented: Clear global loading state
    }
  };
  
  const isCurrentSelectionInvalid = () => {
    if (!hasVariations) return false;

    if ((hasSizes && !selectedSize) || (hasColors && !selectedColor)) {
      return true; // A selection is required but not made
    }

    if (!selectedVariation || selectedVariation.stock_status === 'outofstock') return true;

    // Everything in stock for this option is already in the cart
    return availableQuantity === 0;
  };

  // Determine if the button should be disabled
  const isButtonDisabled = isAddingToCart || isCartLoading || !nonce || isCurrentSelectionInvalid();

  // Custom Dropdown Component
  const CustomDropdown = ({ 
    value, 
    onChange, 
    options, 
    placeholder, 
    isOpen, 
    setIsOpen, 
    dropdownRef,
    checkDisabled 
  }) => {
    return (
      <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            paddingRight: '2.5rem',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            backgroundColor: 'white',
            fontSize: '1rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#9CB24D';
            e.target.style.boxShadow = '0 0 0 3px rgba(156, 178, 77, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        >
          <span style={{ color: value ? 'inherit' : '#9ca3af' }}>
            {value || placeholder}
          </span>
          <span
            style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              style={{ width: '15px', height: '15px' }}
            >
              <path
                stroke="#6b7280"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M6 8l4 4 4-4"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {options.map((option) => {
              const isDisabled = checkDisabled ? checkDisabled(option) : false;
              return (
                <div
                  key={option}
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(option);
                      setIsOpen(false);
                    }
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    color: isDisabled ? '#9ca3af' : 'inherit',
                    backgroundColor: 'white',
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s',
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled) {
                      e.target.style.backgroundColor = '#9CB24D';
                      e.target.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled) {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.color = 'inherit';
                    }
                  }}
                >
                  {option} {isDisabled ? '(Out of Stock)' : ''}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Color Selector - Moved to top */}
      {colors.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
            Color
          </h3>
          <CustomDropdown
            value={selectedColor}
            onChange={handleSelectColor}
            options={colors}
            placeholder="Select Color"
            isOpen={isColorDropdownOpen}
            setIsOpen={setIsColorDropdownOpen}
            dropdownRef={colorDropdownRef}
            checkDisabled={(color) => isOptionDisabled('color', color, selectedSize)}
          />
        </div>
      )}

      {/* Size Selector - Moved to bottom */}
      {sizes.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.75rem' }}>
            Size
          </h3>
          <CustomDropdown
            value={selectedSize}
            onChange={handleSelectSize}
            options={sizes}
            placeholder="Select Size"
            isOpen={isSizeDropdownOpen}
            setIsOpen={setIsSizeDropdownOpen}
            dropdownRef={sizeDropdownRef}
            checkDisabled={(size) => isOptionDisabled('size', size, selectedColor)}
          />
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
            value={effectiveQuantity} 
            min={1}
            {...(availableQuantity !== null && { max: maxSelectableQuantity })}
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
            disabled={effectiveQuantity >= maxSelectableQuantity}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              backgroundColor: 'white',
              cursor: effectiveQuantity >= maxSelectableQuantity ? 'not-allowed' : 'pointer',
              opacity: effectiveQuantity >= maxSelectableQuantity ? 0.5 : 1,
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
            {formatPrice(unitPrice * effectiveQuantity)}
          </p>
        </div>
      </div>
      
      <StockNotice availableQuantity={availableQuantity} quantityInCart={quantityInCart} />

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

function StockNotice({ availableQuantity, quantityInCart }) {
  if (availableQuantity === null) return null;

  if (availableQuantity === 0 && quantityInCart > 0) {
    return (
      <p role="status" style={{ fontSize: '0.875rem', color: '#b45309', margin: 0 }}>
        You already have all available stock of this option in your cart.
      </p>
    );
  }

  if (availableQuantity > 0 && availableQuantity <= LOW_STOCK_THRESHOLD) {
    return (
      <p role="status" style={{ fontSize: '0.875rem', color: '#b45309', margin: 0 }}>
        Only {availableQuantity} left in stock{quantityInCart > 0 ? ' (excluding what is in your cart)' : ''}.
      </p>
    );
  }

  return null;
}

function isSizeAttribute(attribute) {
  const name = attribute.name.toLowerCase();
  return name === 'size' || name === 'sizes';
}

function isColorAttribute(attribute) {
  const name = attribute.name.toLowerCase();
  return name === 'color' || name === 'colours';
}

// WooCommerce Store API error messages contain HTML entities (e.g. &quot;)
function decodeHtmlEntities(text) {
  if (!text || typeof document === 'undefined') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

const LOW_STOCK_THRESHOLD = 5;
