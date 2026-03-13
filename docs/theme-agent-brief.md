# Theme Agent Brief: B2B Dashboard in Liquid

This document is a complete, self-contained brief for the Cursor agent working in the Shopify theme.
It describes exactly what to build, which endpoints to call, what the response shapes look like, and
which Liquid/JS patterns to use.

Do not build any backend. The backend is already deployed.

---

## 1. Context

The store has a custom B2B portal. Logged-in storefront customers who have been approved as B2B
members can see their company, users, addresses and orders via a dashboard.

The dashboard data is served by an external app via **Shopify App Proxy**. The theme's job is to
render that data and submit mutations back through the proxy.

App proxy base path on the storefront:

```
/apps/rt-auth
```

All API routes below are relative to this base, meaning the actual storefront URLs are
`/apps/rt-auth/<path>`.

---

## 2. Endpoints

### 2.1 GET `/apps/rt-auth/dashboard-data`

Fetches all dashboard data for the currently logged-in customer.

Shopify automatically appends the following query parameters when the request comes through App Proxy:

- `logged_in_customer_id` — Shopify customer ID of the current user
- `shop` — store domain
- `path_prefix` — injected prefix (`/apps/rt-auth`)

The theme does **not** need to append those manually. They are injected by the proxy.

#### Success response (HTTP 200)

```json
{
  "ok": true,
  "data": {
    "appUrl": "https://shopify-react-test-app-production.up.railway.app",
    "shop": "your-store.myshopify.com",
    "customerId": "7890123456",
    "membershipState": "APPROVED",
    "companyName": "Eksempel AS",
    "orgNumber": "123456789",
    "customerName": "Ola Nordmann",
    "storefrontTabsBaseUrl": "https://your-store.myshopify.com/apps/rt-auth/dashboard",
    "companyMembers": [
      {
        "id": "mem_abc123",
        "shopifyCustomerId": "7890123456",
        "fullName": "Ola Nordmann",
        "email": "ola@example.com",
        "role": "ADMIN",
        "status": "APPROVED"
      }
    ],
    "addresses": [
      {
        "id": "addr_xyz",
        "type": "SHIPPING",
        "label": "Lager Oslo",
        "isDefault": true,
        "firstName": null,
        "lastName": null,
        "company": "Eksempel AS",
        "address1": "Storgata 1",
        "address2": null,
        "city": "Oslo",
        "province": null,
        "zip": "0155",
        "country": "Norway",
        "phone": null
      }
    ]
  }
}
```

#### States to handle

| `membershipState` | Meaning |
|---|---|
| `"APPROVED"` | Customer is an approved B2B member. Show full dashboard. |
| `"PENDING_OR_MISSING"` | Customer registered as B2B but not yet approved. Show pending message. `companyName` may be set, `companyMembers` and `addresses` are empty arrays. |
| `null` | Customer is logged in but has no B2B record at all. Show a "not a B2B member" message or registration CTA. |

#### Error response (HTTP 400)

```json
{
  "ok": false,
  "error": "Ikke innlogget eller manglende butikk-kontekst."
}
```

---

### 2.2 POST `/apps/rt-auth/addresses`

Creates a new company address. Returns JSON (not a redirect). Theme JS must handle the response.

#### Request

`Content-Type: application/x-www-form-urlencoded`

| Field | Required | Values |
|---|---|---|
| `intent` | yes | `"create-address"` |
| `type` | yes | `"BILLING"` or `"SHIPPING"` |
| `address1` | yes | string |
| `city` | yes | string |
| `zip` | yes | string |
| `country` | yes | string |
| `label` | no | string or empty |
| `firstName` | no | string or empty |
| `lastName` | no | string or empty |
| `company` | no | string or empty |
| `address2` | no | string or empty |
| `province` | no | string or empty |
| `phone` | no | string or empty |
| `isDefault` | no | `"on"` to set as default, omit otherwise |

#### Success response (HTTP 200)

```json
{
  "ok": true,
  "intent": "create-address",
  "addressId": "addr_xyz"
}
```

#### Error response (HTTP 400)

```json
{
  "ok": false,
  "error": "Ugyldig adressetype."
}
```

---

### 2.3 POST `/apps/rt-auth/addresses/:id`

Updates or deletes an existing address by ID.

#### Update request

Same fields as create, but `intent` must be `"update-address"`. The `:id` in the URL is the address
ID. Do not include an `id` field in the form body — use the URL.

#### Delete request

| Field | Required | Value |
|---|---|---|
| `intent` | yes | `"delete-address"` |

No other fields needed for delete.

#### Success response (HTTP 200)

