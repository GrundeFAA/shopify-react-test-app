import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "../server/shopify.server";

function normalizeShopDomain(shop: string | null): string | null {
  if (!shop) return null;
  return shop.replace(/^https?:\/\//, "").trim();
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const customerId = url.searchParams.get("logged_in_customer_id");
  const shop = url.searchParams.get("shop");
  const pathPrefix = url.searchParams.get("path_prefix") ?? "/apps/rt-auth";
  const normalizedShop = normalizeShopDomain(shop);
  const appUrl = (process.env.SHOPIFY_APP_URL ?? "").replace(/\/+$/, "");
  const storefrontLoginUrl = normalizedShop
    ? `https://${normalizedShop}/account/login`
    : "/account/login";

  return Response.json(
    {
      customerId,
      proxyBase: pathPrefix,
      storefrontLoginUrl,
      storefrontScriptUrl: `${appUrl}/storefront.js`,
      storefrontStyleUrl: `${appUrl}/storefront.css`,
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
    customerId,
    proxyBase,
    storefrontLoginUrl,
    storefrontScriptUrl,
    storefrontStyleUrl,
  } = useLoaderData<typeof loader>();

  if (!customerId) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <a href={storefrontLoginUrl} className="text-indigo-600 hover:text-indigo-800">
          Logg inn for å se din konto
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div
        id="rt-b2b-root"
        data-proxy-base={proxyBase}
        data-customer-id={customerId}
        data-storefront-style-url={storefrontStyleUrl}
      />
      <script src={storefrontScriptUrl} defer />
    </main>
  );
}
