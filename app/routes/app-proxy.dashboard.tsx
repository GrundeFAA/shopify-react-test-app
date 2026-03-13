import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { AppProxyProvider } from "@shopify/shopify-app-react-router/react";
import { AppProxyDashboardPage } from "../frontend/pages/AppProxyDashboardPage";
import type { AccountTabId } from "../frontend/components/dashboard/AccountTabs";
import type { CompanyAddressRow } from "../frontend/components/dashboard/CompanyAddressesTable";
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

function toNullableString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toRequiredString(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toOptionalAddressInput(formData: FormData) {
  return {
    label: toNullableString(formData.get("label")),
    isDefault: formData.get("isDefault") === "on",
    firstName: toNullableString(formData.get("firstName")),
    lastName: toNullableString(formData.get("lastName")),
    company: toNullableString(formData.get("company")),
    address1: toRequiredString(formData.get("address1")),
    address2: toNullableString(formData.get("address2")),
    city: toRequiredString(formData.get("city")),
    province: toNullableString(formData.get("province")),
    zip: toRequiredString(formData.get("zip")),
    country: toRequiredString(formData.get("country")),
    phone: toNullableString(formData.get("phone")),
  };
}

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const shop = url.searchParams.get("shop");

  if (!customerId || !shop) {
    return Response.json({ ok: false, error: "Missing customer/shop context" }, { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");
  const caller = createTrpcCaller({ request, shop, customerId });

  const redirectToAddresses = () => {
    const redirectUrl = new URL(url.toString());
    redirectUrl.searchParams.set("tab", "adresser");
    redirectUrl.searchParams.delete("form");
    redirectUrl.searchParams.delete("addressId");
    return redirect(redirectUrl.toString());
  };

  if (intent === "create-address") {
    const typeValue = formData.get("type");
    if (typeValue !== "BILLING" && typeValue !== "SHIPPING") {
      return Response.json({ ok: false, error: "Invalid address type" }, { status: 400 });
    }

    await caller.b2b.createCompanyAddress({
      type: typeValue,
      ...toOptionalAddressInput(formData),
    });
    return redirectToAddresses();
  }

  if (intent === "update-address") {
    const id = toRequiredString(formData.get("id"));
    const typeValue = formData.get("type");
    if (!id || (typeValue !== "BILLING" && typeValue !== "SHIPPING")) {
      return Response.json({ ok: false, error: "Missing address id/type" }, { status: 400 });
    }

    await caller.b2b.updateCompanyAddress({
      id,
      type: typeValue,
      ...toOptionalAddressInput(formData),
    });
    return redirectToAddresses();
  }

  if (intent === "delete-address") {
    const id = toRequiredString(formData.get("id"));
    if (!id) {
      return Response.json({ ok: false, error: "Missing address id" }, { status: 400 });
    }

    await caller.b2b.deleteCompanyAddress({ id });
    return redirectToAddresses();
  }

  return Response.json({ ok: false, error: "Unknown intent" }, { status: 400 });
};

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
  const formMode = url.searchParams.get("form");
  const editingAddressId = url.searchParams.get("addressId");
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
  let addresses: CompanyAddressRow[] = [];
  let resolvedCustomerName: string | null = customerName;

  if (shouldUseMockAppProxyDashboardData()) {
    const mock = getMockAppProxyDashboardData();
    membershipState = mock.membershipState;
    companyName = mock.companyName;
    orgNumber = mock.orgNumber;
    companyMembers = mock.companyMembers;
    addresses = mock.addresses;
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
    addresses = dashboard?.state === "APPROVED" ? dashboard.addresses : [];
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
      addresses,
      formMode,
      editingAddressId,
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
    addresses,
    formMode,
    editingAddressId,
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
        addresses={addresses}
        formMode={formMode}
        editingAddressId={editingAddressId}
        activeTab={activeTab}
        storefrontTabsBaseUrl={storefrontTabsBaseUrl}
      />
    </AppProxyProvider>
  );
}
