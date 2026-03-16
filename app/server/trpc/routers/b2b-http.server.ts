import { TRPCError } from "@trpc/server";
import type { CompanyAddress } from "@prisma/client";
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

function toAddressSnapshot(address: CompanyAddress) {
  return {
    type: address.type,
    label: address.label,
    isDefault: address.isDefault,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    address1: address.address1,
    address2: address.address2,
    city: address.city,
    province: address.province,
    zip: address.zip,
    country: address.country,
    phone: address.phone,
  };
}

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

      const shouldSetDefault = input.isDefault ?? false;
      const previousDefaultIds = shouldSetDefault
        ? (
            await ctx.db.companyAddress.findMany({
              where: { companyId: membership.companyId, isDefault: true },
              select: { id: true },
            })
          ).map((address) => address.id)
        : [];

      const address = await ctx.db.$transaction(async (tx) => {
        if (shouldSetDefault) {
          await tx.companyAddress.updateMany({
            where: { companyId: membership.companyId, isDefault: true },
            data: { isDefault: false },
          });
        }

        return tx.companyAddress.create({
          data: {
            companyId: membership.companyId,
            type: input.type,
            label: input.label ?? null,
            isDefault: shouldSetDefault,
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
          },
        });
      });

      try {
        await addressSyncService.syncAddressForApprovedMembers(ctx.db, {
          shop: ctx.shop,
          companyId: membership.companyId,
          address,
        });
      } catch (syncError) {
        await ctx.db
          .$transaction(async (tx) => {
            await tx.companyAddress.delete({ where: { id: address.id } });
            if (previousDefaultIds.length > 0) {
              await tx.companyAddress.updateMany({
                where: { id: { in: previousDefaultIds } },
                data: { isDefault: true },
              });
            }
          })
          .catch((rollbackError) =>
            console.error("Failed to roll back address after sync failure", {
              addressId: address.id,
              rollbackError,
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

      const normalizedIsDefault =
        input.isDefault === false && existing.isDefault
          ? true
          : (input.isDefault ?? existing.isDefault);
      const shouldSetDefault = normalizedIsDefault;
      const previousDefaultIds = shouldSetDefault
        ? (
            await ctx.db.companyAddress.findMany({
              where: {
                companyId: membership.companyId,
                isDefault: true,
                id: { not: existing.id },
              },
              select: { id: true },
            })
          ).map((address) => address.id)
        : [];

      const updatedAddress = await ctx.db.$transaction(async (tx) => {
        if (shouldSetDefault) {
          await tx.companyAddress.updateMany({
            where: {
              companyId: membership.companyId,
              isDefault: true,
              id: { not: existing.id },
            },
            data: { isDefault: false },
          });
        }

        return tx.companyAddress.update({
          where: { id: existing.id },
          data: {
            type: input.type,
            label: input.label,
            isDefault: normalizedIsDefault,
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
        });
      });

      try {
        await addressSyncService.syncAddressForApprovedMembers(ctx.db, {
          shop: ctx.shop,
          companyId: membership.companyId,
          address: updatedAddress,
        });
      } catch (syncError) {
        await ctx.db
          .$transaction(async (tx) => {
            await tx.companyAddress.update({
              where: { id: existing.id },
              data: toAddressSnapshot(existing),
            });
            if (previousDefaultIds.length > 0) {
              await tx.companyAddress.updateMany({
                where: { id: { in: previousDefaultIds } },
                data: { isDefault: true },
              });
            }
          })
          .catch((rollbackError) =>
            console.error("Failed to roll back updated address after sync failure", {
              addressId: existing.id,
              rollbackError,
            }),
          );
        throw syncError;
      }

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
