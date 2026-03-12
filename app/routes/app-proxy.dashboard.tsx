import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const shop = url.searchParams.get("shop");

  const html = customerId
    ? `<h1>B2B Dashboard</h1><p>Shop: ${shop ?? "unknown"}</p><p>Customer ID: ${customerId}</p>`
    : `<h1>B2B Dashboard</h1><p>Shop: ${shop ?? "unknown"}</p><p>No logged-in customer.</p>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
};
