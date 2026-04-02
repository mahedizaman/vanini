import { useMemo, useState } from "react";
import { HiOutlineArrowDown, HiOutlineArrowUp } from "react-icons/hi2";

import { cn } from "../../utils/cn";

/**
 * @param {Array<{ key: string, label: string, sortable?: boolean, className?: string }>} columns
 * @param {Array<Record<string, unknown>>} rows
 * @param {(row: any) => string} getRowKey
 * @param {(row: any, col: { key: string }) => React.ReactNode} renderCell
 */
export default function Table({ columns = [], rows = [], getRowKey, renderCell, className }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortable) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDir, columns]);

  const toggleSort = (key) => {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className={cn("overflow-x-auto rounded-xl border border-neutral-100 bg-white", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-600">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn("px-4 py-3 font-medium", col.className)}>
                {col.sortable ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <HiOutlineArrowUp className="h-3.5 w-3.5" />
                      ) : (
                        <HiOutlineArrowDown className="h-3.5 w-3.5" />
                      )
                    ) : null}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-neutral-600">
                No data
              </td>
            </tr>
          ) : (
            sortedRows.map((row) => (
              <tr key={getRowKey(row)} className="border-b border-neutral-100 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 text-neutral-800", col.className)}>
                    {renderCell ? renderCell(row, col) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
