"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const CartContext = createContext();

// Helper function to get the base URL - Reads from environment variable
const getApiBaseUrl = () => {
  const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
  if (!wordpressUrl) {
    console.error(
      "Missing NEXT_PUBLIC_WORDPRESS_URL environment variable.",
      "Please set it in your .env.local file to your WordPress site URL."
    );
    return ''; 
  }
  // Remove trailing slash if present
  return wordpressUrl.replace(/\/$/, ''); 
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [nonce, setNonce] = useState(null);
  const [cartToken, setCartToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to load cartToken from localStorage on initial mount
  useEffect(() => {
    const storedCartToken = localStorage.getItem('wooCartToken');
    if (storedCartToken) {
      setCartToken(storedCartToken);
      // console.log('[CartContext] Loaded Cart-Token from localStorage:', storedCartToken);
    }
  }, []);

  // Helper function to update cartToken state and localStorage
  const persistCartToken = (newToken) => {
    if (newToken) {
      setCartToken(newToken);
      localStorage.setItem('wooCartToken', newToken);
      // console.log('[CartContext] Saved Cart-Token to localStorage:', newToken);
    } else {
      setCartToken(null);
      localStorage.removeItem('wooCartToken');
      // console.log('[CartContext] Cleared Cart-Token from localStorage.');
    }
  };

  // Fetch initial cart state and Nonce
  const fetchCartAndNonce = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
        setError("Configuration error: WordPress URL not set.");
        setIsLoading(false);
        return;
    }
    try {
      const apiUrl = `${baseUrl}/wp-json/wc/store/v1/cart`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Uncommented as CORS allows credentials
      });

      if (!response.ok) {
        let errorBody = 'Unknown error';
        try {
            errorBody = await response.text();
        } catch {}
        throw new Error(`HTTP error! status: ${response.status} fetching ${apiUrl}. Body: ${errorBody}`);
      }

      const newNonce =
        response.headers.get('X-WC-Store-API-Nonce') ||
        response.headers.get('X-WP-Nonce') ||
        response.headers.get('Nonce');
      const cartData = await response.json();
      
      // console.log('[CartContext] Fetched initial cart. Nonce Header:', newNonce);

      // Extract and log Cart-Token
      let extractedCartToken = response.headers.get('Cart-Token');
      if (!extractedCartToken) extractedCartToken = response.headers.get('cart-token');
      if (extractedCartToken) {
        console.log('[CartContext] Fetched initial cart. Cart-Token Header:', extractedCartToken);
        persistCartToken(extractedCartToken);
      } else {
        console.warn('[CartContext] Cart-Token header was missing in the response from', apiUrl);
      }

      setCart(cartData);
      if (newNonce) {
        setNonce(newNonce);
      } else {
         console.warn("Nonce header was missing in the response from", apiUrl);
         setError("Initialization Error: Could not retrieve security token from WordPress. Cart actions may fail.");
      }

    } catch (err) {
      console.error("Failed to fetch initial cart:", err);
      setError(`Could not load cart data from WordPress: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartAndNonce();
  }, [fetchCartAndNonce]);

  // Function to update cart and nonce, typically after an API call
  const updateCartAndNonce = (newCartData, newNonceValue) => {
    setCart(newCartData);
    if (newNonceValue) {
      setNonce(newNonceValue);
    } else {
        console.warn("No new Nonce provided after cart update.");
    }
  };
  
  // Function to handle generic cart API calls
  const callCartApi = useCallback(async (endpoint, method = 'POST', body = null) => {
    if (!nonce) {
      console.error("Nonce is not available for API call.");
      throw new Error("Cannot perform cart operation: Authentication token missing.");
    }
    
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error("Configuration error: WordPress URL not set.");
    }
  
    setIsLoading(true); 
    setError(null);
    const apiUrl = `${baseUrl}${endpoint}`;

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Nonce': nonce,
    };

    if (cartToken) {
      requestHeaders['Cart-Token'] = cartToken;
      // console.log('[CartContext] Sending Cart-Token in request header:', cartToken);
    }
  
    try {
      console.log('Making API call to:', apiUrl);
      console.log('Request body:', body);
      console.log('Request headers:', requestHeaders);
      const response = await fetch(apiUrl, {
        method: method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : null,
        credentials: 'include',
      });
  
      const responseNonce = response.headers.get('Nonce');
      
      if (!response.ok) {
        const errorBodyText = await response.text();
        console.error(`API Error Response for ${method} ${apiUrl}:`, errorBodyText);
        let errorData;
        try {
          errorData = JSON.parse(errorBodyText);
        } catch {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Raw Response: ${errorBodyText}`);
        }
        throw new Error(errorData.message || `API Error: ${response.status} - ${errorData.code || 'Unknown error code'}`);
      }
  
      const data = await response.json();
      console.log('API Response Data:', data);
      updateCartAndNonce(data, responseNonce);

      // Extract, log, and persist Cart-Token from API call response
      let cartTokenFromApiCall = response.headers.get('Cart-Token');
      if (!cartTokenFromApiCall) cartTokenFromApiCall = response.headers.get('cart-token');
      if (cartTokenFromApiCall) {
        console.log('[CartContext] API call successful. Cart-Token Header:', cartTokenFromApiCall);
        persistCartToken(cartTokenFromApiCall);
      } else {
        console.warn('[CartContext] Cart-Token header was missing in the API response from', apiUrl);
      }
      
      return data;
  
    } catch (err) {
      console.error(`Failed to call cart API endpoint ${apiUrl}:`, err);
      setError(err.message || `An error occurred while updating the cart via ${apiUrl}.`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [nonce, cartToken]);


  return (
    <CartContext.Provider value={{ cart, nonce, cartToken, isLoading, error, fetchCartAndNonce, updateCartAndNonce, callCartApi, setIsLoading }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the CartContext
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 