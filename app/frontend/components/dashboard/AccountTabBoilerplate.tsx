import type { AccountTabId } from "./AccountTabs";

type AccountTabBoilerplateProps = {
  activeTab: AccountTabId;
  customerName: string | null;
  companyName: string | null;
  orgNumber: string | null;
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
  customerName,
  companyName,
  orgNumber,
}: AccountTabBoilerplateProps) {
  const content = contentByTab[activeTab];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{content.title}</h2>
      <p className="mt-1 text-sm text-slate-600">{content.description}</p>

      <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
        <p>
          Kunde: <span className="font-medium">{customerName ?? "Ukjent bruker"}</span>
        </p>
        <p>
          Selskap: <span className="font-medium">{companyName ?? "Ukjent selskap"}</span>
        </p>
        <p>
          Org.nr: <span className="font-medium">{orgNumber ?? "Ikke tilgjengelig"}</span>
        </p>
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {content.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
