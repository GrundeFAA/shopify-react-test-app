import { DataTable } from "../table/DataTable";

export type CompanyScopedMember = {
  id: string;
  shopifyCustomerId: string;
  role: string;
  status: string;
};

type CompanyUsersTableProps = {
  members: CompanyScopedMember[];
};

export function CompanyUsersTable({ members }: CompanyUsersTableProps) {
  return (
    <DataTable
      title="Brukere"
      description="Alle brukere knyttet til valgt selskap i denne shop-scope."
      rows={members}
      getRowId={(row) => row.id}
      actionLabel="Legg til bruker"
      emptyStateText="Ingen brukere funnet for selskapet enda."
      rowAction={{
        label: "Rediger",
      }}
      columns={[
        {
          key: "name",
          header: "Navn",
          render: (row) => row.shopifyCustomerId,
        },
        {
          key: "title",
          header: "Tittel",
          render: (row) => (row.role === "ADMIN" ? "Administrator" : "Bruker"),
        },
        {
          key: "email",
          header: "Kunde-ID",
          render: (row) => row.shopifyCustomerId,
        },
        {
          key: "role",
          header: "Rolle",
          render: (row) => `${row.role} (${row.status})`,
        },
      ]}
    />
  );
}
