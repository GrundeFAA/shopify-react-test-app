import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { AccountTabs } from "../components/dashboard/AccountTabs";
import { QuickActions } from "../components/dashboard/QuickActions";
import { StatsGrid } from "../components/dashboard/StatsGrid";

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
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <header className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm uppercase tracking-wide text-slate-500">Welcome</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-rose-600">
          <BuildingOfficeIcon className="h-6 w-6" aria-hidden />
          {companyName ?? "Unknown company"}
        </h1>
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

      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white px-4 pt-1 shadow-sm">
          <AccountTabs />
        </section>

        <section className="space-y-4">
          <QuickActions />
          <StatsGrid />
        </section>
      </div>

      <p data-react-marker="true" className="mt-4 text-xs text-slate-400">
        React route marker
      </p>
    </main>
  );
}
