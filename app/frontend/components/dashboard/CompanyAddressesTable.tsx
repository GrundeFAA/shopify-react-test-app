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
  formMode: "create" | "edit" | null;
  editingAddressId: string | null;
  actionError: string | null;
  isSubmitting: boolean;
  onStartCreate: () => void;
  onStartEdit: (addressId: string) => void;
  onCancelForm: () => void;
  onCreateAddress: (formData: FormData) => Promise<void>;
  onUpdateAddress: (addressId: string, formData: FormData) => Promise<void>;
  onDeleteAddress: (addressId: string) => Promise<void>;
};

type AddressFormProps = {
  mode: "create" | "edit";
  submitLabel: string;
  address?: CompanyAddressRow | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
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

function AddressForm({
  mode,
  submitLabel,
  address,
  isSubmitting,
  onCancel,
  onSubmit,
}: AddressFormProps) {
  const isEditing = mode === "edit" && !!address;

  return (
    <form
      className="space-y-3 rounded-md border border-slate-200 !bg-slate-50 p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        await onSubmit(new FormData(form));
      }}
    >
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
          className="btn btn-primary"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onCancel}
          className="btn btn-tertiary"
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}

export function CompanyAddressesTable({
  addresses,
  formMode,
  editingAddressId,
  actionError,
  isSubmitting,
  onStartCreate,
  onStartEdit,
  onCancelForm,
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
}: CompanyAddressesTableProps) {
  const showCreateForm = formMode === "create";
  const editingAddress =
    formMode === "edit" && editingAddressId
      ? (addresses.find((address) => address.id === editingAddressId) ?? null)
      : null;

  return (
    <div className="space-y-3">
      {actionError ? (
        <div className="rounded-md border border-rose-200 !bg-rose-50 px-4 py-3 text-sm !text-rose-700">
          <strong>Feil:</strong> {actionError}
        </div>
      ) : null}

      {showCreateForm ? (
        <AddressForm
          mode="create"
          submitLabel="Opprett adresse"
          isSubmitting={isSubmitting}
          onCancel={onCancelForm}
          onSubmit={onCreateAddress}
        />
      ) : null}

      {editingAddress ? (
        <AddressForm
          mode="edit"
          address={editingAddress}
          submitLabel="Lagre endringer"
          isSubmitting={isSubmitting}
          onCancel={onCancelForm}
          onSubmit={async (formData) => onUpdateAddress(editingAddress.id, formData)}
        />
      ) : null}

      <DataTable
        title="Adresser"
        description="Leverings- og fakturaadresser knyttet til selskapet."
        rows={addresses}
        getRowId={(row) => row.id}
        actionLabel="Legg til adresse"
        onActionClick={onStartCreate}
        emptyStateText="Ingen adresser funnet."
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
            key: "rediger",
            header: "Rediger",
            render: (row) => (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onStartEdit(row.id)}
                className="btn btn-sm btn-tertiary-action"
              >
                Rediger
              </button>
            ),
          },
          {
            key: "delete",
            header: "Slett",
            render: (row) => (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  void onDeleteAddress(row.id);
                }}
                className="btn btn-sm btn-danger"
              >
                Slett
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
