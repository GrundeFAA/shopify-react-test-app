import { useState } from "react";
import { DataTable } from "../table/DataTable";

export type CompanyScopedMember = {
  id: string;
  shopifyCustomerId: string;
  fullName: string | null;
  email: string | null;
  role: string;
  status: string;
};

type CompanyUsersTableProps = {
  members: CompanyScopedMember[];
};

export function CompanyUsersTable({ members }: CompanyUsersTableProps) {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {notice ? (
        <div className="rounded-md border border-semantic-info-border bg-semantic-info px-3 py-2 text-sm text-brand-secondary">
          {notice}
        </div>
      ) : null}
      <DataTable
        title="Brukere"
        description="Alle brukere knyttet til valgt selskap i denne shop-scope."
        rows={members}
        getRowId={(row) => row.id}
        actionLabel="Legg til bruker"
        onActionClick={() =>
          setNotice("Legg til bruker kommer snart. Vi kobler dette til Shopify customer-invite flow.")
        }
        emptyStateText="Ingen brukere funnet for selskapet enda."
        rowAction={{
          label: "Rediger",
          onClick: (row) =>
            setNotice(`Redigering for ${row.fullName ?? row.shopifyCustomerId} kommer snart.`),
        }}
        columns={[
          {
            key: "name",
            header: "Navn",
            render: (row) => row.fullName ?? `Kunde ${row.shopifyCustomerId}`,
          },
          {
            key: "title",
            header: "Tittel",
            render: (row) => (row.role === "ADMIN" ? "Administrator" : "Bruker"),
          },
          {
            key: "email",
            header: "E-post",
            render: (row) => row.email ?? "Ikke tilgjengelig",
          },
          {
            key: "role",
            header: "Rolle",
            render: (row) => `${row.role} (${row.status})`,
          },
        ]}
      />
    </div>
  );
}
