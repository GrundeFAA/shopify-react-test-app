import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../server/shopify.server";

type ProxyAuthPayload = {
  ok: true;
  shop: string | null;
  loggedIn: boolean;
  customer: {
    id: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};

function buildPayload(request: Request): ProxyAuthPayload {
  const url = new URL(request.url);

  const customerId = url.searchParams.get("logged_in_customer_id");
  const customerEmail = url.searchParams.get("logged_in_customer_email");
  const customerFirstName = url.searchParams.get("logged_in_customer_first_name");
  const customerLastName = url.searchParams.get("logged_in_customer_last_name");

  return {
    ok: true,
    shop: url.searchParams.get("shop"),
    loggedIn: Boolean(customerId),
    customer: {
      id: customerId,
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
    },
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);

  return Response.json(buildPayload(request), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
};
