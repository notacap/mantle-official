'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// The queryClientOptions define how React Query behaves
const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes - data will remain in cache for 30 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1, // Only retry failed requests once
    },
  },
};

export default function ReactQueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 