import { useMemo, useState } from "react";
import { Form, useNavigation } from "react-router";
import { DataTable } from "../table/DataTable";

export type CompanyAddressRow = {
  id: string;
  type: "BILLING" | "SHIPPING";
  label: string | null;
  isDefault: boolean;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string | null;
  zip: string;
  country: string;
  phone: string | null;
};

type CompanyAddressesTableProps = {
  addresses: CompanyAddressRow[];
};

type AddressFormProps = {
  intent: "create-address" | "update-address";
  submitLabel: string;
  address?: CompanyAddressRow | null;
  onCancel: () => void;
};

function toDisplayType(type: CompanyAddressRow["type"]): string {
  return type === "BILLING" ? "Faktura" : "Levering";
}

function toDisplayName(address: CompanyAddressRow): string {
  if (address.label) return address.label;
  const person = [address.firstName, address.lastName].filter(Boolean).join(" ").trim();
  if (person) return person;
  if (address.company) return address.company;
  return "Uten navn";
}

function AddressForm({ intent, submitLabel, address, onCancel }: AddressFormProps) {
  const isEditing = intent === "update-address" && !!address;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post" className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="intent" value={intent} />
      {isEditing ? <input type="hidden" name="id" value={address.id} /> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Type
          <select
            name="type"
            defaultValue={address?.type ?? "SHIPPING"}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          >
            <option value="SHIPPING">Levering</option>
            <option value="BILLING">Faktura</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Navn / etikett
          <input
            name="label"
            defaultValue={address?.label ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
            placeholder="Eks: Hovedlager"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Fornavn
          <input
            name="firstName"
            defaultValue={address?.firstName ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Etternavn
          <input
            name="lastName"
            defaultValue={address?.lastName ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Firma
          <input
            name="company"
            defaultValue={address?.company ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
          <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault ?? false} />
          Standardadresse
        </label>
      </div>

      <div className="grid gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Adresse 1
          <input
            name="address1"
            defaultValue={address?.address1 ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Adresse 2
          <input
            name="address2"
            defaultValue={address?.address2 ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
          By
          <input
            name="city"
            defaultValue={address?.city ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Postnummer
          <input
            name="zip"
            defaultValue={address?.zip ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Fylke
          <input
            name="province"
            defaultValue={address?.province ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Land
          <input
            name="country"
            defaultValue={address?.country ?? "Norway"}
            className="rounded-md border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Telefon
          <input
            name="phone"
            defaultValue={address?.phone ?? ""}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Lagrer..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Avbryt
        </button>
      </div>
    </Form>
  );
}

export function CompanyAddressesTable({ addresses }: CompanyAddressesTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const editingAddress = useMemo(
    () => addresses.find((address) => address.id === editingId) ?? null,
    [addresses, editingId],
  );

  return (
    <div className="space-y-3">
      {showCreateForm ? (
        <AddressForm
          intent="create-address"
          submitLabel="Opprett adresse"
          onCancel={() => setShowCreateForm(false)}
        />
      ) : null}

      {editingAddress ? (
        <AddressForm
          intent="update-address"
          address={editingAddress}
          submitLabel="Lagre endringer"
          onCancel={() => setEditingId(null)}
        />
      ) : null}

      <DataTable
        title="Adresser"
        description="Leverings- og fakturaadresser knyttet til selskapet."
        rows={addresses}
        getRowId={(row) => row.id}
        actionLabel="Legg til adresse"
        onActionClick={() => {
          setEditingId(null);
          setShowCreateForm(true);
        }}
        emptyStateText="Ingen adresser funnet."
        rowAction={{
          label: "Rediger",
          onClick: (row) => {
            setShowCreateForm(false);
            setEditingId(row.id);
          },
        }}
        columns={[
          {
            key: "navn",
            header: "Navn",
            render: (row) => toDisplayName(row),
          },
          {
            key: "type",
            header: "Type",
            render: (row) => toDisplayType(row.type),
          },
          {
            key: "adresse",
            header: "Adresse",
            render: (row) => [row.address1, row.address2].filter(Boolean).join(", "),
          },
          {
            key: "poststed",
            header: "Poststed",
            render: (row) => `${row.zip} ${row.city}`,
          },
          {
            key: "standard",
            header: "Standard",
            render: (row) => (row.isDefault ? "Ja" : "Nei"),
          },
          {
            key: "delete",
            header: "Slett",
            render: (row) => (
              <Form method="post">
                <input type="hidden" name="intent" value="delete-address" />
                <input type="hidden" name="id" value={row.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-rose-600 hover:text-rose-800"
                >
                  Slett
                </button>
              </Form>
            ),
          },
        ]}
      />
    </div>
  );
}
