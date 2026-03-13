import type { PrismaClient } from "@prisma/client";
import { companyMemberRepository } from "../repositories/company-member.server";
import { customerDirectoryService } from "../../shopify/services/customer-directory.server";

export type CompanyAddressView = {
  id: string;
  type: "BILLING" | "SHIPPING";
  label: string | null;
  isDefault: boolean;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string | null;
  zip: string;
  country: string;
  phone: string | null;
};

// Identity of any customer resolved from the Shopify Admin API.
// Used to enrich local member records and identify the logged-in user.
export type CustomerIdentity = {
  shopifyCustomerId: string;
  fullName: string | null;
  email: string | null;
};

export type B2BDashboardData =
  | {
      state: "PENDING_OR_MISSING";
      pendingCompanyName: string | null;
      currentCustomer: CustomerIdentity | null;
    }
  | {
      state: "APPROVED";
      currentCustomer: CustomerIdentity | null;
      company: {
        id: string;
        name: string;
        orgNumber: string | null;
      };
      members: Array<{
        id: string;
        shopifyCustomerId: string;
        fullName: string | null;
        email: string | null;
        role: string;
        status: string;
      }>;
      addresses: CompanyAddressView[];
    };

function toCustomerIdentity(
  shopifyCustomerId: string,
  detailsMap: Awaited<ReturnType<typeof customerDirectoryService.getByIds>>,
): CustomerIdentity {
  const detail = detailsMap.get(shopifyCustomerId);
  return {
    shopifyCustomerId,
    fullName: detail?.fullName ?? null,
    email: detail?.email ?? null,
  };
}

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
      const [pendingMembership, customerDetailsById] = await Promise.all([
        db.companyMember.findFirst({
          where: { shop, shopifyCustomerId, status: "PENDING" },
          include: { company: true },
          orderBy: { createdAt: "asc" },
        }),
        customerDirectoryService.getByIds(shop, [shopifyCustomerId]),
      ]);

      return {
        state: "PENDING_OR_MISSING",
        pendingCompanyName: pendingMembership?.company.name ?? null,
        currentCustomer: toCustomerIdentity(shopifyCustomerId, customerDetailsById),
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

    const [customerDetailsById, addresses] = await Promise.all([
      customerDirectoryService.getByIds(
        shop,
        members.map((member) => member.shopifyCustomerId),
      ),
      db.companyAddress.findMany({
        where: { companyId: approvedMembership.companyId },
        orderBy: [{ type: "asc" }, { isDefault: "desc" }, { createdAt: "asc" }],
      }),
    ]);

    return {
      state: "APPROVED",
      currentCustomer: toCustomerIdentity(shopifyCustomerId, customerDetailsById),
      company: {
        id: approvedMembership.company.id,
        name: approvedMembership.company.name,
        orgNumber: approvedMembership.company.orgNumber ?? null,
      },
      members: members.map((member) => ({
        id: member.id,
        shopifyCustomerId: member.shopifyCustomerId,
        fullName: customerDetailsById.get(member.shopifyCustomerId)?.fullName ?? null,
        email: customerDetailsById.get(member.shopifyCustomerId)?.email ?? null,
        role: member.role,
        status: member.status,
      })),
      addresses: addresses.map((address) => ({
        id: address.id,
        type: address.type,
        label: address.label ?? null,
        isDefault: address.isDefault,
        firstName: address.firstName ?? null,
        lastName: address.lastName ?? null,
        company: address.company ?? null,
        address1: address.address1,
        address2: address.address2 ?? null,
        city: address.city,
        province: address.province ?? null,
        zip: address.zip,
        country: address.country,
        phone: address.phone ?? null,
      })),
    };
  },
};
