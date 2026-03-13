import type { AccountTabId } from "./AccountTabs";
import { CompanyAddressesTable } from "./CompanyAddressesTable";
import { CompanyUsersTable, type CompanyScopedMember } from "./CompanyUsersTable";
import { CompanyOrdersTable } from "./CompanyOrdersTable";

type AccountTabBoilerplateProps = {
  activeTab: AccountTabId;
  companyMembers: CompanyScopedMember[];
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
};

export function AccountTabBoilerplate({
  activeTab,
  companyMembers,
}: AccountTabBoilerplateProps) {
  const content = contentByTab[activeTab];

  return (
    <section id={`tab-${activeTab}`} className="px-4 pb-4">
      <h2 className="text-lg font-semibold text-slate-900">{content.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{content.description}</p>

      {activeTab === "brukere" ? (
        <div className="mt-4">
          <CompanyUsersTable members={companyMembers} />
        </div>
      ) : activeTab === "adresser" ? (
        <div className="mt-4">
          <CompanyAddressesTable />
        </div>
      ) : activeTab === "ordrer" ? (
        <div className="mt-4">
          <CompanyOrdersTable />
        </div>
      ) : (
        <div className="mt-4">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {content.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
