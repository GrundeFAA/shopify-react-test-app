# Production Cleanup Checklist

Use this checklist before releasing to production.

## 1) Understand Mock Dashboard Data Behavior

The app proxy dashboard currently supports development mock data.

- Mock source file:
  - `app/server/modules/b2b/mocks/app-proxy-dashboard.mock.server.ts`
- Mock usage:
  - `app/routes/app-proxy.dashboard.tsx`

Mock toggle is automatic:

- `NODE_ENV=development` -> mock data enabled
- `NODE_ENV=production` -> mock data disabled

## 2) Remove or Keep Mock Code

Choose one approach:

- **Keep mock code** (recommended for future local development):
  - Keep files as-is.
  - Ensure production runs with `NODE_ENV=production`.
- **Remove mock code** (strict production surface):
  - Delete `app/server/modules/b2b/mocks/app-proxy-dashboard.mock.server.ts`.
  - Remove mock branch/imports from `app/routes/app-proxy.dashboard.tsx`.
  - Keep only real data path.

## 3) Verify Real Data Path

After disabling/removing mocks, verify:

- App proxy route shows real company/member data.
- `Brukere` table shows live Shopify customer details where available.
- No mock names/emails (e.g. "Ola Nordmann", "Kari Hansen") appear.

## 4) Final Quality Gate

Run before deploy:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
