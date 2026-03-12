import db from "../db.server";

type CreateTrpcContextOptions = {
  request: Request;
  shop?: string | null;
  customerId?: string | null;
};

export function createTrpcContext(options: CreateTrpcContextOptions) {
  return {
    db,
    request: options.request,
    shop: options.shop ?? null,
    customerId: options.customerId ?? null,
  };
}

export type TrpcContext = Awaited<ReturnType<typeof createTrpcContext>>;
