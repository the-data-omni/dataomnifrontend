// // src/components/Providers.tsx

'use client';

import React, { useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined Providers component that includes React Query and MUI.
 * @param children The child components.
 */
export function ReactQueryProvider({ children }: ProvidersProps): React.JSX.Element {
  const [queryClient] = useState(() => new QueryClient());

  const theme = createTheme({
    // Customize your MUI theme here
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
