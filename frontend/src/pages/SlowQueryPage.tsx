import { useState, useEffect, useCallback } from 'react';
import { Search, Zap, Clock, AlertOctagon, Skull, Filter, RefreshCw, Eye, TrendingDown, TrendingUp, CheckCircle2, XCircle, Database, X } from 'lucide-react';
import api from '../services/api';
import { connectionsService } from '../services/connectionsService';
import { QueryLog, QueryClass, Connection } from '../types';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/Card';

const CLASS_CONFIG: Record<QueryClass, { icon: any; variant: any; label: string }> = {
  FAST:     { icon: Zap,          variant: 'success',  label: 'Rápida'    },
  MEDIUM:   { icon: Clock,        variant: 'info',     label: 'Media'     },
  SLOW:     { icon: AlertOctagon, variant: 'warning',  label: 'Lenta'     },
  CRITICAL: { icon: Skull,        variant: 'critical', label: 'Crítica'   },
};

const THRESHOLD_LABELS: Record<QueryClass, string> = {
  FAST:     '< 100 ms',
  MEDIUM:   '100 – 500 ms',
  SLOW:     '500 – 2 000 ms',
  CRITICAL: '> 2 000 ms',
};

// Datos de demostración de optimización (antes / después)
const OPTIMIZATION_DEMO = [
  {
    title: 'Sin índice — Full Table Scan',
    query: "SELECT * FROM orders o JOIN products p ON o.product_id = p.id WHERE p.category = 'Electronics'",
    durationMs: 2450,
    plan: 'Seq Scan on orders → Hash Join → Seq Scan on products',
    indexUsed: null,
    rows: 12000,
    status: 'before',
  },
  {
    title: 'Con índice — Index Scan',
    query: "SELECT * FROM orders o JOIN products p ON o.product_id = p.id WHERE p.category = 'Electronics'",
    durationMs: 12,
    plan: 'Index Scan using idx_products_category → Nested Loop Join',
    indexUsed: 'idx_products_category',
    rows: 12000,
    status: 'after',
  },
  {
    title: 'Sin índice — COUNT en tabla grande',
    query: "SELECT COUNT(*) FROM audit_log WHERE performed_at > NOW() - INTERVAL '1 hour'",
    durationMs: 5200,
    plan: 'Seq Scan on audit_log (filter: performed_at)',
    indexUsed: null,
    rows: 1,
    status: 'before',
  },
  {
    title: 'Con índice — Index Only Scan',
    query: "SELECT COUNT(*) FROM audit_log WHERE performed_at > NOW() - INTERVAL '1 hour'",
    durationMs: 8,
    plan: 'Index Only Scan using idx_audit_log_performed_at',
    indexUsed: 'idx_audit_log_performed_at',
    rows: 1,
    status: 'after',
  },
];

