import { z } from "zod";
import { customerSyncService } from "../../modules/b2b/services/customer-sync.server";
import { dashboardService } from "../../modules/b2b/services/dashboard.server";
import {
  createTRPCRouter,
  customerContextProcedure,
  publicProcedure,
} from "../init.server";

export const b2bRouter = createTRPCRouter({
  getDashboardForCustomer: publicProcedure
    .input(z.object({ customerId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return dashboardService.getForCustomer(ctx.db, input.customerId);
    }),

  getDashboardForContextCustomer: customerContextProcedure.query(async ({ ctx }) => {
    return dashboardService.getForCustomer(ctx.db, ctx.customerId);
  }),

  syncCustomerWebhook: publicProcedure
    .input(z.object({ payload: z.unknown() }))
    .mutation(async ({ ctx, input }) => {
      return customerSyncService.syncFromShopifyWebhook(ctx.db, input.payload);
    }),
});
