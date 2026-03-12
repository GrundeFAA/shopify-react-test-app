import type { PrismaClient } from "@prisma/client";

type CreateCompanyInput = {
  name: string;
  orgNumber?: string;
};

export const companyRepository = {
  async findByOrgNumber(db: PrismaClient, orgNumber: string) {
    return db.company.findUnique({ where: { orgNumber } });
  },

  async create(db: PrismaClient, input: CreateCompanyInput) {
    return db.company.create({
      data: {
        name: input.name,
        orgNumber: input.orgNumber,
      },
    });
  },

  async findOrCreateByOrgNumber(db: PrismaClient, input: CreateCompanyInput) {
    if (!input.orgNumber) {
      return this.create(db, input);
    }

    const existing = await this.findByOrgNumber(db, input.orgNumber);
    if (existing) {
      return existing;
    }

    try {
      return await this.create(db, input);
    } catch (error) {
      const knownError = error as { code?: string };
      if (knownError?.code === "P2002") {
        const company = await this.findByOrgNumber(db, input.orgNumber);
        if (company) {
          return company;
        }
      }

      throw error;
    }
  },
};