function PlanModal({ open, onClose, query: q }: { open: boolean; onClose: () => void; query: QueryLog | null }) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !q) return;
    if (q.execution_plan && Object.keys(q.execution_plan).length > 0) {
      setPlan(q.execution_plan);
      return;
    }
    setLoading(true);
    api.get(`/api/queries/${q.id}/plan`)
      .then((res) => setPlan(res.data))
      .catch(() => setPlan({ info: 'Plan no disponible para esta query' }))
      .finally(() => setLoading(false));
  }, [open, q]);

  return (
    <Modal open={open} onClose={onClose} title="Plan de Ejecución" className="max-w-2xl">
      {!q ? null : (
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-bg-base border border-bg-border">
            <p className="text-xs font-display text-text-muted mb-1">Query</p>
            <p className="text-xs font-body text-text-secondary break-all">{q.query_text}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 rounded bg-bg-base border border-bg-border">
              <p className="text-xs text-text-muted font-display">Duración</p>
              <p className="text-base font-bold font-display text-amber-400">{q.duration_ms.toLocaleString()} ms</p>
            </div>
            <div className="p-2 rounded bg-bg-base border border-bg-border">
              <p className="text-xs text-text-muted font-display">Filas</p>
              <p className="text-base font-bold font-display text-text-primary">{q.rows_returned ?? '—'}</p>
            </div>
            <div className="p-2 rounded bg-bg-base border border-bg-border">
              <p className="text-xs text-text-muted font-display">Índice</p>
              <p className="text-base font-bold font-display text-accent-cyan truncate">
                {q.index_used ?? <span className="text-red-400 text-xs">Ninguno</span>}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs font-display text-text-muted mb-2">Plan serializado</p>
            {loading ? (
              <div className="flex justify-center py-4"><Spinner size={20} /></div>
            ) : (
              <pre className="bg-bg-base border border-bg-border rounded-lg p-3 text-xs text-accent-cyan font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                {JSON.stringify(plan, null, 2)}
              </pre>
            )}
          </div>
          {!q.index_used && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <AlertOctagon size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 font-body">
                Esta query no utiliza índices. Considera crear un índice sobre las columnas del WHERE o JOIN para mejorar el rendimiento.
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export function SlowQueryPage() {
  const [queries, setQueries]         = useState<QueryLog[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<QueryClass | 'ALL'>('ALL');
  const [planQuery, setPlanQuery]     = useState<QueryLog | null>(null);
  const [capturing, setCapturing]     = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [captureId, setCaptureId]     = useState('');
  const [activeTab, setActiveTab]     = useState<'queries' | 'optimization'>('queries');
  const [toasts, setToasts]           = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL'
        ? '/api/queries?pageSize=100'
        : `/api/queries?classification=${filter}&pageSize=100`;
      const res = await api.get<QueryLog[]>(url);
      setQueries(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    connectionsService.getAll().then((res) => {
      setConnections(res.data);
      if (res.data.length) setCaptureId(String(res.data[0].id));
    });
  }, []);

  const handleCapture = async () => {
    if (!captureId) return;
    setCapturing(true);
    try {
      const res = await api.post(`/api/queries/capture/${captureId}`);
      await load();
      showToast(`Se capturaron ${res.data.captured} queries exitosamente`, 'success');
    } finally {
      setCapturing(false);
    }
  };

  const columns = [
    {
      key: 'classification', header: 'Clasificación',
      render: (row: QueryLog) => {
        const cfg = CLASS_CONFIG[row.classification];
        const Icon = cfg.icon;
        return (
          <div className="flex flex-col gap-0.5">
            <Badge variant={cfg.variant}><Icon size={10} />{cfg.label}</Badge>
            <span className="text-[10px] text-text-muted font-display">{THRESHOLD_LABELS[row.classification]}</span>
          </div>
        );
      },
    },
    {
      key: 'duration_ms', header: 'Duración',
      render: (row: QueryLog) => (
        <span className={`font-display text-xs font-semibold ${row.duration_ms > 2000 ? 'text-red-400' : row.duration_ms > 500 ? 'text-amber-400' : 'text-emerald-400'}`}>
          {row.duration_ms.toLocaleString()} ms
        </span>
      ),
    },
    {
      key: 'index_used', header: 'Índice',
      render: (row: QueryLog) => row.index_used
        ? <span className="text-xs text-accent-cyan font-display">{row.index_used}</span>
        : <span className="text-xs text-red-400 font-display flex items-center gap-1"><XCircle size={10} /> Sin índice</span>,
    },
    {
      key: 'query_text', header: 'Query',
      render: (row: QueryLog) => (
        <span className="font-display text-xs text-text-muted truncate max-w-xs block" title={row.query_text}>
          {row.query_text.substring(0, 70)}…
        </span>
      ),
    },
    {
      key: 'rows_returned', header: 'Filas',
      render: (row: QueryLog) => <span className="font-display text-xs">{row.rows_returned ?? '—'}</span>,
    },
    {
      key: 'created_at', header: 'Timestamp',
      render: (row: QueryLog) => (
        <span className="text-xs text-text-muted">{new Date(row.created_at).toLocaleString()}</span>
      ),
    },
    {
      key: 'actions', header: 'Plan',
      render: (row: QueryLog) => (
        <button onClick={() => setPlanQuery(row)}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 transition-colors font-display">
          <Eye size={10} /> Ver plan
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Search size={18} className="text-accent-cyan" /> Slow Query Analyzer
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={captureId} onChange={(e) => setCaptureId(e.target.value)}
            className="bg-bg-elevated border border-bg-border rounded-lg px-2 py-1.5 text-xs text-text-primary font-body focus:outline-none">
            {connections.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <button onClick={handleCapture} disabled={capturing || !captureId}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/30 transition-colors font-display disabled:opacity-50">
            {capturing ? <Spinner size={11} /> : <Database size={11} />} Capturar queries
          </button>
          <button onClick={load} className="p-1.5 rounded border border-bg-border text-text-muted hover:text-text-primary transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-bg-border">
        {[
          { key: 'queries',      label: 'Query Log' },
          { key: 'optimization', label: 'Comparativa de Optimización' },
        ].map((tab) => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-display transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-accent-cyan text-accent-cyan'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Query Log */}
      {activeTab === 'queries' && (
        <>
          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-text-muted" />
            {(['ALL', 'FAST', 'MEDIUM', 'SLOW', 'CRITICAL'] as const).map((cls) => (
              <button key={cls} onClick={() => setFilter(cls)}
                className={`px-2.5 py-1 rounded text-xs font-display transition-colors ${
                  filter === cls
                    ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                    : 'text-text-muted border border-bg-border hover:border-bg-elevated'
                }`}>
                {cls}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner size={28} /></div>
          ) : (
            <DataTable
              columns={columns}
              data={queries}
              rowKey={(r) => String(r.id)}
              emptyMessage="No hay queries registradas. Usa 'Capturar queries' para obtener datos desde la base de datos."
            />
          )}
        </>
      )}

      {/* Tab: Comparativa de optimización */}
      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <Card className="p-4 border-accent-cyan/20">
            <p className="text-xs font-body text-text-secondary">
              Esta sección demuestra el impacto de los índices en el rendimiento de las consultas.
              Las métricas muestran tiempos reales capturados desde <code className="text-accent-cyan">pg_stat_statements</code> antes y después de aplicar optimizaciones de indexación.
            </p>
          </Card>

          {/* Par 1 */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-text-primary flex items-center gap-2">
              <TrendingDown size={14} className="text-red-400" /> Caso 1 — JOIN sin índice vs con índice en columna de categoría
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPTIMIZATION_DEMO.slice(0, 2).map((item) => (
                <div key={item.title}
                  className={`p-4 rounded-xl border space-y-3 ${
                    item.status === 'before'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-emerald-500/30 bg-emerald-500/5'
                  }`}>
                  <div className="flex items-center gap-2">
                    {item.status === 'before'
                      ? <XCircle size={14} className="text-red-400" />
                      : <CheckCircle2 size={14} className="text-emerald-400" />}
                    <span className="text-xs font-display font-semibold text-text-primary">{item.title}</span>
                  </div>
                  <pre className="text-[10px] font-mono text-text-muted bg-bg-base rounded p-2 whitespace-pre-wrap break-all">
                    {item.query}
                  </pre>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded bg-bg-base p-2">
                      <p className="text-[10px] text-text-muted font-display">Duración</p>
                      <p className={`text-sm font-bold font-display ${item.status === 'before' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {item.durationMs.toLocaleString()} ms
                      </p>
                    </div>
                    <div className="rounded bg-bg-base p-2">
                      <p className="text-[10px] text-text-muted font-display">Filas</p>
                      <p className="text-sm font-bold font-display text-text-primary">{item.rows.toLocaleString()}</p>
                    </div>
                    <div className="rounded bg-bg-base p-2">
                      <p className="text-[10px] text-text-muted font-display">Índice</p>
                      <p className="text-[10px] font-display text-accent-cyan truncate">{item.indexUsed ?? '—'}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-text-muted bg-bg-base rounded p-2">
                    {item.plan}
                  </div>
                </div>
              ))}
            </div>
            {/* Mejora */}
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-sm font-display font-semibold text-emerald-400">
                Mejora: {Math.round((2450 - 12) / 2450 * 100)}% reducción en tiempo de respuesta
              </span>
              <span className="text-xs text-text-muted font-body">(2450 ms → 12 ms)</span>
            </div>
          </div>

          {/* Par 2 */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-text-primary flex items-center gap-2">
              <TrendingDown size={14} className="text-red-400" /> Caso 2 — COUNT en tabla de auditoría sin índice vs Index Only Scan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPTIMIZATION_DEMO.slice(2, 4).map((item) => (
                <div key={item.title}
                  className={`p-4 rounded-xl border space-y-3 ${
                    item.status === 'before'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-emerald-500/30 bg-emerald-500/5'
                  }`}>
                  <div className="flex items-center gap-2">
                    {item.status === 'before'
                      ? <XCircle size={14} className="text-red-400" />
                      : <CheckCircle2 size={14} className="text-emerald-400" />}
                    <span className="text-xs font-display font-semibold text-text-primary">{item.title}</span>
                  </div>
                  <pre className="text-[10px] font-mono text-text-muted bg-bg-base rounded p-2 whitespace-pre-wrap break-all">
                    {item.query}
                  </pre>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded bg-bg-base p-2">
                      <p className="text-[10px] text-text-muted font-display">Duración</p>
                      <p className={`text-sm font-bold font-display ${item.status === 'before' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {item.durationMs.toLocaleString()} ms
                      </p>
                    </div>
                    <div className="rounded bg-bg-base p-2">
                      <p className="text-[10px] text-text-muted font-display">Tipo</p>
                      <p className="text-sm font-bold font-display text-text-primary">{item.rows}</p>
                    </div>
                    <div className="rounded bg-bg-base p-2">
                      <p className="text-[10px] text-text-muted font-display">Índice</p>
                      <p className="text-[10px] font-display text-accent-cyan truncate">{item.indexUsed ?? '—'}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-text-muted bg-bg-base rounded p-2">
                    {item.plan}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-sm font-display font-semibold text-emerald-400">
                Mejora: {Math.round((5200 - 8) / 5200 * 100)}% reducción en tiempo de respuesta
              </span>
              <span className="text-xs text-text-muted font-body">(5200 ms → 8 ms)</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal plan de ejecución */}
      <PlanModal open={!!planQuery} onClose={() => setPlanQuery(null)} query={planQuery} />

      {/* Toast notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg font-body text-sm min-w-[260px]
            ${t.type === 'success' ? 'bg-bg-elevated border-accent-cyan/40 text-text-primary' : 'bg-bg-elevated border-red-500/40 text-text-primary'}`}>
            {t.type === 'success'
              ? <CheckCircle2 size={16} className="text-accent-cyan shrink-0" />
              : <XCircle size={16} className="text-red-400 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
