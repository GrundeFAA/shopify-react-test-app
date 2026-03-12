import { z } from "zod";
import { customerSyncService } from "../../modules/b2b/services/customer-sync.server";
import { dashboardService } from "../../modules/b2b/services/dashboard.server";
import {
  customerShopContextProcedure,
  createTRPCRouter,
  publicProcedure,
  shopContextProcedure,
} from "../init.server";

export const b2bRouter = createTRPCRouter({
  getDashboardForCustomer: publicProcedure
    .input(z.object({ shop: z.string().min(1), customerId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return dashboardService.getForCustomer(ctx.db, input.shop, input.customerId);
    }),

  getDashboardForContextCustomer: customerShopContextProcedure.query(async ({ ctx }) => {
    return dashboardService.getForCustomer(ctx.db, ctx.shop, ctx.customerId);
  }),

  syncCustomerWebhook: shopContextProcedure
    .input(z.object({ payload: z.unknown() }))
    .mutation(async ({ ctx, input }) => {
      return customerSyncService.syncFromShopifyWebhook(ctx.db, input.payload, ctx.shop);
    }),
});
