import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../server/shopify.server";
import { createTrpcCaller } from "../server/trpc/caller.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, shop, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  const caller = createTrpcCaller({ request, shop });

  try {
    await caller.b2b.syncCustomerWebhook({ payload });
    return new Response();
  } catch (error) {
    console.error(`${topic} webhook failed for ${shop}`, error);
    return new Response("Internal error", { status: 500 });
  }
};
