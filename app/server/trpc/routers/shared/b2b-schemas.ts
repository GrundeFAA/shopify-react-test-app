import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

const addressTypeSchema = z.enum(["BILLING", "SHIPPING"]);

export const addressCreateSchema = z.object({
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

export const addressUpdateSchema = z.object({
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

export async function getApprovedMembership(
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
