import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { createTrpcContext } from "../server/trpc/context.server";
import { authenticate } from "../server/shopify.server";
import { b2bHttpRouter } from "../server/trpc/routers/b2b-http.server";

async function handleAppProxyTrpcRequest(request: Request) {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") ?? request.headers.get("x-shopify-shop-domain");
  const customerId = url.searchParams.get("logged_in_customer_id");

  if (!shop || !customerId) {
    return Response.json(
      { ok: false, error: "Customer and shop context are required." },
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