```json
{
  "ok": true,
  "intent": "update-address",
  "addressId": "addr_xyz"
}
```

---

## 3. Files to create in the theme

### 3.1 Snippet: `snippets/b2b-dashboard.liquid`

This is the main entry point. Include it anywhere in your theme.

```liquid
{% comment %}
  B2B Dashboard - entry point
  Only renders for logged-in customers.
  Optionally gate by b2b tag: customer.tags contains 'b2b'
{% endcomment %}

{% if customer %}
  <div
    id="b2b-dashboard-root"
    data-proxy-base="/apps/rt-auth"
    class="b2b-dashboard"
  >
    <div id="b2b-dashboard-loading" class="b2b-dashboard__loading">
      Laster inn dashboard…
    </div>
    <div id="b2b-dashboard-content" class="b2b-dashboard__content" style="display:none;"></div>
    <div id="b2b-dashboard-error" class="b2b-dashboard__error" style="display:none;"></div>
  </div>

  <script src="{{ 'b2b-dashboard.js' | asset_url }}" defer></script>
{% else %}
  <p><a href="/account/login">Logg inn for å se B2B-portalen din.</a></p>
{% endif %}
```

To gate by B2B tag:

```liquid
{% if customer and customer.tags contains 'b2b' %}
  {% render 'b2b-dashboard' %}
{% endif %}
```

---

### 3.2 Template: `templates/page.b2b-dashboard.json`

Create a dedicated page template so the merchant can add a "B2B Dashboard" page in the admin:

```json
{
  "sections": {
    "main": {
      "type": "main-b2b-dashboard",
      "settings": {}
    }
  },
  "order": ["main"]
}
```

---

### 3.3 Section: `sections/main-b2b-dashboard.liquid`

This is the full section that wraps the snippet and provides the page shell.

```liquid
<div class="page-width">
  <h1 class="h1">{{ section.settings.heading | default: 'Min B2B-konto' }}</h1>
  {% render 'b2b-dashboard' %}
</div>

{% schema %}
{
  "name": "B2B Dashboard",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Overskrift",
      "default": "Min B2B-konto"
    }
  ],
  "presets": [
    {
      "name": "B2B Dashboard"
    }
  ]
}
{% endschema %}
```

---

### 3.4 Asset: `assets/b2b-dashboard.js`

This is the complete JavaScript file. It:

1. Fetches dashboard data from the proxy.
2. Renders HTML into `#b2b-dashboard-content` based on the membership state.
3. Handles tab switching.
4. Sends address mutations via `fetch` and re-fetches data after.

