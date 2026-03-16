type CompanyMemberDiagnostic = {
  shopifyCustomerId: string;
  fullName: string | null;
  email: string | null;
  role: string;
  status: string;
};

type DiagnosticsPanelProps = {
  shop: string | null;
  loggedInCustomerId: string | null;
  currentCustomerName: string | null;
  currentCustomerEmail: string | null;
  members: CompanyMemberDiagnostic[];
  isFetching: boolean;
  onRefresh: () => void;
  dashboardPayload: unknown;
};

export function DiagnosticsPanel({
  shop,
  loggedInCustomerId,
  currentCustomerName,
  currentCustomerEmail,
  members,
  isFetching,
  onRefresh,
  dashboardPayload,
}: DiagnosticsPanelProps) {
  const membersMissingEmail = members.filter((member) => !member.email).length;
  const membersMissingName = members.filter((member) => !member.fullName).length;

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-md border border-neutral-medium-grey bg-neutral-off-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-body font-semibold text-neutral-charcoal">Runtime diagnostics</h3>
          <button type="button" className="btn btn-sm btn-tertiary-action" onClick={onRefresh}>
            {isFetching ? "Oppdaterer..." : "Oppdater data"}
          </button>
        </div>
        <dl className="grid gap-2 text-small text-neutral-charcoal-light md:grid-cols-2">
          <div>
            <dt className="font-medium text-neutral-charcoal">Shop (URL)</dt>
            <dd>{shop ?? "Mangler"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-charcoal">logged_in_customer_id (URL)</dt>
            <dd>{loggedInCustomerId ?? "Mangler"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-charcoal">Innlogget navn (enriched)</dt>
            <dd>{currentCustomerName ?? "Mangler"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-charcoal">Innlogget e-post (enriched)</dt>
            <dd>{currentCustomerEmail ?? "Mangler"}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-charcoal">Members total</dt>
            <dd>{members.length}</dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-charcoal">Members missing name/email</dt>
            <dd>
              {membersMissingName} / {membersMissingEmail}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-md border border-neutral-medium-grey bg-white p-4">
        <h3 className="mb-3 text-body font-semibold text-neutral-charcoal">Member enrichment check</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-small">
            <thead>
              <tr className="border-b border-neutral-medium-grey text-left text-neutral-silver">
                <th className="px-2 py-2 font-medium">Customer ID</th>
                <th className="px-2 py-2 font-medium">Name</th>
                <th className="px-2 py-2 font-medium">Email</th>
                <th className="px-2 py-2 font-medium">Role/Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.shopifyCustomerId} className="border-b border-neutral-soft-grey">
                  <td className="px-2 py-2 text-neutral-charcoal">{member.shopifyCustomerId}</td>
                  <td className="px-2 py-2 text-neutral-charcoal-light">
                    {member.fullName ?? "Mangler"}
                  </td>
                  <td className="px-2 py-2 text-neutral-charcoal-light">
                    {member.email ?? "Mangler"}
                  </td>
                  <td className="px-2 py-2 text-neutral-charcoal-light">
                    {member.role} ({member.status})
                  </td>
                </tr>
              ))}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-3 text-neutral-silver">
                    Ingen medlemmer tilgjengelig for diagnose i denne tilstanden.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-md border border-neutral-medium-grey bg-white p-4">
        <h3 className="mb-3 text-body font-semibold text-neutral-charcoal">Raw dashboard payload</h3>
        <pre className="max-h-96 overflow-auto rounded-md bg-neutral-off-white p-3 text-small text-neutral-charcoal-light">
          {JSON.stringify(dashboardPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
}
