(() => {
  const root = document.getElementById("b2b-theme-first-root");
  if (!root) return;

  const dashboardUrl = root.getAttribute("data-dashboard-url");
  if (!dashboardUrl) return;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const renderError = (message) => {
    root.innerHTML = `
      <div style="border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;padding:12px;border-radius:8px;font-family:Inter,system-ui,sans-serif;">
        <strong>Feil:</strong> ${escapeHtml(message)}
      </div>
    `;
  };

  const renderDashboard = (payload) => {
    const companyName = payload.companyName || "Ukjent selskap";
    const orgNumber = payload.orgNumber || "ikke tilgjengelig";
    const customerName = payload.customerName || "Ukjent bruker";
    const members = Array.isArray(payload.companyMembers) ? payload.companyMembers : [];
    const addresses = Array.isArray(payload.addresses) ? payload.addresses : [];

    const memberRows = members
      .map(
        (member) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(member.fullName || member.shopifyCustomerId)}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(member.email || "Ikke tilgjengelig")}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(`${member.role} (${member.status})`)}</td>
          </tr>
        `,
      )
      .join("");

    const addressRows = addresses
      .map(
        (address) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(address.label || address.address1)}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(address.type)}</td>
            <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(`${address.zip} ${address.city}`)}</td>
          </tr>
        `,
      )
      .join("");

    root.innerHTML = `
      <section style="font-family:Inter,system-ui,sans-serif;color:#0f172a;">
        <h2 style="margin:0 0 8px;font-size:24px;">${escapeHtml(companyName)}</h2>
        <p style="margin:0 0 4px;color:#475569;">Org.nr: ${escapeHtml(orgNumber)}</p>
        <p style="margin:0 0 20px;color:#475569;">Innlogget som: <strong>${escapeHtml(customerName)}</strong></p>

        <h3 style="margin:0 0 10px;font-size:18px;">Brukere</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="text-align:left;background:#f8fafc;">
              <th style="padding:8px;border-bottom:1px solid #e2e8f0;">Navn</th>
              <th style="padding:8px;border-bottom:1px solid #e2e8f0;">E-post</th>
              <th style="padding:8px;border-bottom:1px solid #e2e8f0;">Rolle</th>
            </tr>
          </thead>
          <tbody>
            ${memberRows || `<tr><td colspan="3" style="padding:8px;">Ingen brukere funnet.</td></tr>`}
          </tbody>
        </table>

        <h3 style="margin:0 0 10px;font-size:18px;">Adresser</h3>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="text-align:left;background:#f8fafc;">
              <th style="padding:8px;border-bottom:1px solid #e2e8f0;">Navn</th>
              <th style="padding:8px;border-bottom:1px solid #e2e8f0;">Type</th>
              <th style="padding:8px;border-bottom:1px solid #e2e8f0;">Poststed</th>
            </tr>
          </thead>
          <tbody>
            ${addressRows || `<tr><td colspan="3" style="padding:8px;">Ingen adresser funnet.</td></tr>`}
          </tbody>
        </table>
      </section>
    `;
  };

  fetch(dashboardUrl, { credentials: "same-origin" })
    .then((response) => response.json())
    .then((responseBody) => {
      if (!responseBody?.ok) {
        renderError(responseBody?.error || "Kunne ikke hente dashboard-data.");
        return;
      }
      renderDashboard(responseBody.data);
    })
    .catch((error) => {
      renderError(error instanceof Error ? error.message : "Ukjent feil under lasting.");
    });
})();
