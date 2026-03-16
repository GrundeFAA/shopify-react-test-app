import type { ActionFunctionArgs } from "react-router";
import { handleCustomerWebhook } from "../server/modules/b2b/services/customer-webhook-handler.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  return handleCustomerWebhook(request);
};
