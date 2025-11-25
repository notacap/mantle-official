"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from '@/context/CartContext';

/**
 * Hook for validating cart against BOGO deals
 * Integrates with existing CartContext
 */
export function useBOGOValidation() {
  const { cart } = useCart();
  const [bogoDiscount, setBogoDiscount] = useState(0);
  const [bogoMessages, setBogoMessages] = useState([]);
  const [appliedDeals, setAppliedDeals] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Debounce ref to prevent excessive API calls
  const debounceRef = useRef(null);

  const validateCart = useCallback(async () => {
    // Extract cart items in required format
    if (!cart?.items || cart.items.length === 0) {
      setBogoDiscount(0);
      setBogoMessages([]);
      setAppliedDeals([]);
      return;
    }

    // Format cart items for validation API
    const items = cart.items.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    setIsValidating(true);
    setValidationError(null);

    try {
      // Use internal API proxy route
      const response = await fetch('/api/bogo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setBogoDiscount(data.validation.total_discount || 0);
        setBogoMessages(data.validation.messages || []);
        setAppliedDeals(data.validation.deals_applied || []);
      }
    } catch (error) {
      console.error('BOGO validation error:', error);
      setValidationError(error.message);
      // Don't clear discount on error - keep last known good state
    } finally {
      setIsValidating(false);
    }
  }, [cart?.items]);

  // Debounced validation when cart changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      validateCart();
    }, 300); // 300ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [validateCart]);

  return {
    bogoDiscount,
    bogoMessages,
    appliedDeals,
    isValidating,
    validationError,
    revalidate: validateCart
  };
}
