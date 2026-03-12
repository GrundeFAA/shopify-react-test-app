import type { PrismaClient } from "@prisma/client";
import { companyMemberRepository } from "../repositories/company-member.server";

export type B2BDashboardData =
  | {
      state: "PENDING_OR_MISSING";
      pendingCompanyName: string | null;
    }
  | {
      state: "APPROVED";
      company: {
        id: string;
        name: string;
        orgNumber: string | null;
      };
      members: Array<{
        id: string;
        shopifyCustomerId: string;
        role: string;
        status: string;
      }>;
    };

export const dashboardService = {
  async getForCustomer(
    db: PrismaClient,
    shop: string,
    shopifyCustomerId: string,
  ): Promise<B2BDashboardData> {
    const approvedMembership = await db.companyMember.findFirst({
      where: {
        shop,
        shopifyCustomerId,
        status: "APPROVED",
      },
      include: { company: true },
      orderBy: { createdAt: "asc" },
    });

    if (!approvedMembership) {
      const pendingMembership = await db.companyMember.findFirst({
        where: {
          shop,
          shopifyCustomerId,
          status: "PENDING",
        },
        include: { company: true },
        orderBy: { createdAt: "asc" },
      });

      return {
        state: "PENDING_OR_MISSING",
        pendingCompanyName: pendingMembership?.company.name ?? null,
      };
    }

    const members = (await companyMemberRepository.listByCompany(
      db,
      shop,
      approvedMembership.companyId,
    )) as Array<{
      id: string;
      shopifyCustomerId: string;
      role: string;
      status: string;
    }>;

    return {
      state: "APPROVED",
      company: {
        id: approvedMembership.company.id,
        name: approvedMembership.company.name,
        orgNumber: approvedMembership.company.orgNumber ?? null,
      },
      members: members.map((member) => ({
        id: member.id,
        shopifyCustomerId: member.shopifyCustomerId,
        role: member.role,
        status: member.status,
      })),
    };
  },
};
