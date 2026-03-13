import type { AddressType, PrismaClient } from "@prisma/client";

type CreateCompanyAddressInput = {
  companyId: string;
  type: AddressType;
  label?: string | null;
  isDefault?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  province?: string | null;
  zip: string;
  country: string;
  phone?: string | null;
};

type UpdateCompanyAddressInput = {
  type?: AddressType;
  label?: string | null;
  isDefault?: boolean;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string;
  address2?: string | null;
  city?: string;
  province?: string | null;
  zip?: string;
  country?: string;
  phone?: string | null;
};

export const companyAddressRepository = {
  async findByCompany(db: PrismaClient, companyId: string) {
    return db.companyAddress.findMany({
      where: { companyId },
      orderBy: [{ type: "asc" }, { isDefault: "desc" }, { createdAt: "asc" }],
    });
  },

  async findById(db: PrismaClient, id: string) {
    return db.companyAddress.findUnique({
      where: { id },
    });
  },

  async create(db: PrismaClient, input: CreateCompanyAddressInput) {
    return db.companyAddress.create({ data: input });
  },

  async update(db: PrismaClient, id: string, input: UpdateCompanyAddressInput) {
    return db.companyAddress.update({
      where: { id },
      data: input,
    });
  },

  async delete(db: PrismaClient, id: string) {
    return db.companyAddress.delete({
      where: { id },
    });
  },
};
