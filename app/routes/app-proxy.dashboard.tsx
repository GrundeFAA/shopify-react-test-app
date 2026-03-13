import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { AppProxyProvider } from "@shopify/shopify-app-react-router/react";
import { AppProxyDashboardPage } from "../frontend/pages/AppProxyDashboardPage";
import {
  AppProxyBadRequestError,
  buildStorefrontDashboardUrl,
  executeAddressMutation,
  getAppProxyDashboardViewModel,
} from "../server/modules/b2b/services/app-proxy-dashboard.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    await executeAddressMutation(request);
    return redirect(buildStorefrontDashboardUrl(request));
  } catch (error) {
    console.error("[app-proxy action] Unhandled error", { error, url: request.url });
    const actionError =
      error instanceof AppProxyBadRequestError || error instanceof Error
        ? error.message
        : "En ukjent feil oppstod. Prøv igjen.";
    return redirect(buildStorefrontDashboardUrl(request, { actionError }));
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const renderMode =
    process.env.STOREFRONT_DASHBOARD_RENDER_MODE === "theme-first"
      ? "theme-first"
      : "legacy-react";
  const viewModel = await getAppProxyDashboardViewModel(request);

  return Response.json(
    {
      ...viewModel,
      renderMode,
    },
    {
      headers: {
        "Cache-Control": "no-store, private",
      },
    },
  );
};

export default function AppProxyDashboard() {
  const data = useLoaderData<typeof loader>();
  const {
    appUrl,
    companyName,
    orgNumber,
    customerName,
    companyMembers,
    addresses,
    formMode,
    editingAddressId,
    actionError,
    activeTab,
    storefrontTabsBaseUrl,
    renderMode,
  } = data;

  if (renderMode === "theme-first") {
    const storefrontBase = storefrontTabsBaseUrl as string;
    const dashboardDataUrl = `${storefrontBase.replace(/\/dashboard$/, "")}/dashboard-data`;
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div
          id="b2b-theme-first-root"
          data-dashboard-url={dashboardDataUrl}
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        />
        <script src={`${appUrl}/theme-dashboard.js`} defer />
      </main>
    );
  }

  return (
    <AppProxyProvider appUrl={appUrl}>
      <AppProxyDashboardPage
        companyName={companyName}
        orgNumber={orgNumber}
        customerName={customerName}
        companyMembers={companyMembers}
        addresses={addresses}
        formMode={formMode}
        editingAddressId={editingAddressId}
        actionError={actionError}
        activeTab={activeTab}
        storefrontTabsBaseUrl={storefrontTabsBaseUrl}
      />
    </AppProxyProvider>
  );
}
