import type { PrismaClient } from "@prisma/client";

type CreateMemberInput = {
  companyId: string;
  shopifyCustomerId: string;
  role: "ADMIN" | "USER";
  status: "PENDING" | "APPROVED" | "DENIED";
};

export const companyMemberRepository = {
  async findAnyByCustomer(db: PrismaClient, shopifyCustomerId: string) {
    return db.companyMember.findFirst({
      where: { shopifyCustomerId },
      include: { company: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async findByCompanyAndCustomer(
    db: PrismaClient,
    companyId: string,
    shopifyCustomerId: string,
  ) {
    return db.companyMember.findUnique({
      where: {
        companyId_shopifyCustomerId: { companyId, shopifyCustomerId },
      },
    });
  },

  async create(db: PrismaClient, input: CreateMemberInput) {
    return db.companyMember.create({ data: input });
  },

  async countApprovedByCompany(db: PrismaClient, companyId: string) {
    return db.companyMember.count({
      where: { companyId, status: "APPROVED" },
    });
  },

  async listByCompany(db: PrismaClient, companyId: string) {
    return db.companyMember.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
    });
  },
};
