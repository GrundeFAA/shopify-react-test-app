import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { StyleBaselinePage } from "./pages/StyleBaselinePage";
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
        <StyleBaselinePage />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
