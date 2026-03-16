# Production Cleanup Checklist

Use this checklist before releasing to production.

## 1) Confirm Live Dashboard Data Path

The dashboard runs on the live app-proxy and tRPC data path.

- App proxy shell route:
  - `app/routes/app-proxy.dashboard.tsx`
- Storefront tRPC route:
  - `app/routes/app-proxy.api.trpc.$.tsx`

## 2) Verify Dashboard Data Quality

Verify in a logged-in storefront session:

- App proxy route shows real company/member data.
- `Brukere` table shows live Shopify customer details where available.
- `Adresser` tab can create, update, and delete company addresses.
- Address writes are reflected in Shopify customer addresses for approved members.

## 3) Verify Asset Delivery and Isolation

- `storefront.js` and `storefront.css` are loaded from the configured app URL.
- `#rt-b2b-root` is mounted and React renders inside Shadow DOM.
- Theme CSS does not override dashboard component styles.

## 4) Final Quality Gate

Run before deploy:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
