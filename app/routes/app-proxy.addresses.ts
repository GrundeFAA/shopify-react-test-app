import type { ActionFunctionArgs } from "react-router";
import {
  AppProxyBadRequestError,
  executeAddressMutation,
} from "../server/modules/b2b/services/app-proxy-dashboard.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const result = await executeAddressMutation(request);
    return Response.json(
      {
        ok: true as const,
        intent: result.intent,
        addressId: result.addressId,
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof AppProxyBadRequestError || error instanceof Error
        ? error.message
        : "En ukjent feil oppstod.";

    console.error("[app-proxy addresses] Mutation failed", {
      error,
      message,
      url: request.url,
    });

    return Response.json(
      {
        ok: false as const,
        error: message,
      },
      {
        status: error instanceof AppProxyBadRequestError ? error.status : 400,
        headers: {
          "Cache-Control": "no-store, private",
        },
      },
    );
  }
};
