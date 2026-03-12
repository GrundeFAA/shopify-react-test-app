import { createTRPCRouter, publicProcedure } from "../init.server";
import { b2bRouter } from "./b2b.server";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({ ok: true })),
  b2b: b2bRouter,
});

// Public HTTP transport should expose only non-sensitive routes.
// Internal business procedures are invoked server-to-server via createCaller.
export const httpRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({ ok: true })),
});

export type AppRouter = typeof appRouter;
