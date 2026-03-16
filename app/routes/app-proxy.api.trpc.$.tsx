import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { createTrpcContext } from "../server/trpc/context.server";
import { authenticate } from "../server/shopify.server";
import { b2bHttpRouter } from "../server/trpc/routers/b2b-http.server";

async function handleAppProxyTrpcRequest(request: Request) {
  const url = new URL(request.url);
  const queryKeys = [...new Set(url.searchParams.keys())];
  const debugContext = {
    path: url.pathname,
    queryKeys,
    hasSignature: url.searchParams.has("signature"),
    hasHmac: url.searchParams.has("hmac"),
    hasShop: url.searchParams.has("shop"),
    hasLoggedInCustomerId: url.searchParams.has("logged_in_customer_id"),
  };

  try {
    await authenticate.public.appProxy(request);
  } catch (error) {
    console.error("App proxy authentication failed for tRPC request", {
      ...debugContext,
      error,
    });

    return Response.json(
      {
        ok: false,
        error: "app_proxy_auth_failed",
        message: error instanceof Error ? error.message : "Unknown auth error",
        debug: debugContext,
      },
      { status: 400 },
    );
  }

  const shop = url.searchParams.get("shop") ?? request.headers.get("x-shopify-shop-domain");
  const customerId = url.searchParams.get("logged_in_customer_id");

  if (!shop || !customerId) {
    return Response.json(
      {
        ok: false,
        error: "missing_proxy_context",
        message: "Customer and shop context are required.",
        debug: {
          ...debugContext,
          resolvedShop: shop,
          resolvedCustomerId: customerId,
        },
      },
      { status: 401 },
    );
  }

  return fetchRequestHandler({
    endpoint: "/app-proxy/api/trpc",
    req: request,
    router: b2bHttpRouter,
    createContext: () => createTrpcContext({ request, shop, customerId }),
  });
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return handleAppProxyTrpcRequest(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return handleAppProxyTrpcRequest(request);
};
