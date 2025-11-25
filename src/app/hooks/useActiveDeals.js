"use client";

import { useState, useEffect } from 'react';

/**
 * Hook for fetching currently active BOGO deals
 * Useful for promotional banners and product badges
 */
export function useActiveDeals() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // Use internal API proxy route
        const response = await fetch('/api/bogo/deals');

        if (!response.ok) {
          throw new Error(`Failed to fetch deals: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setDeals(data.deals);
        }
      } catch (err) {
        console.error('Error fetching active deals:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return { deals, isLoading, error };
}
