import type { AccountTabId } from "./AccountTabs";
import { CompanyAddressesTable, type CompanyAddressRow } from "./CompanyAddressesTable";
import { CompanyUsersTable, type CompanyScopedMember } from "./CompanyUsersTable";
import { CompanyOrdersTable } from "./CompanyOrdersTable";
import { DiagnosticsPanel } from "./DiagnosticsPanel";

type AccountTabBoilerplateProps = {
  activeTab: AccountTabId;
  companyMembers: CompanyScopedMember[];
  addresses: CompanyAddressRow[];
  formMode: "create" | "edit" | null;
  editingAddressId: string | null;
  actionError: string | null;
  isAddressSubmitting: boolean;
  onStartCreateAddress: () => void;
  onStartEditAddress: (addressId: string) => void;
  onCancelAddressForm: () => void;
  onCreateAddress: (formData: FormData) => Promise<void>;
  onUpdateAddress: (addressId: string, formData: FormData) => Promise<void>;
  onDeleteAddress: (addressId: string) => Promise<void>;
  diagnostics: {
    shop: string | null;
    loggedInCustomerId: string | null;
    currentCustomerName: string | null;
    currentCustomerEmail: string | null;
    isFetching: boolean;
    onRefresh: () => void;
    dashboardPayload: unknown;
  };
};

type BoilerplateContent = {
  title: string;
  description: string;
  bullets: string[];
};

const contentByTab: Record<AccountTabId, BoilerplateContent> = {
  "min-konto": {
    title: "Min konto",
    description: "Her kan kunden administrere egen profil, innstillinger og samtykker.",
    bullets: [
      "Vis og oppdater kontaktinformasjon",
      "Endre passord eller innloggingsmetode",
      "Administrer varsler og samtykker",
    ],
  },
  selskap: {
    title: "Selskap",
    description: "Oversikt over bedriftsinformasjon som er knyttet til denne kunden.",
    bullets: [
      "Firmanavn og organisasjonsnummer",
      "Kreditt- og betalingsinformasjon",
      "Avtalevilkar og kundestatus",
    ],
  },
  brukere: {
    title: "Brukere",
    description: "Administrer brukere og roller for bedriften.",
    bullets: [
      "Inviter nye brukere",
      "Sett roller og tilgangsniva",
      "Godkjenn eller deaktiver medlemmer",
    ],
  },
  adresser: {
    title: "Adresser",
    description: "Administrer leverings- og fakturaadresser.",
    bullets: [
      "Legg til og rediger adresser",
      "Sett standard leveringsadresse",
      "Knytt adresser til spesifikke avdelinger",
    ],
  },
  ordrer: {
    title: "Ordrer",
    description: "Få oversikt over ordre, tilbud og historikk.",
    bullets: [
      "Se aktive ordre og ordrestatus",
      "Se tilbud og tidligere bestillinger",
      "Bestill pa nytt fra historikk",
    ],
  },
  diagnostikk: {
    title: "Diagnostikk",
    description: "Bruk denne fanen for live feilsøking av identitets- og enrich-flow.",
    bullets: [],
  },
};

export function AccountTabBoilerplate({
  activeTab,
  companyMembers,
  addresses,
  formMode,
  editingAddressId,
  actionError,
  isAddressSubmitting,
  onStartCreateAddress,
  onStartEditAddress,
  onCancelAddressForm,
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
  diagnostics,
}: AccountTabBoilerplateProps) {
  const content = contentByTab[activeTab];

  return (
    <section id={`tab-${activeTab}`} className="px-4 pb-4">
      <h2 className="text-lg font-semibold text-neutral-charcoal">{content.title}</h2>
      <p className="mt-1 text-sm text-neutral-silver">{content.description}</p>

      {activeTab === "brukere" ? (
        <div className="mt-4">
          <CompanyUsersTable members={companyMembers} />
        </div>
      ) : activeTab === "adresser" ? (
        <div className="mt-4">
          <CompanyAddressesTable
            addresses={addresses}
            formMode={formMode}
            editingAddressId={editingAddressId}
            actionError={actionError}
            isSubmitting={isAddressSubmitting}
            onStartCreate={onStartCreateAddress}
            onStartEdit={onStartEditAddress}
            onCancelForm={onCancelAddressForm}
            onCreateAddress={onCreateAddress}
            onUpdateAddress={onUpdateAddress}
            onDeleteAddress={onDeleteAddress}
          />
        </div>
      ) : activeTab === "ordrer" ? (
        <div className="mt-4">
          <CompanyOrdersTable />
        </div>
      ) : activeTab === "diagnostikk" ? (
        <DiagnosticsPanel
          shop={diagnostics.shop}
          loggedInCustomerId={diagnostics.loggedInCustomerId}
          currentCustomerName={diagnostics.currentCustomerName}
          currentCustomerEmail={diagnostics.currentCustomerEmail}
          members={companyMembers}
          isFetching={diagnostics.isFetching}
          onRefresh={diagnostics.onRefresh}
          dashboardPayload={diagnostics.dashboardPayload}
        />
      ) : (
        <div className="mt-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-charcoal-light">
            {content.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
