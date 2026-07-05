'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '../i18n/context';
import { SessionProvider } from '../context/SessionContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <I18nProvider>{children}</I18nProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