```javascript
(function () {
  'use strict';

  const root = document.getElementById('b2b-dashboard-root');
  if (!root) return;

  const proxyBase = root.getAttribute('data-proxy-base') || '/apps/rt-auth';
  const loadingEl = document.getElementById('b2b-dashboard-loading');
  const contentEl = document.getElementById('b2b-dashboard-content');
  const errorEl = document.getElementById('b2b-dashboard-error');

  // ─── Helpers ────────────────────────────────────────────────────────────

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showError(message) {
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) {
      errorEl.style.display = '';
      errorEl.innerHTML = `<p class="b2b-error">${esc(message)}</p>`;
    }
  }

  function getActiveTab() {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'brukere';
  }

  function buildTabUrl(tabId) {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tabId);
    return `${window.location.pathname}?${params.toString()}`;
  }

  // ─── Rendering ──────────────────────────────────────────────────────────

  function renderMemberRows(members) {
    if (!members.length) {
      return '<tr><td colspan="4" class="b2b-table__empty">Ingen brukere funnet.</td></tr>';
    }
    return members.map(function (m) {
      return `
        <tr>
          <td class="b2b-table__cell">${esc(m.fullName || m.shopifyCustomerId)}</td>
          <td class="b2b-table__cell">${esc(m.email || '–')}</td>
          <td class="b2b-table__cell">${esc(m.role === 'ADMIN' ? 'Administrator' : 'Bruker')}</td>
          <td class="b2b-table__cell">${esc(m.status)}</td>
        </tr>
      `;
    }).join('');
  }

  function renderAddressRows(addresses, proxyBase) {
    if (!addresses.length) {
      return '<tr><td colspan="5" class="b2b-table__empty">Ingen adresser funnet.</td></tr>';
    }
    return addresses.map(function (a) {
      const typeLabel = a.type === 'BILLING' ? 'Faktura' : 'Levering';
      const displayName = a.label || [a.firstName, a.lastName].filter(Boolean).join(' ') || a.company || '–';
      return `
        <tr>
          <td class="b2b-table__cell">${esc(displayName)}</td>
          <td class="b2b-table__cell">${esc(typeLabel)}</td>
          <td class="b2b-table__cell">${esc(a.address1)}${a.address2 ? ', ' + esc(a.address2) : ''}</td>
          <td class="b2b-table__cell">${esc(a.zip)} ${esc(a.city)}</td>
          <td class="b2b-table__cell">
            <button
              class="b2b-btn b2b-btn--danger"
              data-action="delete-address"
              data-address-id="${esc(a.id)}">
              Slett
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderAddressForm(proxyBase) {
    return `
      <form class="b2b-form" data-action="create-address" data-proxy-base="${esc(proxyBase)}">
        <input type="hidden" name="intent" value="create-address">
        <div class="b2b-form__row">
          <label class="b2b-form__label">
            Type
            <select name="type" class="b2b-form__input" required>
              <option value="SHIPPING">Levering</option>
              <option value="BILLING">Faktura</option>
            </select>
          </label>
          <label class="b2b-form__label">
            Etikett
            <input name="label" type="text" class="b2b-form__input" placeholder="Eks: Lager Oslo">
          </label>
        </div>
        <div class="b2b-form__row">
          <label class="b2b-form__label">
            Adresse 1 *
            <input name="address1" type="text" class="b2b-form__input" required>
          </label>
          <label class="b2b-form__label">
            Adresse 2
            <input name="address2" type="text" class="b2b-form__input">
          </label>
        </div>
        <div class="b2b-form__row">
          <label class="b2b-form__label">
            By *
            <input name="city" type="text" class="b2b-form__input" required>
          </label>
          <label class="b2b-form__label">
            Postnummer *
            <input name="zip" type="text" class="b2b-form__input" required>
          </label>
        </div>
        <div class="b2b-form__row">
          <label class="b2b-form__label">
            Land *
            <input name="country" type="text" class="b2b-form__input" value="Norway" required>
          </label>
          <label class="b2b-form__label b2b-form__label--checkbox">
            <input name="isDefault" type="checkbox" value="on">
            Standardadresse
          </label>
        </div>
        <div id="b2b-form-error" class="b2b-form__error" style="display:none;"></div>
        <button type="submit" class="b2b-btn b2b-btn--primary">Opprett adresse</button>
      </form>
    `;
  }

  function renderDashboard(data) {
    const activeTab = getActiveTab();
    const tabs = [
      { id: 'min-konto', label: 'Min konto' },
      { id: 'selskap', label: 'Selskap' },
      { id: 'brukere', label: 'Brukere' },
      { id: 'adresser', label: 'Adresser' },
      { id: 'ordrer', label: 'Ordrer' },
    ];

    const tabNav = tabs.map(function (tab) {
      const isActive = tab.id === activeTab;
      return `
        <a
          href="${esc(buildTabUrl(tab.id))}"
          class="b2b-tabs__tab${isActive ? ' b2b-tabs__tab--active' : ''}"
          data-tab="${esc(tab.id)}"
          aria-current="${isActive ? 'page' : 'false'}">
          ${esc(tab.label)}
        </a>
      `;
    }).join('');

    let tabContent = '';
    switch (activeTab) {
      case 'min-konto':
        tabContent = `
          <p class="b2b-text">Innlogget som: <strong>${esc(data.customerName || '–')}</strong></p>
          <p class="b2b-text">Status: <strong>${esc(data.membershipState || '–')}</strong></p>
        `;
        break;

      case 'selskap':
        tabContent = `
          <dl class="b2b-definition-list">
            <dt>Selskapsnavn</dt><dd>${esc(data.companyName || '–')}</dd>
            <dt>Org.nr</dt><dd>${esc(data.orgNumber || '–')}</dd>
          </dl>
        `;
        break;

      case 'brukere':
        tabContent = `
          <table class="b2b-table">
            <thead>
              <tr>
                <th class="b2b-table__header">Navn</th>
                <th class="b2b-table__header">E-post</th>
                <th class="b2b-table__header">Rolle</th>
                <th class="b2b-table__header">Status</th>
              </tr>
            </thead>
            <tbody>${renderMemberRows(data.companyMembers || [])}</tbody>
          </table>
        `;
        break;

      case 'adresser':
        tabContent = `
          <table class="b2b-table">
            <thead>
              <tr>
                <th class="b2b-table__header">Navn</th>
                <th class="b2b-table__header">Type</th>
                <th class="b2b-table__header">Adresse</th>
                <th class="b2b-table__header">Poststed</th>
                <th class="b2b-table__header">Handlinger</th>
              </tr>
            </thead>
            <tbody>${renderAddressRows(data.addresses || [], proxyBase)}</tbody>
          </table>
          <h3 class="b2b-heading">Legg til adresse</h3>
          ${renderAddressForm(proxyBase)}
        `;
        break;

      case 'ordrer':
        tabContent = '<p class="b2b-text">Ordrehistorikk kommer snart.</p>';
        break;

      default:
        tabContent = '<p class="b2b-text">Velg en fane.</p>';
    }

    return `
      <header class="b2b-header">
        <h2 class="b2b-header__company">${esc(data.companyName || 'Ukjent selskap')}</h2>
        <p class="b2b-header__meta">Org.nr: ${esc(data.orgNumber || '–')}</p>
        <p class="b2b-header__meta">Innlogget som: <strong>${esc(data.customerName || '–')}</strong></p>
      </header>
      <nav class="b2b-tabs" aria-label="Dashboard-navigasjon">
        ${tabNav}
      </nav>
      <section class="b2b-tab-content">
        ${tabContent}
      </section>
    `;
  }

  function renderPending(data) {
    return `
      <div class="b2b-notice b2b-notice--info">
        <p>Din B2B-registrering for <strong>${esc(data.companyName || 'ukjent selskap')}</strong> er til behandling.</p>
        <p>En administrator vil godkjenne deg snart.</p>
      </div>
    `;
  }

  function renderNotB2B() {
    return `
      <div class="b2b-notice b2b-notice--warning">
        <p>Din konto er ikke knyttet til noen B2B-bedrift.</p>
        <p>Ta kontakt med oss for å registrere deg.</p>
      </div>
    `;
  }

  // ─── Mutations ──────────────────────────────────────────────────────────

  function submitForm(form) {
    const formData = new FormData(form);
    const intent = formData.get('intent');
    const proxyBase = form.getAttribute('data-proxy-base') || '/apps/rt-auth';
    let url = `${proxyBase}/addresses`;

    fetch(url, {
      method: 'POST',
      body: new URLSearchParams(formData),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json.ok) {
          const errEl = form.querySelector('#b2b-form-error');
          if (errEl) {
            errEl.style.display = '';
            errEl.textContent = json.error || 'Ukjent feil.';
          }
          return;
        }
        loadDashboard();
      })
      .catch(function (err) {
        const errEl = form.querySelector('#b2b-form-error');
        if (errEl) {
          errEl.style.display = '';
          errEl.textContent = err.message || 'Feil ved sending.';
        }
      });
  }

  function deleteAddress(addressId) {
    const url = `${proxyBase}/addresses/${encodeURIComponent(addressId)}`;
    const body = new URLSearchParams({ intent: 'delete-address' });
    fetch(url, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json.ok) {
          showError(json.error || 'Kunne ikke slette adresse.');
          return;
        }
        loadDashboard();
      })
      .catch(function (err) {
        showError(err.message || 'Feil ved sletting.');
      });
  }

  // ─── Event delegation ───────────────────────────────────────────────────

  function bindEvents() {
    document.addEventListener('submit', function (e) {
      const form = e.target.closest('form[data-action]');
      if (!form) return;
      e.preventDefault();
      submitForm(form);
    });

    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-action="delete-address"]');
      if (!btn) return;
      e.preventDefault();
      const id = btn.getAttribute('data-address-id');
      if (id && confirm('Vil du slette denne adressen?')) {
        deleteAddress(id);
      }
    });
  }

  // ─── Main fetch ─────────────────────────────────────────────────────────

  function loadDashboard() {
    if (loadingEl) loadingEl.style.display = '';
    if (contentEl) contentEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';

    fetch(`${proxyBase}/dashboard-data`, { credentials: 'same-origin' })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (!json.ok) {
          showError(json.error || 'Kunne ikke hente dashboard-data.');
          return;
        }

        const data = json.data;
        let html = '';

        if (data.membershipState === 'APPROVED') {
          html = renderDashboard(data);
        } else if (data.membershipState === 'PENDING_OR_MISSING') {
          html = renderPending(data);
        } else {
          html = renderNotB2B();
        }

        if (loadingEl) loadingEl.style.display = 'none';
        if (contentEl) {
          contentEl.innerHTML = html;
          contentEl.style.display = '';
        }
      })
      .catch(function (err) {
        showError(err.message || 'Ukjent feil under lasting.');
      });
  }

  bindEvents();
  loadDashboard();
})();
```

---

### 3.5 Asset: `assets/b2b-dashboard.css`

Base styles using BEM-like class names. Apply your own theme fonts/colors on top.

```css
/* ── Layout ─────────────────────────────────────────────────────────── */
.b2b-dashboard {
  font-family: inherit;
  color: inherit;
}

