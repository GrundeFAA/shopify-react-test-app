# Storefront SPA Theme Integration

Use this snippet in the theme template that should host the B2B dashboard.

```liquid
{% if customer %}
  <div
    id="rt-b2b-root"
    data-proxy-base="/apps/rt-auth"
    data-customer-id="{{ customer.id }}"
  ></div>
  <link
    rel="stylesheet"
    href="https://shopify-react-test-app-production.up.railway.app/storefront.css"
  >
  <script
    src="https://shopify-react-test-app-production.up.railway.app/storefront.js"
    defer
  ></script>
{% else %}
  <a href="{{ routes.account_login_url }}">Logg inn for å se din konto</a>
{% endif %}
```

Notes:

- Keep API calls in the React app on relative App Proxy URLs (`/apps/rt-auth/*`) so Shopify HMAC auth stays intact.
- The `data-proxy-base` attribute is read by `app/storefront/entry.tsx`.
- `storefront.js` and `storefront.css` are served by Railway from the app build output.
