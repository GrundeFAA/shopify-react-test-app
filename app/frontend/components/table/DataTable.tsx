import type { ReactNode } from "react";

type DataTableColumn<Row> = {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: Row) => ReactNode;
};

type DataTableProps<Row> = {
  title: string;
  description: string;
  rows: Row[];
  columns: DataTableColumn<Row>[];
  getRowId: (row: Row) => string;
  actionLabel?: string;
  onActionClick?: () => void;
  actionHref?: string;
  emptyStateText?: string;
  rowAction?: {
    label: string;
    onClick?: (row: Row) => void;
  };
};

export function DataTable<Row>({
  title,
  description,
  rows,
  columns,
  getRowId,
  actionLabel,
  onActionClick,
  actionHref,
  emptyStateText = "Ingen rader funnet.",
  rowAction,
}: DataTableProps<Row>) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        </div>
        {actionLabel ? (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            {actionHref ? (
              <a
                href={actionHref}
                className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {actionLabel}
              </a>
            ) : (
              <button
                type="button"
                onClick={onActionClick}
                className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {actionLabel}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="relative min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={
                        column.headerClassName ??
                        (index === 0
                          ? "py-3 pr-3 pl-4 text-left text-xs font-medium tracking-wide text-gray-500 uppercase sm:pl-0"
                          : "px-3 py-3 text-left text-xs font-medium tracking-wide text-gray-500 uppercase")
                      }
                    >
                      {column.header}
                    </th>
                  ))}
                  {rowAction ? (
                    <th scope="col" className="py-3 pr-4 pl-3 sm:pr-0">
                      <span className="sr-only">{rowAction.label}</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (rowAction ? 1 : 0)}
                      className="py-6 text-center text-sm text-gray-500"
                    >
                      {emptyStateText}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={getRowId(row)}>
                      {columns.map((column, index) => (
                        <td
                          key={column.key}
                          className={
                            column.cellClassName ??
                            (index === 0
                              ? "py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0"
                              : "px-3 py-4 text-sm whitespace-nowrap text-gray-500")
                          }
                        >
                          {column.render(row)}
                        </td>
                      ))}
                      {rowAction ? (
                        <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                          <button
                            type="button"
                            onClick={() => rowAction.onClick?.(row)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {rowAction.label}
                          </button>
                        </td>
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
