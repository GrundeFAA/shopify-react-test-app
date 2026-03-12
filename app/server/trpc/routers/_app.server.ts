import { createTRPCRouter, publicProcedure } from "../init.server";
import { b2bRouter } from "./b2b.server";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({ ok: true })),
  b2b: b2bRouter,
});

export type AppRouter = typeof appRouter;
