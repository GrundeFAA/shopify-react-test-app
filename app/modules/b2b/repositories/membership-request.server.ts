import type { PrismaClient } from "@prisma/client";

type EnsurePendingInput = {
  companyId: string;
  shopifyCustomerId: string;
  reason?: string;
};

export const membershipRequestRepository = {
  async ensurePending(db: PrismaClient, input: EnsurePendingInput) {
    const existing = await db.membershipRequest.findFirst({
      where: {
        companyId: input.companyId,
        shopifyCustomerId: input.shopifyCustomerId,
        status: "PENDING",
      },
    });

    if (existing) {
      return existing;
    }

    return db.membershipRequest.create({
      data: {
        companyId: input.companyId,
        shopifyCustomerId: input.shopifyCustomerId,
        status: "PENDING",
        reason: input.reason,
      },
    });
  },
};
