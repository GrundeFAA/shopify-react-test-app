import type { PrismaClient } from "@prisma/client";

type CreateMemberInput = {
  shop: string;
  companyId: string;
  shopifyCustomerId: string;
  role: "ADMIN" | "USER";
  status: "PENDING" | "APPROVED" | "DENIED";
};

export const companyMemberRepository = {
  async findAnyByCustomer(db: PrismaClient, shop: string, shopifyCustomerId: string) {
    return db.companyMember.findFirst({
      where: { shop, shopifyCustomerId },
      include: { company: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async create(db: PrismaClient, input: CreateMemberInput) {
    return db.companyMember.create({ data: input });
  },

  async updateRoleAndStatus(
    db: PrismaClient,
    id: string,
    input: { role: "ADMIN" | "USER"; status: "PENDING" | "APPROVED" | "DENIED" },
  ) {
    return db.companyMember.update({
      where: { id },
      data: {
        role: input.role,
        status: input.status,
      },
    });
  },

  async countApprovedByCompany(db: PrismaClient, shop: string, companyId: string) {
    return db.companyMember.count({
      where: { shop, companyId, status: "APPROVED" },
    });
  },

  async listByCompany(db: PrismaClient, shop: string, companyId: string) {
    return db.companyMember.findMany({
      where: { shop, companyId },
      orderBy: { createdAt: "asc" },
    });
  },
};
