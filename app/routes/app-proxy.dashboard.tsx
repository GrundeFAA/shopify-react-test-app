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
      <h1>B2B Dashboard</h1>
      <p>Shop: {shop ?? "unknown"}</p>
      {customerId ? (
        <p>Customer ID: {customerId}</p>
      ) : (
        <p>No logged-in customer.</p>
      )}
    </main>
  );
}
