import { authenticate } from "../../../shopify.server";
import { createTrpcCaller } from "../../../trpc/caller.server";

export async function handleCustomerWebhook(request: Request): Promise<Response> {
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
}
