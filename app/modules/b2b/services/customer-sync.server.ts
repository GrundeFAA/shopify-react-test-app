import type { PrismaClient } from "@prisma/client";
import { companyMemberRepository } from "../repositories/company-member.server";
import { companyRepository } from "../repositories/company.server";
import { membershipRequestRepository } from "../repositories/membership-request.server";

type ShopifyCustomerWebhookPayload = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  note?: string | null;
};

type NormalizedCustomerNote = {
  companyName?: string;
  orgNumber?: string;
};

function toStringId(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function parseCustomerPayload(payload: unknown): ShopifyCustomerWebhookPayload | null {
  if (!payload || typeof payload !== "object") return null;

  const raw = payload as Record<string, unknown>;
  const id = toStringId(raw.id);
  if (!id) return null;

  return {
    id,
    email: typeof raw.email === "string" ? raw.email : null,
    first_name: typeof raw.first_name === "string" ? raw.first_name : null,
    last_name: typeof raw.last_name === "string" ? raw.last_name : null,
    note: typeof raw.note === "string" ? raw.note : null,
  };
}

function normalizeCustomerNote(note?: string | null): NormalizedCustomerNote {
  if (!note) return {};

  const pairs = note
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [rawKey, ...rawValue] = line.split(":");
      return {
        key: rawKey?.trim().toLowerCase(),
        value: rawValue.join(":").trim(),
      };
    });

  const lookup = new Map(pairs.map((pair) => [pair.key, pair.value]));

  return {
    companyName: lookup.get("company") ?? lookup.get("company_name"),
    orgNumber: lookup.get("org_number") ?? lookup.get("orgnr"),
  };
}

function fallbackCompanyName(customer: ShopifyCustomerWebhookPayload): string {
  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ");
  if (fullName) return `${fullName}'s company`;
  if (customer.email) return `${customer.email.split("@")[0] ?? "Customer"} company`;
  return `Company for ${customer.id}`;
}

export const customerSyncService = {
  async syncFromShopifyWebhook(db: PrismaClient, payload: unknown) {
    const customer = parseCustomerPayload(payload);
    if (!customer) {
      return { ok: false as const, reason: "missing_customer_id" };
    }

    const existingMember = await companyMemberRepository.findAnyByCustomer(
      db,
      customer.id,
    );
    if (existingMember) {
      return {
        ok: true as const,
        companyId: existingMember.companyId,
        membershipId: existingMember.id,
        status: existingMember.status,
      };
    }

    const normalized = normalizeCustomerNote(customer.note);

    const company = normalized.orgNumber
      ? await companyRepository.findOrCreateByOrgNumber(db, {
          name: normalized.companyName ?? fallbackCompanyName(customer),
          orgNumber: normalized.orgNumber,
        })
      : await companyRepository.create(db, {
          // Safe default: never auto-link users by company name alone.
          name: normalized.companyName ?? fallbackCompanyName(customer),
        });

    const member = await companyMemberRepository.create(db, {
      companyId: company.id,
      shopifyCustomerId: customer.id,
      role: "USER",
      status: "PENDING",
    });

    await membershipRequestRepository.ensurePending(db, {
      companyId: company.id,
      shopifyCustomerId: customer.id,
      reason: "Auto-created from Shopify customer webhook",
    });

    return {
      ok: true as const,
      companyId: company.id,
      membershipId: member.id,
      status: member.status,
    };
  },
};
