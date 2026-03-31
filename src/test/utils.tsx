import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { ReactElement } from 'react';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

type RenderWithProvidersOptions = {
  queryClient?: QueryClient;
  route?: string;
  routePath?: string;
};

type RenderWithProvidersResult = RenderResult & {
  queryClient: QueryClient;
};

export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {},
): RenderWithProvidersResult {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const route = options.route ?? '/';

  const wrappedUi = options.routePath ? (
    <Routes>
      <Route path={options.routePath} element={ui} />
    </Routes>
  ) : (
    ui
  );

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{wrappedUi}</MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}
