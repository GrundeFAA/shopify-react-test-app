import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import type { inferRouterInputs } from "@trpc/server";
import { useEffect, useMemo, useState } from "react";
import { AccountTabBoilerplate } from "../../frontend/components/dashboard/AccountTabBoilerplate";
import { AccountTabs, type AccountTabId } from "../../frontend/components/dashboard/AccountTabs";
import { QuickActions } from "../../frontend/components/dashboard/QuickActions";
import { StatsGrid } from "../../frontend/components/dashboard/StatsGrid";
import type { B2BHttpRouter } from "../../server/trpc/routers/b2b-http.server";
import { trpc } from "../trpc";

type RouterInputs = inferRouterInputs<B2BHttpRouter>;
type CreateAddressInput = RouterInputs["b2b"]["createCompanyAddress"];
type UpdateAddressInput = RouterInputs["b2b"]["updateCompanyAddress"];

const validTabs: AccountTabId[] = [
  "min-konto",
  "selskap",
  "brukere",
  "adresser",
  "ordrer",
];

function parseTabFromUrl(): AccountTabId {
  const params = new URLSearchParams(window.location.search);
  const requestedTab = params.get("tab");
  return validTabs.includes(requestedTab as AccountTabId)
    ? (requestedTab as AccountTabId)
    : "brukere";
}

function updateTabInUrl(tab: AccountTabId) {
  const params = new URLSearchParams(window.location.search);
  params.set("tab", tab);
  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`;
  window.history.pushState({}, "", nextUrl);
}

function toNullableString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toRequiredString(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toAddressCreateInput(formData: FormData): CreateAddressInput {
  const typeValue = formData.get("type");
  if (typeValue !== "BILLING" && typeValue !== "SHIPPING") {
    throw new Error("Ugyldig adressetype.");
  }

  return {
    type: typeValue,
    label: toNullableString(formData.get("label")),
    isDefault: formData.get("isDefault") === "on",
    firstName: toNullableString(formData.get("firstName")),
    lastName: toNullableString(formData.get("lastName")),
    company: toNullableString(formData.get("company")),
    address1: toRequiredString(formData.get("address1")),
    address2: toNullableString(formData.get("address2")),
    city: toRequiredString(formData.get("city")),
    province: toNullableString(formData.get("province")),
    zip: toRequiredString(formData.get("zip")),
    country: toRequiredString(formData.get("country")),
    phone: toNullableString(formData.get("phone")),
  };
}

function toAddressUpdateInput(addressId: string, formData: FormData): UpdateAddressInput {
  return {
    id: addressId,
    ...toAddressCreateInput(formData),
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "En ukjent feil oppstod. Prøv igjen.";
}

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<AccountTabId>(() => parseTabFromUrl());
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const dashboardQuery = trpc.b2b.getDashboardForContextCustomer.useQuery();

  useEffect(() => {
    const onPopState = () => setActiveTab(parseTabFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const createAddressMutation = trpc.b2b.createCompanyAddress.useMutation();
  const updateAddressMutation = trpc.b2b.updateCompanyAddress.useMutation();
  const deleteAddressMutation = trpc.b2b.deleteCompanyAddress.useMutation();

  const isAddressSubmitting =
    createAddressMutation.isPending ||
    updateAddressMutation.isPending ||
    deleteAddressMutation.isPending;

  const refreshDashboard = async () => {
    await utils.b2b.getDashboardForContextCustomer.invalidate();
  };

  const handleTabChange = (tab: AccountTabId) => {
    setActiveTab(tab);
    updateTabInUrl(tab);
    setFormMode(null);
    setEditingAddressId(null);
    setActionError(null);
  };

  const onStartCreateAddress = () => {
    setActiveTab("adresser");
    updateTabInUrl("adresser");
    setFormMode("create");
    setEditingAddressId(null);
    setActionError(null);
  };

  const onStartEditAddress = (addressId: string) => {
    setActiveTab("adresser");
    updateTabInUrl("adresser");
    setFormMode("edit");
    setEditingAddressId(addressId);
    setActionError(null);
  };

  const onCancelAddressForm = () => {
    setFormMode(null);
    setEditingAddressId(null);
    setActionError(null);
  };

  const onCreateAddress = async (formData: FormData) => {
    try {
      setActionError(null);
      await createAddressMutation.mutateAsync(toAddressCreateInput(formData));
      await refreshDashboard();
      onCancelAddressForm();
    } catch (error) {
      setActionError(toErrorMessage(error));
    }
  };

  const onUpdateAddress = async (addressId: string, formData: FormData) => {
    try {
      setActionError(null);
      await updateAddressMutation.mutateAsync(
        toAddressUpdateInput(addressId, formData),
      );
      await refreshDashboard();
      onCancelAddressForm();
    } catch (error) {
      setActionError(toErrorMessage(error));
    }
  };

  const onDeleteAddress = async (addressId: string) => {
    try {
      setActionError(null);
      await deleteAddressMutation.mutateAsync({ id: addressId });
      await refreshDashboard();
      if (editingAddressId === addressId) {
        onCancelAddressForm();
      }
    } catch (error) {
      setActionError(toErrorMessage(error));
    }
  };

  const dashboard = dashboardQuery.data;

  const companyName = useMemo(() => {
    if (!dashboard) return null;
    return dashboard.state === "APPROVED"
      ? dashboard.company.name
      : dashboard.pendingCompanyName;
  }, [dashboard]);

  const orgNumber = useMemo(() => {
    if (!dashboard || dashboard.state !== "APPROVED") return null;
    return dashboard.company.orgNumber;
  }, [dashboard]);

  const companyMembers = useMemo(() => {
    if (!dashboard || dashboard.state !== "APPROVED") return [];
    return dashboard.members;
  }, [dashboard]);

  const addresses = useMemo(() => {
    if (!dashboard || dashboard.state !== "APPROVED") return [];
    return dashboard.addresses;
  }, [dashboard]);

  const customerName =
    dashboard?.currentCustomer?.fullName ?? dashboard?.currentCustomer?.email ?? null;

  if (dashboardQuery.isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Laster dashboard...
        </div>
      </main>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {toErrorMessage(dashboardQuery.error)}
        </div>
      </main>
    );
  }

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
        {dashboard?.state === "PENDING_OR_MISSING" ? (
          <p className="mt-2 text-sm text-amber-700">
            Kontoen din venter pa godkjenning for B2B-funksjoner.
          </p>
        ) : null}
      </header>

      <div className="space-y-4">
        <section className="rounded-lg border border-slate-200 bg-white pt-1 shadow-sm">
          <AccountTabs activeTab={activeTab} onTabChange={handleTabChange} />
          <AccountTabBoilerplate
            activeTab={activeTab}
            companyMembers={companyMembers}
            addresses={addresses}
            formMode={formMode}
            editingAddressId={editingAddressId}
            actionError={actionError}
            isAddressSubmitting={isAddressSubmitting}
            onStartCreateAddress={onStartCreateAddress}
            onStartEditAddress={onStartEditAddress}
            onCancelAddressForm={onCancelAddressForm}
            onCreateAddress={onCreateAddress}
            onUpdateAddress={onUpdateAddress}
            onDeleteAddress={onDeleteAddress}
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
