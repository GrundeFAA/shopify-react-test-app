import type { LinksFunction } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";
import tailwindStylesUrl from "./frontend/styles/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStylesUrl },
];

export const loader = () => ({
  appUrl: process.env.SHOPIFY_APP_URL ?? "",
});

export default function App() {
  const { appUrl } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        {/*
          Place <base> before <Links /> so the browser resolves relative asset
          URLs (JS/CSS) against the app domain rather than the Shopify storefront
          domain when the page is served through an app proxy iframe.
        */}
        {appUrl && <base href={`${appUrl}/`} />}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
