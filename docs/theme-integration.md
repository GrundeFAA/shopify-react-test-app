# Theme Integration (Theme-First, Manual)

This document describes how to embed the B2B dashboard in a storefront theme while keeping Shopify App Proxy as the trust boundary.

## Prerequisites

- App proxy must be configured in `shopify.app.toml`:
  - `prefix = "apps"`
  - `subpath = "rt-auth"`
  - `url = "https://<your-app-domain>/app-proxy"`
- Deploy the app server so `/theme-dashboard.js` and `/app-proxy/*` are reachable.
- Customer is logged in on storefront.

## Proxy endpoints consumed by theme code

- `GET /apps/rt-auth/dashboard-data`
  - Returns JSON view model for dashboard rendering.
- `POST /apps/rt-auth/addresses`
  - Address create mutation (`intent=create-address`).
- `POST /apps/rt-auth/addresses/:id`
  - Address update/delete mutation (`intent=update-address` or `intent=delete-address`).

All endpoints require valid app proxy signatures and use logged-in customer context from Shopify.

## Manual theme snippet

Create a snippet in your theme and include it where you want the dashboard.

```liquid
{% if customer %}
  <div
    id="b2b-theme-first-root"
    data-dashboard-url="/apps/rt-auth/dashboard-data">
  </div>
  <script
    src="https://shopify-react-test-app-production.up.railway.app/theme-dashboard.js"
    defer>
  </script>
{% else %}
  <a href="/account/login">Logg inn for å se B2B-dashboard.</a>
{% endif %}
```

## Optional B2B gate in theme

If you only want the UI for tagged B2B customers:

```liquid
{% if customer and customer.tags contains 'b2b' %}
  {% render 'b2b-dashboard' %}
{% endif %}
```

## Notes

- Do not pass customer identity from Liquid as trusted auth data.
- Keep all secure reads/writes through `/apps/rt-auth/*`.
- Use `Cache-Control: no-store, private` on customer-scoped responses (already set in app routes).
