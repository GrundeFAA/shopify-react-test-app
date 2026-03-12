import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

type DashboardLoaderData = {
  shop: string | null;
  customerId: string | null;
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<DashboardLoaderData> => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const shop = url.searchParams.get("shop");

  return {
    shop,
    customerId,
  };
};

export default function AppProxyDashboard() {
  const { shop, customerId } = useLoaderData<typeof loader>();

  return (
    <main>
      <h1>RT B2B Dashboard (React)</h1>
      <p data-react-marker="true">React route is active in this iframe.</p>
      <p>This page is rendered by the app route `app-proxy.dashboard.tsx`.</p>
      <p>Shop domain: {shop ?? "unknown"}</p>
      {customerId ? (
        <>
          <p>Customer is logged in.</p>
          <p>Logged-in customer ID: {customerId}</p>
        </>
      ) : (
        <p>No logged-in customer was provided by Shopify proxy.</p>
      )}
      <p>Next step: replace this with the full dashboard UI sections.</p>
    </main>
  );
}
