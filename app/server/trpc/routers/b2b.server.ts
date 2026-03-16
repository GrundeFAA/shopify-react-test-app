import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { customerSyncService } from "../../modules/b2b/services/customer-sync.server";
import { dashboardService } from "../../modules/b2b/services/dashboard.server";
import { companyAddressRepository } from "../../modules/b2b/repositories/company-address.server";
import { addressSyncService } from "../../modules/b2b/services/address-sync.server";
import {
  addressCreateSchema,
  addressUpdateSchema,
  getApprovedMembership,
} from "./shared/b2b-schemas";
import {
  customerShopContextProcedure,
  createTRPCRouter,
  shopContextProcedure,
} from "../init.server";

export const b2bRouter = createTRPCRouter({
  getDashboardForContextCustomer: customerShopContextProcedure.query(
    async ({ ctx }) => {
      return dashboardService.getForCustomer(ctx.db, ctx.shop, ctx.customerId);
    },
  ),

  syncCustomerWebhook: shopContextProcedure
    .input(z.object({ payload: z.unknown() }))
    .mutation(async ({ ctx, input }) => {
      return customerSyncService.syncFromShopifyWebhook(
        ctx.db,
        input.payload,
        ctx.shop,
      );
    }),

  getCompanyAddresses: customerShopContextProcedure.query(async ({ ctx }) => {
    const membership = await getApprovedMembership(
      ctx.db,
      ctx.shop,
      ctx.customerId,
    );
    return companyAddressRepository.findByCompany(ctx.db, membership.companyId);
  }),

  createCompanyAddress: customerShopContextProcedure
    .input(addressCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await getApprovedMembership(
        ctx.db,
        ctx.shop,
        ctx.customerId,
      );

      const address = await companyAddressRepository.create(ctx.db, {
        companyId: membership.companyId,
        type: input.type,
        label: input.label ?? null,
        isDefault: input.isDefault ?? false,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        company: input.company ?? null,
        address1: input.address1,
        address2: input.address2 ?? null,
        city: input.city,
        province: input.province ?? null,
        zip: input.zip,
        country: input.country,
        phone: input.phone ?? null,
      });

      await addressSyncService.syncAddressForApprovedMembers(ctx.db, {
        shop: ctx.shop,
        companyId: membership.companyId,
        address,
      });

      return address;
    }),

  updateCompanyAddress: customerShopContextProcedure
    .input(addressUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await getApprovedMembership(
        ctx.db,
        ctx.shop,
        ctx.customerId,
      );
      const existing = await companyAddressRepository.findById(
        ctx.db,
        input.id,
      );
      if (!existing || existing.companyId !== membership.companyId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      const updatedAddress = await companyAddressRepository.update(
        ctx.db,
        existing.id,
        {
          type: input.type,
          label: input.label,
          isDefault: input.isDefault,
          firstName: input.firstName,
          lastName: input.lastName,
          company: input.company,
          address1: input.address1,
          address2: input.address2,
          city: input.city,
          province: input.province,
          zip: input.zip,
          country: input.country,
          phone: input.phone,
        },
      );

      await addressSyncService.syncAddressForApprovedMembers(ctx.db, {
        shop: ctx.shop,
        companyId: membership.companyId,
        address: updatedAddress,
      });

      return updatedAddress;
    }),

  deleteCompanyAddress: customerShopContextProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const membership = await getApprovedMembership(
        ctx.db,
        ctx.shop,
        ctx.customerId,
      );
      const existing = await companyAddressRepository.findById(
        ctx.db,
        input.id,
      );
      if (!existing || existing.companyId !== membership.companyId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      await addressSyncService.deleteAddressFromApprovedMembers(ctx.db, {
        shop: ctx.shop,
        companyAddressId: existing.id,
      });

      await companyAddressRepository.delete(ctx.db, existing.id);
      return { ok: true as const };
    }),
});
