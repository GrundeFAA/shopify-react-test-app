import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { createTrpcContext } from "../server/trpc/context.server";
import { appRouter } from "../server/trpc/routers/_app.server";

function handleTrpcRequest(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTrpcContext({ request }),
  });
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return handleTrpcRequest(request);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return handleTrpcRequest(request);
};
