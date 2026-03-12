import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { AppProxyDashboardPage } from "../frontend/pages/AppProxyDashboardPage";
import { authenticate } from "../server/shopify.server";
import { createTrpcCaller } from "../server/trpc/caller.server";

type DashboardLoaderData = {
  shop: string | null;
  customerId: string | null;
  membershipState: "PENDING_OR_MISSING" | "APPROVED" | null;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const shop = url.searchParams.get("shop");
  const caller = createTrpcCaller({ request, shop, customerId });

  const membershipState = customerId
    ? (await caller.b2b.getDashboardForContextCustomer()).state
    : null;

  return {
    shop,
    customerId,
    membershipState,
  };
};

export default function AppProxyDashboard() {
  const { shop, customerId, membershipState } = useLoaderData<typeof loader>();
  return (
    <AppProxyDashboardPage
      shop={shop}
      customerId={customerId}
      membershipState={membershipState}
    />
  );
}
