import { unauthenticated } from "../../../shopify.server";

type ShopifyCustomerSummary = {
  shopifyCustomerId: string;
  fullName: string | null;
  email: string | null;
};

function toCustomerGid(customerId: string): string {
  if (customerId.startsWith("gid://")) {
    return customerId;
  }
  return `gid://shopify/Customer/${customerId}`;
}

function fromCustomerGid(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1] ?? gid;
}

export const customerDirectoryService = {
  async getByIds(shop: string, customerIds: string[]): Promise<Map<string, ShopifyCustomerSummary>> {
    const uniqueIds = [...new Set(customerIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return new Map();
    }

    try {
      const { admin } = await unauthenticated.admin(shop);
      const response = await admin.graphql(
        `#graphql
        query CustomersByIds($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Customer {
              id
              firstName
              lastName
              email
              displayName
            }
          }
        }`,
        {
          variables: { ids: uniqueIds.map(toCustomerGid) },
        },
      );

      const payload = (await response.json()) as {
        data?: {
          nodes?: Array<{
            id?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            email?: string | null;
            displayName?: string | null;
          } | null>;
        };
      };

      const result = new Map<string, ShopifyCustomerSummary>();
      for (const node of payload.data?.nodes ?? []) {
        const gid = node?.id;
        if (!gid) continue;

        const customerId = fromCustomerGid(gid);
        const fullName =
          [node?.firstName, node?.lastName].filter(Boolean).join(" ").trim() ||
          node?.displayName ||
          null;

        result.set(customerId, {
          shopifyCustomerId: customerId,
          fullName,
          email: node?.email ?? null,
        });
      }

      return result;
    } catch (error) {
      console.error(`Failed Shopify customer lookup for ${shop}`, error);
      return new Map();
    }
  },
};
