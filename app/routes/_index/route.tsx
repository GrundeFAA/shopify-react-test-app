import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
};

export default function App() {
  return (
    <main>
      <h1>Shopify app backend is running</h1>
      <p>
        Use the Shopify Admin app URL to open the embedded app, or call
        <code> /apps/rt-auth</code> from the storefront.
      </p>
    </main>
  );
}
