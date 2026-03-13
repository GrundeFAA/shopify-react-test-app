import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { companyAddressRepository } from "../../modules/b2b/repositories/company-address.server";
import { addressSyncService } from "../../modules/b2b/services/address-sync.server";
import { dashboardService } from "../../modules/b2b/services/dashboard.server";
import { createTRPCRouter, customerShopContextProcedure } from "../init.server";

const addressTypeSchema = z.enum(["BILLING", "SHIPPING"]);

const addressCreateSchema = z.object({
  type: addressTypeSchema,
  label: z.string().trim().max(120).optional().nullable(),
  isDefault: z.boolean().optional(),
  firstName: z.string().trim().max(120).optional().nullable(),
  lastName: z.string().trim().max(120).optional().nullable(),
  company: z.string().trim().max(255).optional().nullable(),
  address1: z.string().trim().min(1).max(255),
  address2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(1).max(120),
  province: z.string().trim().max(120).optional().nullable(),
  zip: z.string().trim().min(1).max(32),
  country: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(64).optional().nullable(),
});

const addressUpdateSchema = z.object({
  id: z.string().min(1),
  type: addressTypeSchema.optional(),
  label: z.string().trim().max(120).optional().nullable(),
  isDefault: z.boolean().optional(),
  firstName: z.string().trim().max(120).optional().nullable(),
  lastName: z.string().trim().max(120).optional().nullable(),
  company: z.string().trim().max(255).optional().nullable(),
  address1: z.string().trim().min(1).max(255).optional(),
  address2: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(1).max(120).optional(),
  province: z.string().trim().max(120).optional().nullable(),
  zip: z.string().trim().min(1).max(32).optional(),
  country: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(64).optional().nullable(),
});

async function getApprovedMembership(
  db: PrismaClient,
  shop: string,
  shopifyCustomerId: string,
) {
  const membership = await db.companyMember.findFirst({
    where: {
      shop,
      shopifyCustomerId,
      status: "APPROVED",
    },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Approved membership is required",
    });
  }

  return membership;
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

export const b2bHttpRouter = createTRPCRouter({
  b2b: b2bProxyRouter,
});

export type B2BHttpRouter = typeof b2bHttpRouter;
