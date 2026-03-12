import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context.server";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const customerContextProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.customerId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Customer context is required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      customerId: ctx.customerId,
    },
  });
});
