import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { AppProxyDashboardPage } from "../frontend/pages/AppProxyDashboardPage";
import { authenticate } from "../server/shopify.server";
import { createTrpcCaller } from "../server/trpc/caller.server";

type DashboardLoaderData = {
  shop: string | null;
  customerId: string | null;
  membershipState: "PENDING_OR_MISSING" | "APPROVED" | null;
  companyName: string | null;
  orgNumber: string | null;
  customerName: string | null;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const shop = url.searchParams.get("shop");
  const customerFirstName = url.searchParams.get("logged_in_customer_first_name");
  const customerLastName = url.searchParams.get("logged_in_customer_last_name");
  const customerEmail = url.searchParams.get("logged_in_customer_email");
  const customerName =
    [customerFirstName, customerLastName].filter(Boolean).join(" ").trim() ||
    customerEmail ||
    null;
  const caller = createTrpcCaller({ request, shop, customerId });

  const dashboard = customerId ? await caller.b2b.getDashboardForContextCustomer() : null;
  const membershipState = dashboard?.state ?? null;
  const companyName =
    dashboard?.state === "APPROVED"
      ? dashboard.company.name
      : dashboard?.state === "PENDING_OR_MISSING"
        ? dashboard.pendingCompanyName
        : null;
  const orgNumber = dashboard?.state === "APPROVED" ? dashboard.company.orgNumber : null;

  return {
    shop,
    customerId,
    membershipState,
    companyName,
    orgNumber,
    customerName,
  };
};

export default function AppProxyDashboard() {
  const { shop, customerId, membershipState, companyName, orgNumber, customerName } =
    useLoaderData<typeof loader>();
  return (
    <AppProxyDashboardPage
      shop={shop}
      customerId={customerId}
      membershipState={membershipState}
      companyName={companyName}
      orgNumber={orgNumber}
      customerName={customerName}
    />
  );
}
