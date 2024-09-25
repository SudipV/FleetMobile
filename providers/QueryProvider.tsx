import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import React, { Children } from 'react';

// Create a client
const queryClient = new QueryClient();

function QueryProvider({
  children
}) {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      {/* The rest of your application */}
      { children }
    </QueryClientProvider>
  );
}

export default QueryProvider;