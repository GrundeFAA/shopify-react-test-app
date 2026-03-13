import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { AccountTabBoilerplate } from "../components/dashboard/AccountTabBoilerplate";
import { AccountTabs, type AccountTabId } from "../components/dashboard/AccountTabs";
import type { CompanyAddressRow } from "../components/dashboard/CompanyAddressesTable";
import type { CompanyScopedMember } from "../components/dashboard/CompanyUsersTable";
import { QuickActions } from "../components/dashboard/QuickActions";
import { StatsGrid } from "../components/dashboard/StatsGrid";

type AppProxyDashboardPageProps = {
  companyName: string | null;
  orgNumber: string | null;
  customerName: string | null;
  companyMembers: CompanyScopedMember[];
  addresses: CompanyAddressRow[];
  formMode: string | null;
  editingAddressId: string | null;
  actionError: string | null;
  activeTab: AccountTabId;
  storefrontTabsBaseUrl: string;
};

export function AppProxyDashboardPage({
  companyName,
  orgNumber,
  customerName,
  companyMembers,
  addresses,
  formMode,
  editingAddressId,
  actionError,
  activeTab,
  storefrontTabsBaseUrl,
}: AppProxyDashboardPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <header className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-rose-600">
          <BuildingOfficeIcon className="h-6 w-6" aria-hidden />
          {companyName ?? "Ukjent selskap"}
        </h1>
        <p className="text-sm text-slate-500">
          {orgNumber ? `Org.nr: ${orgNumber}` : "Org.nr: ikke tilgjengelig"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Innlogget som: <span className="font-medium">{customerName ?? "Ukjent bruker"}</span>
        </p>
      </header>

      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white pt-1 shadow-sm">
          <AccountTabs activeTab={activeTab} storefrontTabsBaseUrl={storefrontTabsBaseUrl} />
          <AccountTabBoilerplate
            activeTab={activeTab}
            companyMembers={companyMembers}
            addresses={addresses}
            formMode={formMode}
            editingAddressId={editingAddressId}
            actionError={actionError}
            storefrontTabsBaseUrl={storefrontTabsBaseUrl}
          />
        </section>

        {activeTab === "ordrer" ? (
          <section className="space-y-4">
            <QuickActions />
            <StatsGrid />
          </section>
        ) : null}
      </div>
    </main>
  );
}
