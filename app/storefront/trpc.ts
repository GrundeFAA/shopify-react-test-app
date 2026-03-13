import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { B2BHttpRouter } from "../server/trpc/routers/b2b-http.server";

export const trpc = createTRPCReact<B2BHttpRouter>();

function toProxyApiUrl(proxyBase: string) {
  const normalizedProxyBase = proxyBase.replace(/\/+$/, "");
  return `${window.location.origin}${normalizedProxyBase}/api/trpc`;
}

export function createTrpcClient(proxyBase: string) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: toProxyApiUrl(proxyBase),
        transformer: superjson,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "same-origin",
          });
        },
      }),
    ],
  });
}
