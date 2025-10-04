// src/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // keep data "fresh" for 5 minutes (no automatic refetch while fresh)
      staleTime: 1000 * 60 * 5,
      // don't refetch when window/tab regains focus (optional)
      refetchOnWindowFocus: false,
      // don't refetch on mount if data is fresh in cache
      refetchOnMount: false,
      // don't refetch on reconnect automatically
      refetchOnReconnect: false,
    },
  },
});
