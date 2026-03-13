import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { AppProxyProvider } from "@shopify/shopify-app-react-router/react";
import { AppProxyDashboardPage } from "../frontend/pages/AppProxyDashboardPage";
import type { AccountTabId } from "../frontend/components/dashboard/AccountTabs";
import {
  getMockAppProxyDashboardData,
  shouldUseMockAppProxyDashboardData,
} from "../server/modules/b2b/mocks/app-proxy-dashboard.mock.server";
import { authenticate } from "../server/shopify.server";
import { createTrpcCaller } from "../server/trpc/caller.server";

const validTabs: AccountTabId[] = [
  "min-konto",
  "selskap",
  "brukere",
  "adresser",
  "ordrer",
];

function normalizeShopDomain(shop: string | null): string | null {
  if (!shop) return null;
  return shop.replace(/^https?:\/\//, "").trim();
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const shop = url.searchParams.get("shop");
  const customerFirstName = url.searchParams.get(
    "logged_in_customer_first_name",
  );
  const customerLastName = url.searchParams.get("logged_in_customer_last_name");
  const customerEmail = url.searchParams.get("logged_in_customer_email");
  const requestedTab = url.searchParams.get("tab");
  const activeTab: AccountTabId = validTabs.includes(
    requestedTab as AccountTabId,
  )
    ? (requestedTab as AccountTabId)
    : "brukere";
  const pathPrefix = url.searchParams.get("path_prefix") ?? "/apps/rt-auth";
  const tabsBasePath = `${pathPrefix}/dashboard`;
  const normalizedShop = normalizeShopDomain(shop);
  const storefrontTabsBaseUrl = normalizedShop
    ? `https://${normalizedShop}${tabsBasePath}`
    : tabsBasePath;
  const customerName =
    [customerFirstName, customerLastName].filter(Boolean).join(" ").trim() ||
    customerEmail ||
    null;

  let membershipState: "PENDING_OR_MISSING" | "APPROVED" | null = null;
  let companyName: string | null = null;
  let orgNumber: string | null = null;
  let companyMembers: Array<{
    id: string;
    shopifyCustomerId: string;
    fullName: string | null;
    email: string | null;
    role: string;
    status: string;
  }> = [];
  let resolvedCustomerName: string | null = customerName;

  if (shouldUseMockAppProxyDashboardData()) {
    const mock = getMockAppProxyDashboardData();
    membershipState = mock.membershipState;
    companyName = mock.companyName;
    orgNumber = mock.orgNumber;
    companyMembers = mock.companyMembers;
    resolvedCustomerName = customerName ?? mock.customerName;
  } else {
    const caller = createTrpcCaller({ request, shop, customerId });
    const dashboard =
      customerId && shop
        ? await caller.b2b.getDashboardForContextCustomer()
        : null;
    membershipState = dashboard?.state ?? null;
    companyName =
      dashboard?.state === "APPROVED"
        ? dashboard.company.name
        : dashboard?.state === "PENDING_OR_MISSING"
          ? dashboard.pendingCompanyName
          : null;
    orgNumber =
      dashboard?.state === "APPROVED" ? dashboard.company.orgNumber : null;
    companyMembers = dashboard?.state === "APPROVED" ? dashboard.members : [];
  }

  return Response.json(
    {
      appUrl: process.env.SHOPIFY_APP_URL ?? "",
      shop,
      customerId,
      membershipState,
      companyName,
      orgNumber,
      customerName: resolvedCustomerName,
      companyMembers,
      activeTab,
      storefrontTabsBaseUrl,
    },
    {
      headers: {
        "Cache-Control": "no-store, private",
      },
    },
  );
};

export default function AppProxyDashboard() {
  const {
    appUrl,
    companyName,
    orgNumber,
    customerName,
    companyMembers,
    activeTab,
    storefrontTabsBaseUrl,
  } = useLoaderData<typeof loader>();
  return (
    <AppProxyProvider appUrl={appUrl}>
      <AppProxyDashboardPage
        companyName={companyName}
        orgNumber={orgNumber}
        customerName={customerName}
        companyMembers={companyMembers}
        activeTab={activeTab}
        storefrontTabsBaseUrl={storefrontTabsBaseUrl}
      />
    </AppProxyProvider>
  );
}
