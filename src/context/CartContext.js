"use client";

import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';

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
  const cartTokenRef = useRef(cartToken); // Ref to hold current cartToken
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastKnownCartUpdateTimestamp, setLastKnownCartUpdateTimestamp] = useState(null);
  const thisTabLastUpdateTimestampRef = useRef(null);
  const [isTokenLoadAttempted, setIsTokenLoadAttempted] = useState(false);
  const [isSideCartOpen, setIsSideCartOpen] = useState(false);

  useEffect(() => {
    const storedCartToken = localStorage.getItem('wooCartToken');
    if (storedCartToken) {
      setCartToken(storedCartToken);
    }
    setIsTokenLoadAttempted(true);
  }, []);

  // Effect to keep cartTokenRef in sync with cartToken state
  useEffect(() => {
    cartTokenRef.current = cartToken;
  }, [cartToken]);

  const persistCartToken = useCallback((newToken) => {
    if (newToken && newToken !== cartTokenRef.current) { // Compare with ref's current value
      setCartToken(newToken);
      localStorage.setItem('wooCartToken', newToken);
    } else if (!newToken && cartTokenRef.current) { // Clearing an existing token
      setCartToken(null);
      localStorage.removeItem('wooCartToken');
    }
  }, []); // Removed cartToken from dependency array, relies on ref

  const fetchCartAndNonce = useCallback(async () => {
    if (!isTokenLoadAttempted) {
      return;
    }
    setIsLoading(true);
    setError(null);
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
        setError("Configuration error: WordPress URL not set.");
        setIsLoading(false);
        return;
    }
    const apiUrl = `${baseUrl}/wp-json/wc/store/v1/cart`;
    
    const requestHeaders = {
      'Content-Type': 'application/json',
    };

    // Use cartTokenRef.current for sending the token
    if (cartTokenRef.current) {
      requestHeaders['Cart-Token'] = cartTokenRef.current;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: requestHeaders, // Use updated headers
        credentials: 'include',
      });

      if (!response.ok) {
        let errorBody = 'Unknown error';
        try {
            errorBody = await response.text();
        } catch {}
        // If the request was made with a cartToken and failed, especially with 401/403, clear the token
        // Check against cartTokenRef.current
        if (cartTokenRef.current && (response.status === 401 || response.status === 403)) {
          console.warn(`[CartContext] Initial cart fetch failed with status ${response.status} and a Cart-Token. Clearing the token.`);
          persistCartToken(null); // persistCartToken will now use the ref internally too or just setCartToken
        } else if (cartTokenRef.current && !response.ok) {
          console.warn('[CartContext] Initial cart fetch failed with a Cart-Token. Token kept for now, but inspect error.');
          // We already have a general error throw, specific token clearing for 401/403 is above
        }
        throw new Error(`HTTP error! status: ${response.status} fetching ${apiUrl}. Body: ${errorBody}`);
      }

      const newNonce =
        response.headers.get('X-WC-Store-API-Nonce') ||
        response.headers.get('X-WP-Nonce') ||
        response.headers.get('Nonce');
      const cartData = await response.json();
      

      // Extract Cart-Token from GET response, but DO NOT persist it here.
      // persistCartToken is primarily handled by callCartApi or initial load.
      // If a token is returned by a GET, it's more of an affirmation or a new session token
      // if the old one was invalid. callCartApi will handle persistence if it makes a change.
      let extractedCartToken = response.headers.get('Cart-Token');
      if (!extractedCartToken) extractedCartToken = response.headers.get('cart-token');
      if (extractedCartToken && extractedCartToken !== cartTokenRef.current) {
        // If the GET request returns a *different* token than what we sent,
        // it might mean the server invalidated the old one and issued a new one.
        // We should update our state and ref, and persist it.
        // This scenario is less common for GET but possible if the token expired mid-session
        // and the GET endpoint itself provides a new one.
        persistCartToken(extractedCartToken);
      }
      // Removed persistCartToken(extractedCartToken) from here to avoid re-triggering due to token change from GET itself

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
  }, [isTokenLoadAttempted, persistCartToken, setCart, setNonce, setError, setIsLoading]); // Removed cartToken, persistCartToken. Added setters. persistCartToken is stable.

  useEffect(() => {
    if (isTokenLoadAttempted) {
      fetchCartAndNonce();
    }
  }, [isTokenLoadAttempted, fetchCartAndNonce]);

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
    // cartToken might be null if not yet set or cleared, which is fine for some endpoints perhaps
    // but add-item, update-item, remove-item will likely need it.
    // The check `if (cartToken)` for adding header handles this.
    
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error("Configuration error: WordPress URL not set.");
    }
  
    setError(null);
    const apiUrl = `${baseUrl}${endpoint}`;

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Nonce': nonce,
    };

    // Use cartTokenRef.current for sending the token
    if (cartTokenRef.current) {
      requestHeaders['Cart-Token'] = cartTokenRef.current;
    }
  
    try {

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
          // If parsing fails, throw with raw text. Check for token-specific errors first.
          // Check against cartTokenRef.current
          if (cartTokenRef.current && (response.status === 401 || response.status === 403)) {
            console.warn(`[CartContext] API call to ${apiUrl} failed with status ${response.status} and a Cart-Token. Clearing the token.`);
            persistCartToken(null);
          }
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Raw Response: ${errorBodyText}`);
        }
        // If parsed, check for token-specific errors.
        // Check against cartTokenRef.current
        if (cartTokenRef.current && (response.status === 401 || response.status === 403)) {
          console.warn(`[CartContext] API call to ${apiUrl} failed with status ${response.status} (parsed) and a Cart-Token. Clearing the token.`);
          persistCartToken(null);
        }
        throw new Error(errorData.message || `API Error: ${response.status} - ${errorData.code || 'Unknown error code'}`);
      }
  
      const data = await response.json();
      updateCartAndNonce(data, responseNonce);

      const currentTimestamp = Date.now();
      localStorage.setItem('wooCartLastUserUpdate', currentTimestamp.toString());
      thisTabLastUpdateTimestampRef.current = currentTimestamp;
      setLastKnownCartUpdateTimestamp(currentTimestamp);

      let cartTokenFromApiCall = response.headers.get('Cart-Token');
      if (!cartTokenFromApiCall) cartTokenFromApiCall = response.headers.get('cart-token');
      if (cartTokenFromApiCall) {
        persistCartToken(cartTokenFromApiCall); 
      } else {
        // console.warn('[CartContext] Cart-Token header was missing in the API response from', apiUrl);
      }
      
      return data;
  
    } catch (err) {
      console.error(`Failed to call cart API endpoint ${apiUrl}:`, err);
      setError(err.message || `An error occurred while updating the cart via ${apiUrl}.`);
      throw err;
    }
  }, [nonce, persistCartToken, setError, setLastKnownCartUpdateTimestamp]); // Removed cartToken, relies on cartTokenRef.current internally. Added setters.

  // Effect for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'wooCartLastUserUpdate' && event.newValue) {
        const newTimestampFromStorage = parseInt(event.newValue, 10);

        if (thisTabLastUpdateTimestampRef.current !== null && newTimestampFromStorage === thisTabLastUpdateTimestampRef.current) {
          return; 
        }

        setLastKnownCartUpdateTimestamp(newTimestampFromStorage);
        thisTabLastUpdateTimestampRef.current = newTimestampFromStorage;
        if (isTokenLoadAttempted) {
          fetchCartAndNonce(); // Re-fetch cart data
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isTokenLoadAttempted, fetchCartAndNonce]); // Only depends on fetchCartAndNonce (which is stable)

  const openSideCart = useCallback(() => {
    setIsSideCartOpen(true);
  }, []);

  const closeSideCart = useCallback(() => {
    setIsSideCartOpen(false);
  }, []);

  return (
    <CartContext.Provider value={{ 
      cart, 
      nonce, 
      cartToken, 
      isLoading, 
      error, 
      fetchCartAndNonce, 
      updateCartAndNonce, 
      callCartApi, 
      setIsLoading, 
      lastKnownCartUpdateTimestamp,
      isSideCartOpen,
      openSideCart,
      closeSideCart
    }}>
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