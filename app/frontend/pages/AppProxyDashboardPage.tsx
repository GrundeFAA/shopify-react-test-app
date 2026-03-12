type AppProxyDashboardPageProps = {
  shop: string | null;
  customerId: string | null;
  membershipState: "PENDING_OR_MISSING" | "APPROVED" | null;
  companyName: string | null;
  orgNumber: string | null;
  customerName: string | null;
};

export function AppProxyDashboardPage({
  shop,
  customerId,
  membershipState,
  companyName,
  orgNumber,
  customerName,
}: AppProxyDashboardPageProps) {
  const sideNavItems = [
    "Dashboard",
    "Orders",
    "Quotes",
    "Invoices & Documents",
    "Account Details",
    "Address",
    "Support & Service Requests",
  ];

  const topActions = ["Reorder", "Address", "Account Details"];
  const statCards = [
    { label: "Active Orders", value: "4" },
    { label: "Open Quotes", value: "2" },
    { label: "Wishlist", value: "2" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <header className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-slate-500">Welcome</p>
        <h1 className="text-2xl font-bold text-rose-600">{companyName ?? "Unknown company"}</h1>
        <p className="text-sm text-slate-500">
          {orgNumber ? `Org no: ${orgNumber}` : "Org no: not available"}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Shop: {shop ?? "unknown"} | Customer: {customerId ?? "not logged in"} | State:{" "}
          {membershipState ?? "unknown"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Logged in as: <span className="font-medium">{customerName ?? "Unknown user"}</span>
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 px-2 text-sm font-semibold text-slate-700">Menu</p>
          <nav className="space-y-1">
            {sideNavItems.map((item, index) => (
              <button
                key={item}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  index === 0
                    ? "bg-rose-50 font-semibold text-rose-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                type="button"
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3">
            {topActions.map((action) => (
              <div
                className="flex items-center justify-center rounded-md border border-slate-200 py-4 text-sm font-medium text-slate-700"
                key={action}
              >
                {action}
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {statCards.map((card) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                key={card.label}
              >
                <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                <p className="text-sm text-slate-600">{card.label}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <p data-react-marker="true" className="mt-4 text-xs text-slate-400">
        React route marker
      </p>
    </main>
  );
}
