import { useState } from "react";
import { DataTable } from "../table/DataTable";

type MockAddressRow = {
  id: string;
  navn: string;
  type: "Levering" | "Faktura";
  adresse: string;
  poststed: string;
  standard: "Ja" | "Nei";
};

const mockAddresses: MockAddressRow[] = [
  {
    id: "addr-1",
    navn: "Hovedlager Lillestrom",
    type: "Levering",
    adresse: "Industriveien 10",
    poststed: "2000 Lillestrom",
    standard: "Ja",
  },
  {
    id: "addr-2",
    navn: "Prosjekt Oslo Vest",
    type: "Levering",
    adresse: "Drammensveien 120",
    poststed: "0277 Oslo",
    standard: "Nei",
  },
  {
    id: "addr-3",
    navn: "Reolteknikk AS (Faktura)",
    type: "Faktura",
    adresse: "Postboks 45",
    poststed: "2001 Lillestrom",
    standard: "Ja",
  },
];

export function CompanyAddressesTable() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {notice ? (
        <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          {notice}
        </div>
      ) : null}
      <DataTable
        title="Adresser"
        description="Leverings- og fakturaadresser knyttet til selskapet."
        rows={mockAddresses}
        getRowId={(row) => row.id}
        actionLabel="Legg til adresse"
        onActionClick={() => setNotice("Legg til adresse kommer snart.")}
        emptyStateText="Ingen adresser funnet."
        rowAction={{
          label: "Rediger",
          onClick: (row) => setNotice(`Redigering for ${row.navn} kommer snart.`),
        }}
        columns={[
          {
            key: "navn",
            header: "Navn",
            render: (row) => row.navn,
          },
          {
            key: "type",
            header: "Type",
            render: (row) => row.type,
          },
          {
            key: "adresse",
            header: "Adresse",
            render: (row) => row.adresse,
          },
          {
            key: "poststed",
            header: "Poststed",
            render: (row) => row.poststed,
          },
          {
            key: "standard",
            header: "Standard",
            render: (row) => row.standard,
          },
        ]}
      />
    </div>
  );
}
