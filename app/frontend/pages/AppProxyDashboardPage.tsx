type AppProxyDashboardPageProps = {
  shop: string | null;
  customerId: string | null;
  membershipState: "PENDING_OR_MISSING" | "APPROVED" | null;
};

export function AppProxyDashboardPage({
  shop,
  customerId,
  membershipState,
}: AppProxyDashboardPageProps) {
  return (
    <main>
      <h1>RT B2B Dashboard (React)</h1>
      <p data-react-marker="true">React route is active in this iframe.</p>
      <p>This page is rendered by the app route `app-proxy.dashboard.tsx`.</p>
      <p>Shop domain: {shop ?? "unknown"}</p>
      {customerId ? (
        <>
          <p>Customer is logged in.</p>
          <p>Logged-in customer ID: {customerId}</p>
          <p>Current membership state: {membershipState ?? "unknown"}</p>
        </>
      ) : (
        <p>No logged-in customer was provided by Shopify proxy.</p>
      )}
      <p>Next step: replace this with the full dashboard UI sections.</p>
    </main>
  );
}
