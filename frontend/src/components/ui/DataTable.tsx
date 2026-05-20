import { clsx } from 'clsx';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, rowKey, onRowClick, emptyMessage = 'No data available' }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-bg-border">
      <table className="w-full text-sm font-body">
        <thead>
          <tr className="border-b border-bg-border bg-bg-elevated">
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-left text-xs font-semibold font-display text-text-muted uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={clsx(
                  'border-b border-bg-border/50 hover:bg-bg-elevated/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={clsx('px-4 py-3 text-text-secondary', col.className)}>
                    {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
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
