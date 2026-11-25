import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T = Record<string, unknown>> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationInfo;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  rowKey?: (row: T) => string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const SKELETON_ROWS = 6;

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found.',
  pagination,
  selectable = false,
  selectedIds,
  onSelectionChange,
  rowKey = (row) => String((row as Record<string, unknown>).id ?? Math.random()),
  onSort,
  sortKey,
  sortDirection,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);

  const effectiveSortKey = sortKey ?? internalSort?.key;
  const effectiveSortDir = sortDirection ?? internalSort?.dir;

  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;
    const newDir =
      effectiveSortKey === col.key && effectiveSortDir === 'asc' ? 'desc' : 'asc';
    setInternalSort({ key: col.key, dir: newDir });
    onSort?.(col.key, newDir);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(new Set(data.map(rowKey)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (checked) next.add(id); else next.delete(id);
    onSelectionChange(next);
  };

  const allSelected = data.length > 0 && selectedIds && data.every((r) => selectedIds.has(rowKey(r)));
  const someSelected = selectedIds && data.some((r) => selectedIds.has(rowKey(r)));

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;

  const SortIcon = ({ col }: { col: Column<T> }) => {
    if (!col.sortable) return null;
    if (effectiveSortKey !== col.key)
      return <ChevronsUpDown size={13} className="text-gray-300 ml-1 flex-shrink-0" />;
    return effectiveSortDir === 'asc'
      ? <ChevronUp size={13} className="text-henna-600 ml-1 flex-shrink-0" />
      : <ChevronDown size={13} className="text-henna-600 ml-1 flex-shrink-0" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {selectable && (
                <th className="w-10 pl-4 pr-2 py-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 accent-henna-600"
                    checked={!!allSelected}
                    ref={(el) => { if (el) el.indeterminate = !allSelected && !!someSelected; }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap select-none ${col.sortable ? 'cursor-pointer hover:text-gray-800' : ''}`}
                >
                  <span className="inline-flex items-center">
                    {col.header}
                    <SortIcon col={col} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    {selectable && (
                      <td className="pl-4 pr-2 py-3">
                        <div className="h-4 w-4 bg-gray-200 rounded" />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                  <tr>
                    <td
                      colSpan={columns.length + (selectable ? 1 : 0)}
                      className="px-4 py-14 text-center text-sm text-gray-400"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )
              : data.map((row) => {
                  const id = rowKey(row);
                  const isSelected = selectedIds?.has(id) ?? false;
                  return (
                    <tr
                      key={id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-henna-50' : ''}`}
                    >
                      {selectable && (
                        <td className="pl-4 pr-2 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 accent-henna-600"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(id, e.target.checked)}
                            aria-label={`Select row ${id}`}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-3 text-gray-700">
                          {col.render
                            ? col.render(row[col.key], row)
                            : String(row[col.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Rows per page:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
              className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-henna-400"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span>
              {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}–
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - pagination.page) <= 1)
              .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => pagination.onPageChange(p as number)}
                    className={`min-w-[28px] h-7 px-2 rounded text-xs font-medium transition-colors ${
                      p === pagination.page
                        ? 'bg-henna-600 text-white'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
