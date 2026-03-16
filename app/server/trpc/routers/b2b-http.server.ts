import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { companyAddressRepository } from "../../modules/b2b/repositories/company-address.server";
import { addressSyncService } from "../../modules/b2b/services/address-sync.server";
import { dashboardService } from "../../modules/b2b/services/dashboard.server";
import { createTRPCRouter, customerShopContextProcedure } from "../init.server";
import {
  addressCreateSchema,
  addressUpdateSchema,
  getApprovedMembership,
} from "./shared/b2b-schemas";

const b2bProxyRouter = createTRPCRouter({
  getDashboardForContextCustomer: customerShopContextProcedure.query(
    async ({ ctx }) => {
      return dashboardService.getForCustomer(ctx.db, ctx.shop, ctx.customerId);
    },
  ),

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

      try {
        await addressSyncService.syncAddressForApprovedMembers(ctx.db, {
          shop: ctx.shop,
          companyId: membership.companyId,
          address,
        });
      } catch (syncError) {
        await companyAddressRepository.delete(ctx.db, address.id).catch(
          (deleteError) =>
            console.error("Failed to roll back address after sync failure", {
              addressId: address.id,
              deleteError,
            }),
        );
        throw syncError;
      }

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

export const b2bHttpRouter = createTRPCRouter({
  b2b: b2bProxyRouter,
});

export type B2BHttpRouter = typeof b2bHttpRouter;
