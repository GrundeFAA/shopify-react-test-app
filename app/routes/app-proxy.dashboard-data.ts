import type { LoaderFunctionArgs } from "react-router";
import { getAppProxyDashboardBaseData } from "../server/modules/b2b/services/app-proxy-dashboard.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const data = await getAppProxyDashboardBaseData(request);
    return Response.json(
      {
        ok: true as const,
        data,
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
        },
      },
    );
  } catch (error) {
    console.error("[app-proxy dashboard-data] Failed to load", {
      error,
      url: request.url,
    });
    const message =
      error instanceof Error
        ? error.message
        : "Kunne ikke laste dashboard-data.";
    return Response.json(
      {
        ok: false as const,
        error: message,
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, private",
        },
      },
    );
  }
};
