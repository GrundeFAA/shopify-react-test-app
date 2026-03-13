import {
  getMockAppProxyDashboardData,
  shouldUseMockAppProxyDashboardData,
} from "../mocks/app-proxy-dashboard.mock.server";
import { createTrpcCaller } from "../../../trpc/caller.server";
import { authenticate } from "../../../shopify.server";

const VALID_TABS = ["min-konto", "selskap", "brukere", "adresser", "ordrer"] as const;

export type AccountTabId = (typeof VALID_TABS)[number];

type DashboardContext = {
  shop: string | null;
  customerId: string | null;
  pathPrefix: string;
  storefrontTabsBaseUrl: string;
};

type DashboardBaseData = {
  appUrl: string;
  shop: string | null;
  customerId: string | null;
  membershipState: "PENDING_OR_MISSING" | "APPROVED" | null;
  companyName: string | null;
  orgNumber: string | null;
  customerName: string | null;
  companyMembers: Array<{
    id: string;
    shopifyCustomerId: string;
    fullName: string | null;
    email: string | null;
    role: string;
    status: string;
  }>;
  addresses: Array<{
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
  }>;
  storefrontTabsBaseUrl: string;
};

type DashboardUiState = {
  activeTab: AccountTabId;
  formMode: string | null;
  editingAddressId: string | null;
  actionError: string | null;
};

export type AppProxyDashboardViewModel = DashboardBaseData & DashboardUiState;

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

export class AppProxyBadRequestError extends Error {
  status = 400;
}

export async function requireAppProxyContext(request: Request): Promise<DashboardContext> {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const customerId = url.searchParams.get("logged_in_customer_id");
  const pathPrefix = url.searchParams.get("path_prefix") ?? "/apps/rt-auth";
  const normalizedShop = normalizeShopDomain(shop);
  const tabsBasePath = `${pathPrefix}/dashboard`;
  const storefrontTabsBaseUrl = normalizedShop
    ? `https://${normalizedShop}${tabsBasePath}`
    : tabsBasePath;

  return {
    shop,
    customerId,
    pathPrefix,
    storefrontTabsBaseUrl,
  };
}

export function getDashboardUiStateFromUrl(url: URL): DashboardUiState {
  const requestedTab = url.searchParams.get("tab");
  const activeTab: AccountTabId = VALID_TABS.includes(requestedTab as AccountTabId)
    ? (requestedTab as AccountTabId)
    : "brukere";

  return {
    activeTab,
    formMode: url.searchParams.get("form"),
    editingAddressId: url.searchParams.get("addressId"),
    actionError: url.searchParams.get("actionError"),
  };
}

export async function getAppProxyDashboardBaseData(
  request: Request,
  options: { allowMockData: boolean } = { allowMockData: true },
): Promise<DashboardBaseData> {
  const context = await requireAppProxyContext(request);
  const { customerId, shop, storefrontTabsBaseUrl } = context;
  let membershipState: "PENDING_OR_MISSING" | "APPROVED" | null = null;
  let companyName: string | null = null;
  let orgNumber: string | null = null;
  let companyMembers: DashboardBaseData["companyMembers"] = [];
  let addresses: DashboardBaseData["addresses"] = [];
  let resolvedCustomerName: string | null = null;

  if (options.allowMockData && shouldUseMockAppProxyDashboardData()) {
    const mock = getMockAppProxyDashboardData();
    membershipState = mock.membershipState;
    companyName = mock.companyName;
    orgNumber = mock.orgNumber;
    companyMembers = mock.companyMembers;
    addresses = mock.addresses;
    resolvedCustomerName = mock.customerName;
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
      dashboard?.state === "APPROVED"
        ? dashboard.company.orgNumber
        : null;
    companyMembers = dashboard?.state === "APPROVED" ? dashboard.members : [];
    addresses = dashboard?.state === "APPROVED" ? dashboard.addresses : [];
    resolvedCustomerName =
      dashboard?.currentCustomer?.fullName ??
      dashboard?.currentCustomer?.email ??
      null;
  }

  return {
    appUrl: process.env.SHOPIFY_APP_URL ?? "",
    shop,
    customerId,
    membershipState,
    companyName,
    orgNumber,
    customerName: resolvedCustomerName,
    companyMembers,
    addresses,
    storefrontTabsBaseUrl,
  };
}

export async function getAppProxyDashboardViewModel(
  request: Request,
  options: { allowMockData: boolean } = { allowMockData: true },
): Promise<AppProxyDashboardViewModel> {
  const base = await getAppProxyDashboardBaseData(request, options);
  const ui = getDashboardUiStateFromUrl(new URL(request.url));
  return {
    ...base,
    ...ui,
  };
}

export function buildStorefrontDashboardUrl(request: Request, extraParams?: Record<string, string>) {
  const url = new URL(request.url);
  const shop = normalizeShopDomain(url.searchParams.get("shop"));
  const pathPrefix = url.searchParams.get("path_prefix") ?? "/apps/rt-auth";
  const storefrontBase = shop
    ? `https://${shop}${pathPrefix}/dashboard`
    : `${pathPrefix}/dashboard`;

  const target = new URL(storefrontBase);
  target.searchParams.set("tab", "adresser");
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      target.searchParams.set(key, value);
    }
  }
  return target.toString();
}

export async function executeAddressMutation(
  request: Request,
  options?: { forcedAddressId?: string },
) {
  const context = await requireAppProxyContext(request);
  const { customerId, shop } = context;

  if (!customerId || !shop) {
    throw new AppProxyBadRequestError("Ikke innlogget eller manglende butikk-kontekst.");
  }

  const formData = await request.formData();
  const intentValue = formData.get("intent");
  const intent = typeof intentValue === "string" ? intentValue : "";
  const caller = createTrpcCaller({ request, shop, customerId });

  if (intent === "create-address") {
    const typeValue = formData.get("type");
    if (typeValue !== "BILLING" && typeValue !== "SHIPPING") {
      throw new AppProxyBadRequestError("Ugyldig adressetype.");
    }

    const address = await caller.b2b.createCompanyAddress({
      type: typeValue,
      ...toOptionalAddressInput(formData),
    });

    return { ok: true as const, intent, addressId: address.id };
  }

  if (intent === "update-address") {
    const id = options?.forcedAddressId ?? toRequiredString(formData.get("id"));
    const typeValue = formData.get("type");
    if (!id || (typeValue !== "BILLING" && typeValue !== "SHIPPING")) {
      throw new AppProxyBadRequestError("Manglende adresse-ID eller type.");
    }

    await caller.b2b.updateCompanyAddress({
      id,
      type: typeValue,
      ...toOptionalAddressInput(formData),
    });

    return { ok: true as const, intent, addressId: id };
  }

  if (intent === "delete-address") {
    const id = options?.forcedAddressId ?? toRequiredString(formData.get("id"));
    if (!id) {
      throw new AppProxyBadRequestError("Manglende adresse-ID.");
    }

    await caller.b2b.deleteCompanyAddress({ id });
    return { ok: true as const, intent, addressId: id };
  }

  throw new AppProxyBadRequestError("Ukjent handling.");
}
