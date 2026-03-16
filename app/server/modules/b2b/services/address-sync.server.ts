import type { CompanyAddress, PrismaClient } from "@prisma/client";
import { unauthenticated } from "../../../shopify.server";

type SyncAddressInput = {
  shop: string;
  companyId: string;
  address: CompanyAddress;
};

type DeleteAddressInput = {
  shop: string;
  companyAddressId: string;
};

function toCustomerGid(customerId: string): string {
  if (customerId.startsWith("gid://")) return customerId;
  return `gid://shopify/Customer/${customerId}`;
}

function toMailingAddressInput(address: CompanyAddress) {
  return {
    firstName: address.firstName ?? undefined,
    lastName: address.lastName ?? undefined,
    company: address.company ?? undefined,
    address1: address.address1,
    address2: address.address2 ?? undefined,
    city: address.city,
    province: address.province ?? undefined,
    zip: address.zip,
    country: address.country,
    phone: address.phone ?? undefined,
  };
}

function toFirstGraphqlErrorMessage(payload: {
  errors?: Array<{ message?: string | null } | null>;
}): string | null {
  return payload.errors?.find((error) => error?.message)?.message ?? null;
}

async function createCustomerAddress(
  shop: string,
  shopifyCustomerId: string,
  address: CompanyAddress,
): Promise<string> {
  const { admin } = await unauthenticated.admin(shop);
  const response = await admin.graphql(
    `#graphql
    mutation CustomerAddressCreate($customerId: ID!, $address: MailingAddressInput!, $setAsDefault: Boolean) {
      customerAddressCreate(customerId: $customerId, address: $address, setAsDefault: $setAsDefault) {
        address {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        customerId: toCustomerGid(shopifyCustomerId),
        address: toMailingAddressInput(address),
        setAsDefault: address.isDefault,
      },
    },
  );

  const payload = (await response.json()) as {
    errors?: Array<{ message?: string | null } | null>;
    data?: {
      customerAddressCreate?: {
        address?: { id?: string | null } | null;
        userErrors?: Array<{ message?: string | null } | null> | null;
      } | null;
    };
  };

  const graphqlError = toFirstGraphqlErrorMessage(payload);
  if (graphqlError) {
    throw new Error(graphqlError);
  }

  const userErrors = payload.data?.customerAddressCreate?.userErrors ?? [];
  const firstError = userErrors.find((error) => error?.message)?.message;
  if (firstError) {
    throw new Error(firstError);
  }

  const id = payload.data?.customerAddressCreate?.address?.id;
  if (!id) {
    throw new Error("Shopify did not return customerAddress.id");
  }

  return id;
}

async function updateCustomerAddress(
  shop: string,
  shopifyCustomerId: string,
  shopifyAddressId: string,
  address: CompanyAddress,
) {
  const { admin } = await unauthenticated.admin(shop);
  const response = await admin.graphql(
    `#graphql
    mutation CustomerAddressUpdate($customerId: ID!, $addressId: ID!, $address: MailingAddressInput!, $setAsDefault: Boolean) {
      customerAddressUpdate(customerId: $customerId, addressId: $addressId, address: $address, setAsDefault: $setAsDefault) {
        address {
          id
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        customerId: toCustomerGid(shopifyCustomerId),
        addressId: shopifyAddressId,
        address: toMailingAddressInput(address),
        setAsDefault: address.isDefault,
      },
    },
  );

  const payload = (await response.json()) as {
    errors?: Array<{ message?: string | null } | null>;
    data?: {
      customerAddressUpdate?: {
        address?: { id?: string | null } | null;
        userErrors?: Array<{ message?: string | null } | null> | null;
      } | null;
    };
  };

  const graphqlError = toFirstGraphqlErrorMessage(payload);
  if (graphqlError) {
    throw new Error(graphqlError);
  }

  const userErrors = payload.data?.customerAddressUpdate?.userErrors ?? [];
  const firstError = userErrors.find((error) => error?.message)?.message;
  if (firstError) {
    throw new Error(firstError);
  }
}

async function deleteCustomerAddress(
  shop: string,
  shopifyCustomerId: string,
  shopifyAddressId: string,
) {
  const { admin } = await unauthenticated.admin(shop);
  const response = await admin.graphql(
    `#graphql
    mutation CustomerAddressDelete($customerId: ID!, $addressId: ID!) {
      customerAddressDelete(customerId: $customerId, addressId: $addressId) {
        deletedAddressId
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        customerId: toCustomerGid(shopifyCustomerId),
        addressId: shopifyAddressId,
      },
    },
  );

  const payload = (await response.json()) as {
    errors?: Array<{ message?: string | null } | null>;
    data?: {
      customerAddressDelete?: {
        userErrors?: Array<{ message?: string | null } | null> | null;
      } | null;
    };
  };

  const graphqlError = toFirstGraphqlErrorMessage(payload);
  if (graphqlError) {
    throw new Error(graphqlError);
  }

  const userErrors = payload.data?.customerAddressDelete?.userErrors ?? [];
  const firstError = userErrors.find((error) => error?.message)?.message;
  if (firstError) {
    throw new Error(firstError);
  }
}

async function getApprovedMemberCustomerIds(
  db: PrismaClient,
  shop: string,
  companyId: string,
): Promise<string[]> {
  const members = await db.companyMember.findMany({
    where: { shop, companyId, status: "APPROVED" },
    select: { shopifyCustomerId: true },
  });

  return members.map((member) => member.shopifyCustomerId);
}

async function upsertAddressForMember(
  db: PrismaClient,
  input: { shop: string; address: CompanyAddress; shopifyCustomerId: string },
) {
  const existingMapping = await db.companyAddressMember.findUnique({
    where: {
      companyAddressId_shopifyCustomerId: {
        companyAddressId: input.address.id,
        shopifyCustomerId: input.shopifyCustomerId,
      },
    },
  });

  if (existingMapping) {
    await updateCustomerAddress(
      input.shop,
      input.shopifyCustomerId,
      existingMapping.shopifyAddressId,
      input.address,
    );
    return;
  }

  const shopifyAddressId = await createCustomerAddress(
    input.shop,
    input.shopifyCustomerId,
    input.address,
  );

  await db.companyAddressMember.create({
    data: {
      companyAddressId: input.address.id,
      shopifyCustomerId: input.shopifyCustomerId,
      shopifyAddressId,
    },
  });
}

export const addressSyncService = {
  async syncAddressForApprovedMembers(db: PrismaClient, input: SyncAddressInput) {
    const memberCustomerIds = await getApprovedMemberCustomerIds(
      db,
      input.shop,
      input.companyId,
    );

    for (const shopifyCustomerId of memberCustomerIds) {
      await upsertAddressForMember(db, {
        shop: input.shop,
        address: input.address,
        shopifyCustomerId,
      });
    }
  },

  async syncAllCompanyAddressesToMember(
    db: PrismaClient,
    input: { shop: string; companyId: string; shopifyCustomerId: string },
  ) {
    const addresses = await db.companyAddress.findMany({
      where: { companyId: input.companyId },
      orderBy: [{ type: "asc" }, { isDefault: "desc" }, { createdAt: "asc" }],
    });

    for (const address of addresses) {
      await upsertAddressForMember(db, {
        shop: input.shop,
        address,
        shopifyCustomerId: input.shopifyCustomerId,
      });
    }
  },

  async deleteAddressFromApprovedMembers(db: PrismaClient, input: DeleteAddressInput) {
    const mappings = await db.companyAddressMember.findMany({
      where: { companyAddressId: input.companyAddressId },
    });

    for (const mapping of mappings) {
      try {
        await deleteCustomerAddress(
          input.shop,
          mapping.shopifyCustomerId,
          mapping.shopifyAddressId,
        );
      } catch (error) {
        console.error("Failed deleting mapped Shopify address", {
          companyAddressId: input.companyAddressId,
          shopifyCustomerId: mapping.shopifyCustomerId,
          shopifyAddressId: mapping.shopifyAddressId,
          error,
        });
      }
    }
  },
};
