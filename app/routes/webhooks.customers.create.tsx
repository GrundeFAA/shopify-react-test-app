import type { ActionFunctionArgs } from "react-router";
import db from "../db.server";
import { customerSyncService } from "../modules/b2b/services/customer-sync.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, shop, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    await customerSyncService.syncFromShopifyWebhook(db, payload);
    return new Response();
  } catch (error) {
    console.error(`${topic} webhook failed for ${shop}`, error);
    return new Response("Internal error", { status: 500 });
  }
};
