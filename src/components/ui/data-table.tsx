import { cn } from "@/utils/cn";

type DataTableProps = {
  columns: readonly string[];
  minWidth?: string;
  isEmpty?: boolean;
  emptyLabel?: string;
  children: React.ReactNode;
};

export function DataTable({
  columns,
  minWidth = "860px",
  isEmpty = false,
  emptyLabel = "Nothing to show.",
  children,
}: DataTableProps) {
  return (
    <div className="card overflow-x-auto">
      <table className={cn("w-full text-left")} style={{ minWidth }}>
        <thead>
          <tr className="border-b border-ink-100 text-[12px] uppercase tracking-wider text-ink-500">
            {columns.map((column, index) => (
              <th key={column || `spacer-${index}`} className="px-5 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>

      {isEmpty && <p className="px-5 py-12 text-center text-[14px] text-ink-500">{emptyLabel}</p>}
    </div>
  );
}
