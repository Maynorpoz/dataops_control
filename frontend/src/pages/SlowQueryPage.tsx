import { useState, useEffect } from 'react';
import { Search, Zap, Clock, AlertOctagon, Skull, Filter, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { QueryLog, QueryClass } from '../types';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

const CLASS_CONFIG: Record<QueryClass, { icon: any; variant: any; label: string }> = {
  FAST:     { icon: Zap,          variant: 'success',  label: 'Rápida' },
  MEDIUM:   { icon: Clock,        variant: 'info',     label: 'Media' },
  SLOW:     { icon: AlertOctagon, variant: 'warning',  label: 'Lenta' },
  CRITICAL: { icon: Skull,        variant: 'critical', label: 'Crítica' },
};

export function SlowQueryPage() {
  const [queries, setQueries] = useState<QueryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QueryClass | 'ALL'>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' ? '/api/queries?pageSize=100' : `/api/queries?classification=${filter}&pageSize=100`;
      const res = await api.get<QueryLog[]>(url);
      setQueries(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const columns = [
    {
      key: 'classification', header: 'Clasificación',
      render: (row: QueryLog) => {
        const cfg = CLASS_CONFIG[row.classification];
        const Icon = cfg.icon;
        return <Badge variant={cfg.variant}><Icon size={10} />{cfg.label}</Badge>;
      },
    },
    { key: 'duration_ms', header: 'Duración (ms)', render: (row: QueryLog) => (
      <span className="font-display text-xs">{row.duration_ms.toLocaleString()} ms</span>
    )},
    { key: 'query_text', header: 'Query', render: (row: QueryLog) => (
      <span className="font-display text-xs text-text-muted truncate max-w-xs block" title={row.query_text}>
        {row.query_text.substring(0, 80)}…
      </span>
    )},
    { key: 'rows_returned', header: 'Filas', render: (row: QueryLog) => (
      <span className="font-display text-xs">{row.rows_returned ?? '—'}</span>
    )},
    { key: 'created_at', header: 'Timestamp', render: (row: QueryLog) => (
      <span className="text-xs text-text-muted">{new Date(row.created_at).toLocaleString()}</span>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Search size={18} className="text-accent-cyan" /> Slow Query Analyzer
        </h1>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-muted" />
          {(['ALL', 'FAST', 'MEDIUM', 'SLOW', 'CRITICAL'] as const).map((cls) => (
            <button key={cls} onClick={() => setFilter(cls)}
              className={`px-2.5 py-1 rounded text-xs font-display transition-colors ${filter === cls ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30' : 'text-text-muted border border-bg-border hover:border-bg-elevated'}`}>
              {cls}
            </button>
          ))}
          <button onClick={load} className="p-1.5 rounded border border-bg-border text-text-muted hover:text-text-primary transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : (
        <DataTable
          columns={columns}
          data={queries}
          rowKey={(r) => String(r.id)}
          emptyMessage="No hay queries registradas. Ejecuta una captura desde Conexiones."
        />
      )}
    </div>
  );
}
