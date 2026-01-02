import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UIProvider } from '@/shared/contexts/ui-context';
import { AppProvider } from '@/shared/contexts/app-context';
import MainApp from '@/mainapp';
import '@/assets/styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UIProvider>
          <AppProvider>
            <MainApp />
          </AppProvider>
        </UIProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
