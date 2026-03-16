import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardPage } from "./pages/DashboardPage";
import { createTrpcClient, trpc } from "./trpc";

type StorefrontAppProps = {
  proxyBase: string;
};

export function StorefrontApp({ proxyBase }: StorefrontAppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  const [trpcClient] = useState(() => createTrpcClient(proxyBase));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
