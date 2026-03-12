import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { dashboardContextToken } from "../modules/b2b/services/dashboard-context-token.server";
import { authenticate } from "../shopify.server";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const shop = url.searchParams.get("shop");

  if (!customerId) {
    const token = dashboardContextToken.create({
      customerId: null,
      shop,
      ttlSeconds: 30,
    });
    throw redirect(`/b2b-dashboard?token=${encodeURIComponent(token)}`);
  }

  const token = dashboardContextToken.create({
    customerId,
    shop,
  });

  throw redirect(`/b2b-dashboard?token=${encodeURIComponent(token)}`);
};
