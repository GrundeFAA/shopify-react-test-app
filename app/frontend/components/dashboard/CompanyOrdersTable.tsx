import { useState } from "react";
import { DataTable } from "../table/DataTable";

type MockOrderRow = {
  id: string;
  ordreNr: string;
  dato: string;
  status: "Ny" | "Behandles" | "Sendt" | "Levert";
  belop: string;
};

const mockOrders: MockOrderRow[] = [
  {
    id: "order-1",
    ordreNr: "#10521",
    dato: "2026-03-11",
    status: "Behandles",
    belop: "12 490 NOK",
  },
  {
    id: "order-2",
    ordreNr: "#10503",
    dato: "2026-03-07",
    status: "Sendt",
    belop: "4 870 NOK",
  },
  {
    id: "order-3",
    ordreNr: "#10487",
    dato: "2026-02-28",
    status: "Levert",
    belop: "21 300 NOK",
  },
];

export function CompanyOrdersTable() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {notice ? (
        <div className="rounded-md border border-semantic-info-border bg-semantic-info px-3 py-2 text-sm text-brand-secondary">
          {notice}
        </div>
      ) : null}
      <DataTable
        title="Ordrer"
        description="Siste ordre i selskapets ordrehistorikk."
        rows={mockOrders}
        getRowId={(row) => row.id}
        actionLabel="Ny bestilling"
        onActionClick={() => setNotice("Ny bestilling kommer snart.")}
        emptyStateText="Ingen ordrer funnet."
        rowAction={{
          label: "Vis",
          onClick: (row) => setNotice(`Detaljvisning for ordre ${row.ordreNr} kommer snart.`),
        }}
        columns={[
          {
            key: "ordreNr",
            header: "Ordre",
            render: (row) => row.ordreNr,
          },
          {
            key: "dato",
            header: "Dato",
            render: (row) => row.dato,
          },
          {
            key: "status",
            header: "Status",
            render: (row) => row.status,
          },
          {
            key: "belop",
            header: "Belop",
            render: (row) => row.belop,
          },
        ]}
      />
    </div>
  );
}
