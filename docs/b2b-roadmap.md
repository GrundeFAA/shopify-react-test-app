# B2B Roadmap (Non-Plus) - Technical Product Spec

This document defines the implementation roadmap for custom B2B functionality in this Shopify app, without Shopify Plus.

Primary audience: developers and AI coding agents working in this repository.

## 1. Goal

Build a company-scoped B2B experience where:

- A customer belongs to exactly one company.
- Approved members of a company can see shared company context in the dashboard.
- Company users can access shared order history across related users.
- Company addresses are centrally managed and synchronized to member customer addresses.
- The storefront theme can conditionally render B2B UX based on customer tags.

## 2. Current Constraints and Context

- Shopify Plus is not used.
- Dashboard is only for logged-in storefront users (app proxy flow).
- Shopify is already integrated with Microsoft Business Central using the Microsoft Shopify BC Connector.
- BC connector currently syncs products and orders successfully.
- No BC-driven custom sync work is required for MVP.
- This solution is custom for internal company needs (not multi-client SaaS expansion).

## 3. Confirmed Product Decisions

## 3.1 Membership and Company Linking

- One customer -> one company.
- Registration form has a B2B checkbox that conditionally renders company fields:
  - normal registration: standard Shopify fields only
  - B2B registration: also requires company name and organization number
- Company name and org number are written into the customer note field at form submission.
- The note field is used as a temporary transport only, not persistent storage.
- On `customers/create` webhook:
  - parse company name and org number from customer note
  - create company if org number does not exist
  - create relationship automatically
  - first user in company: auto-approve + `ADMIN`
  - subsequent users with same org number: `USER` + `PENDING`
  - after successful processing: clear the customer note field
  - after successful processing: add `b2b` tag to the Shopify customer
- `ADMIN` can approve pending users for their company.
- Future: add company user invite flow.

## 3.2 Roles and Permissions

Only two roles for now:

- `ADMIN`
- `USER`

Permission model:

- `USER`: normal dashboard access + create/edit company addresses.
- `ADMIN`: same as user + user management features (approval, future invites, management actions).

## 3.3 Orders Scope

- Company order view should aggregate orders from company-related users.
- Source relationship: orders are linked to individual Shopify customers.
- Company-level order history is built by querying all related member customer IDs.
- Include order history from all company members (approved and non-approved) unless explicitly changed later.

## 3.4 Address Model

Decision for MVP:

- App DB is source of truth for company addresses.
- Address types:
  - 1 billing address
  - multiple shipping addresses
- When a company address is created/updated:
  - propagate/sync to Shopify customer addresses for all approved members so checkout stays usable.
- Reason:
  - Shopify customer addresses are user-scoped.
  - checkout extensibility is limited for this requirement.

### Address Sync Strategy

A mapping table (`CompanyAddressMember`) tracks which Shopify address ID corresponds to each company address per member:

- `companyAddressId` — app DB company address record
- `shopifyCustomerId` — the member customer
- `shopifyAddressId` — the `MailingAddress` GID returned by Shopify after write

Sync behavior:

- On create: write to Shopify, store returned `shopifyAddressId` in mapping table.
- On update: look up existing mapping → update that specific Shopify address by known ID.
- On member approved: sync all existing company addresses to new member, store mappings.
- Idempotent: if mapping already exists, update in place — never create duplicates.

### Checkout-Created Addresses (Personal Addresses)

Customers can create new addresses during Shopify checkout. These are personal and not managed by the company:

- Checkout-created addresses are not in the `CompanyAddressMember` mapping table.
- Sync engine only touches addresses it has a mapping record for.
- Personal addresses are left completely alone.
- No automatic promotion of personal addresses to company addresses.
- Future (post-MVP): admin "adopt address" flow — insert a mapping row to bring a personal address under company management.

## 3.5 Theme Behavior

- On successful company linking/approval state transition to active B2B context:
  - apply customer B2B tag in Shopify.
- Theme checks tag to conditionally render B2B storefront UX.

## 4. Integration Strategy with Business Central

## 4.1 What We Rely on Today

- Microsoft BC Connector handles core order/product sync and mapping.
- Connector can map correctly when company field in address is correct.

## 4.2 MVP Boundary

- No custom BC extension dependencies required for MVP feature completion.
- App DB acts as a rich user/membership/company layer around normal Shopify flows.

## 4.3 Later (Post-MVP)

- Extend BC integration only where connector does not cover business needs.
- Admin portal assistance tools for company/user link operations.

## 5. Implementation Status Snapshot

## 5.1 Implemented (Prototype Foundation)

