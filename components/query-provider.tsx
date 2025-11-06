// components/query-provider.tsx

'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: alwaysMakeNewQueryClient
    return makeQueryClient();
  } else {
    // Browser: makeQueryClientOnce
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: AvoidQueryClientProviderInApp duplicating newQueryClient()
  // across renders (see https://tanstack.com/query/v5/docs/react/ssr#react-query-client-provider)
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}