.b2b-dashboard__loading {
  padding: 16px;
  color: #64748b;
}

.b2b-dashboard__error {
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
}

/* ── Header ─────────────────────────────────────────────────────────── */
.b2b-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 16px;
}

.b2b-header__company {
  margin: 0 0 4px;
  font-size: 22px;
  font-weight: 700;
}

.b2b-header__meta {
  margin: 2px 0;
  color: #475569;
  font-size: 14px;
}

/* ── Tabs ────────────────────────────────────────────────────────────── */
.b2b-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
  overflow-x: auto;
}

.b2b-tabs__tab {
  padding: 12px 16px;
  text-decoration: none;
  color: #64748b;
  font-size: 14px;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.b2b-tabs__tab:hover {
  color: #1e293b;
}

.b2b-tabs__tab--active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
  font-weight: 600;
}

/* ── Tab content ─────────────────────────────────────────────────────── */
.b2b-tab-content {
  padding: 0 4px;
}

/* ── Table ───────────────────────────────────────────────────────────── */
.b2b-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.b2b-table__header {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 2px solid #e2e8f0;
  color: #475569;
  font-weight: 600;
}

.b2b-table__cell {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.b2b-table__empty {
  padding: 16px 12px;
  color: #94a3b8;
}

/* ── Notices ─────────────────────────────────────────────────────────── */
.b2b-notice {
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
}

.b2b-notice--info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.b2b-notice--warning {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

/* ── Buttons ─────────────────────────────────────────────────────────── */
.b2b-btn {
  cursor: pointer;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
}

.b2b-btn--primary {
  background: #4f46e5;
  color: #fff;
}

.b2b-btn--primary:hover {
  background: #4338ca;
}

.b2b-btn--danger {
  background: transparent;
  color: #dc2626;
  padding: 4px 8px;
}

.b2b-btn--danger:hover {
  text-decoration: underline;
}

/* ── Form ────────────────────────────────────────────────────────────── */
.b2b-form {
  max-width: 640px;
  margin-top: 16px;
}

.b2b-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.b2b-form__label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: #374151;
}

.b2b-form__label--checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-top: 20px;
}

