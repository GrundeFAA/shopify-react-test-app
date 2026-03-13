import { createHmac, timingSafeEqual } from "node:crypto";

type DashboardTokenPayload = {
  customerId: string | null;
  shop: string | null;
  exp: number;
};

const DEFAULT_TTL_SECONDS = 5 * 60;

function getSecret(): string {
  const secret = process.env.SHOPIFY_API_SECRET;
  if (!secret) {
    throw new Error("SHOPIFY_API_SECRET is required for dashboard context token");
  }
  return secret;
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signPayload(payloadBase64Url: string): string {
  return createHmac("sha256", getSecret()).update(payloadBase64Url).digest("hex");
}

export const dashboardContextToken = {
  create(input: {
    customerId: string | null;
    shop: string | null;
    ttlSeconds?: number;
  }) {
    const payload: DashboardTokenPayload = {
      customerId: input.customerId,
      shop: input.shop,
      exp: Math.floor(Date.now() / 1000) + (input.ttlSeconds ?? DEFAULT_TTL_SECONDS),
    };

    const payloadBase64Url = toBase64Url(JSON.stringify(payload));
    const signature = signPayload(payloadBase64Url);
    return `${payloadBase64Url}.${signature}`;
  },

  verify(token: string): DashboardTokenPayload {
    const [payloadBase64Url, signature] = token.split(".");
    if (!payloadBase64Url || !signature) {
      throw new Error("Invalid dashboard token format");
    }

    const expected = signPayload(payloadBase64Url);
    const providedBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      throw new Error("Invalid dashboard token signature");
    }

    const payload = JSON.parse(fromBase64Url(payloadBase64Url)) as DashboardTokenPayload;
    if (
      typeof payload.customerId === "undefined" ||
      typeof payload.shop === "undefined" ||
      !payload.exp
    ) {
      throw new Error("Invalid dashboard token payload");
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Dashboard token expired");
    }

    return payload;
  },
};
