# Theme-First Rollout Checklist

Use this checklist when rolling out the theme-first storefront dashboard.

## 1) Deploy order

1. Deploy app server changes first:
   - `/app-proxy/dashboard-data`
   - `/app-proxy/addresses`
   - `/app-proxy/addresses/:id`
2. Keep `STOREFRONT_DASHBOARD_RENDER_MODE=legacy-react` during first deploy.
3. Add theme snippet/script in storefront theme.
4. Enable `STOREFRONT_DASHBOARD_RENDER_MODE=theme-first` in a controlled environment.

## 2) Test matrix

- Logged-out customer:
  - dashboard snippet should show login CTA
  - proxy endpoints should not expose customer-scoped data
- Logged-in non-B2B customer:
  - dashboard renders without privileged mutations
  - no approval-only actions are available
- Logged-in pending member:
  - pending company state visible
  - address mutations are rejected where membership rules apply
- Logged-in approved B2B member:
  - company users and addresses load correctly
  - address create/update/delete succeeds
- Error scenarios:
  - invalid address form input returns readable error
  - unknown intent returns readable error

## 3) Security checks

- Verify all customer-scoped responses use `Cache-Control: no-store, private`.
- Verify requests are sent to `/apps/rt-auth/*` only (no direct app-domain API writes from theme).
- Confirm proxy auth failures are logged in server logs.

## 4) Rollback

- Rollback switch: set `STOREFRONT_DASHBOARD_RENDER_MODE=legacy-react`.
- Remove theme snippet/script if immediate storefront rollback is required.