.b2b-form__input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}

.b2b-form__input:focus {
  outline: 2px solid #4f46e5;
  outline-offset: -1px;
}

.b2b-form__error {
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #b91c1c;
  font-size: 14px;
  margin-bottom: 10px;
}

/* ── Text helpers ────────────────────────────────────────────────────── */
.b2b-text {
  font-size: 14px;
  color: #374151;
  margin-bottom: 8px;
}

.b2b-heading {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0 8px;
}

.b2b-definition-list {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  font-size: 14px;
}

.b2b-definition-list dt {
  font-weight: 600;
  color: #374151;
}

.b2b-definition-list dd {
  margin: 0;
  color: #475569;
}
```

---

## 4. How to include the CSS

In your theme layout (`layout/theme.liquid`), add this before `</head>`:

```liquid
{{ 'b2b-dashboard.css' | asset_url | stylesheet_tag }}
```

Or scope it to only load on the B2B dashboard page:

```liquid
{% if template == 'page.b2b-dashboard' %}
  {{ 'b2b-dashboard.css' | asset_url | stylesheet_tag }}
{% endif %}
```

---

## 5. How to add the page in Shopify admin

1. Go to **Online Store → Pages**.
2. Create a new page, e.g. title `B2B Dashboard`, handle `b2b-dashboard`.
3. Set the template to `page.b2b-dashboard`.
4. Save.
5. Link to it from your navigation or customer account area.

---

## 6. Security rules — do not break these

- Never pass `logged_in_customer_id` or any customer data from Liquid into the JS request.
  Shopify App Proxy injects these server-side automatically. They cannot be forged this way.
- Never call `https://shopify-react-test-app-production.up.railway.app` directly from theme JS.
  Always call `/apps/rt-auth/*`. The proxy handles routing and trust.
- Never cache customer-scoped responses. The app already sends `Cache-Control: no-store, private`.

---

## 7. Summary of files to create

| File | Purpose |
|---|---|
| `snippets/b2b-dashboard.liquid` | Mounting point + login gate |
| `sections/main-b2b-dashboard.liquid` | Page section shell + schema |
| `templates/page.b2b-dashboard.json` | Page template |
| `assets/b2b-dashboard.js` | All dashboard JS logic |
| `assets/b2b-dashboard.css` | Base dashboard styles |

No other theme files need to be modified unless you want to add a navigation link.