- Prisma models for company, membership, membership requests.
- Webhook-driven company/member linking from customer creation.
- First-member auto-admin behavior.
- Pending-state creation for subsequent members.
- App proxy dashboard shell with tabs and member rendering.

## 5.2 Partially Implemented

- Admin user management UX exists as placeholders.
- Membership states are available, but approval workflows need full UI/API actions.
- Webhook parses customer note correctly, but post-processing cleanup (clear note, write `b2b` tag) is not yet implemented.
- Theme-first storefront migration is in progress:
  - app proxy JSON and mutation endpoints are available for theme rendering
  - legacy React dashboard rendering remains behind `STOREFRONT_DASHBOARD_RENDER_MODE`

## 5.3 Not Implemented Yet

- `CompanyAddress` and `CompanyAddressMember` Prisma models.
- Address CRUD APIs and dashboard UI.
- Address sync engine (app DB -> Shopify customer addresses via mapping table).
- Aggregated company order query/service.
- B2B tag write/update logic for theme rendering.
- Invite flow.
- Admin portal support tools.

## 6. Roadmap Phases

## Phase 1 - Membership Completion (Near Term)

Outcomes:

- Complete company membership lifecycle in dashboard.
- Admin can approve pending users.
- Membership state changes are persisted and reflected in UI.
- Apply/remove B2B customer tags based on effective company state policy.

Core work:

- Add server mutations for approve/inactivate actions.
- Add admin-only controls in users table.
- Add policy checks (only same-company admins can manage users).
- Implement post-webhook customer cleanup: clear note field + write `b2b` tag.
- Ensure webhook handles note clear + tag idempotently (safe to re-run).

## Phase 2 - Company Addresses (Core B2B Value)

Outcomes:

- Central company addresses in app DB.
- Billing + multiple shipping addresses.
- Address edit/create in dashboard.
- Sync to linked Shopify customer addresses.

Core work:

- Extend Prisma schema with `CompanyAddress` and `CompanyAddressMember` models.
- `CompanyAddress`: id, companyId, type (BILLING/SHIPPING), address fields, label, isDefault.
- `CompanyAddressMember`: id, companyAddressId, shopifyCustomerId, shopifyAddressId.
- Add address CRUD APIs (scoped to company; all approved members can create/edit addresses).
- Implement address sync service: create/update Shopify customer addresses by mapping.
- Trigger sync on: address created, address updated, member approved.
- Add sync status/error visibility per address per member.
- Sync engine must never touch Shopify addresses not present in mapping table.

## Phase 3 - Company Order History Aggregation

Outcomes:

- Company orders tab loads real data.
- Orders include all relevant company members.
- Filter/sort/pagination for operational usability.

Core work:

- Build service to resolve customer IDs by company.
- Query Shopify orders by those customer IDs.
- Normalize order rows for dashboard table.

## Phase 4 - Admin Assistance + Future BC Extensions

Outcomes:

- Internal admin tooling to help resolve link/approval issues.
- Optional custom BC extension integration for gaps not covered by connector.

Core work:

- Admin portal actions for membership maintenance.
- Selective BC enrichment where needed.

## 7. MVP Non-Goals

The following are explicitly out of MVP scope:

- Full BC custom extension feature set.
- Automated BC-driven membership orchestration.
- Advanced role system beyond `ADMIN` and `USER`.
- User self-removal from company.
- Compliance/audit deep implementation beyond basic safe logging.

## 8. Data Ownership and Source of Truth

- Company + membership: app DB.
- Company addresses: app DB (`CompanyAddress` table).
- Shopify customer addresses: synced mirror of company addresses only, tracked via `CompanyAddressMember` mapping.
- Personal addresses (checkout-created): Shopify only, never touched by sync engine.
- Orders: Shopify as operational source, aggregated by app logic.
- BC: downstream ERP sync via connector.

## 9. Operational Notes for Agents

When implementing roadmap items:

- Preserve one-company-per-customer constraint.
- Keep webhook flow idempotent.
- Do not assume Shopify B2B/Company APIs (Plus features).
- Prefer additive schema changes with explicit migrations.
- Keep dashboard access gated to authenticated storefront customer context.
- Ensure role checks on all mutating endpoints.
- Keep theme integrations on `/apps/rt-auth/*` routes and avoid direct app-domain API calls from Liquid.

## 10. Open Items (Deferred by Product Decision)

- GDPR/data retention policy for membership and address history.
- Full conflict-resolution policy between app DB and external systems.
- Detailed audit trail requirements.

These are intentionally deferred and should not block current roadmap execution.

