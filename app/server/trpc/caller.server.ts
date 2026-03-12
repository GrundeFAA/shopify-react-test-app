import { appRouter } from "./routers/_app.server";
import { createTrpcContext } from "./context.server";

type CreateTrpcCallerOptions = {
  request: Request;
  shop?: string | null;
  customerId?: string | null;
};

export function createTrpcCaller(options: CreateTrpcCallerOptions) {
  const ctx = createTrpcContext(options);
  return appRouter.createCaller(ctx);
}
