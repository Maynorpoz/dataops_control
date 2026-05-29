import { useState, useEffect, useCallback } from 'react';
import { Archive, Save, GitCommit, GitMerge, Cloud, Download, Tag, ShieldCheck, Target, RefreshCw, Skull, CheckCircle2, XCircle, X } from 'lucide-react';
import { backupService } from '../services/backupService';
import { connectionsService } from '../services/connectionsService';
import { BackupHistory, BackupStatus, Connection } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { Spinner } from '../components/ui/Spinner';

const STATUS_VARIANT: Record<BackupStatus, any> = {
  SUCCESS: 'success', FAILED: 'critical', RUNNING: 'info', PENDING: 'neutral',
};

const TYPE_ICONS: Record<string, any> = {
  FULL: Save, DIFF: GitCommit, INC: GitMerge, SNAPSHOT: Tag,
};

type Toast = { id: number; message: string; type: 'success' | 'error' };

export function BackupPage() {
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [sla, setSla] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const load = async () => {
    setLoading(true);
    const [h, c, s] = await Promise.all([
      backupService.getHistory(),
      connectionsService.getAll(),
      backupService.getSla(),
    ]);
    setHistory(h.data);
    setConnections(c.data);
    setSla(s.data);
    if (c.data.length && !selectedId) setSelectedId(String(c.data[0].id));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runAction = async (action: () => Promise<any>, label: string) => {
    setRunning(label);
    try { await action(); await load(); showToast(`${label} completado exitosamente`, 'success'); }
    catch (err: any) { showToast(`Error: ${err.response?.data?.error || err.message}`, 'error'); }
    finally { setRunning(null); }
  };

  const columns = [
    { key: 'backup_type', header: 'Tipo', render: (r: BackupHistory) => {
      const Icon = TYPE_ICONS[r.backup_type] || Archive;
      return <div className="flex items-center gap-1.5 text-xs font-display"><Icon size={12} className="text-accent-cyan" />{r.backup_type}</div>;
    }},
    { key: 'status', header: 'Estado', render: (r: BackupHistory) => (
      <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
    )},
    { key: 'file_size_mb', header: 'Tamaño', render: (r: BackupHistory) => (
      <span className="font-display text-xs">{r.file_size_mb ? `${r.file_size_mb} MB` : '—'}</span>
    )},
    { key: 'file_hash', header: 'SHA-256', render: (r: BackupHistory) => (
      <div className="flex items-center gap-1 text-xs">
        {r.file_hash ? <><ShieldCheck size={10} className="text-emerald-400" /><span className="font-display text-[10px] text-text-muted">{r.file_hash.substring(0,12)}…</span></> : '—'}
      </div>
    )},
    { key: 'cloud_url', header: 'Cloud', render: (r: BackupHistory) => (
      r.cloud_url ? <Cloud size={13} className="text-accent-cyan" /> : <span className="text-text-muted text-xs">—</span>
    )},
    { key: 'created_at', header: 'Fecha', render: (r: BackupHistory) => (
      <span className="text-xs text-text-muted">{new Date(r.created_at).toLocaleString()}</span>
    )},
    { key: 'id', header: 'Restaurar', render: (r: BackupHistory) => (
      r.status === 'SUCCESS' ? (
        <button onClick={() => runAction(() => backupService.restore(r.id), 'restore')}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 transition-colors font-display">
          <Download size={10} /> Restaurar
        </button>
      ) : null
    )},
  ];

  return (
    <>
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg font-body text-sm min-w-[260px]
          ${t.type === 'success' ? 'bg-bg-elevated border-accent-cyan/40 text-text-primary' : 'bg-bg-elevated border-red-500/40 text-text-primary'}`}>
          {t.type === 'success' ? <CheckCircle2 size={16} className="text-accent-cyan shrink-0" /> : <XCircle size={16} className="text-red-400 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="text-text-muted hover:text-text-primary transition-colors"><X size={13} /></button>
        </div>
      ))}
    </div>
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Archive size={18} className="text-accent-cyan" /> Backup & Recovery
        </h1>
        <div className="flex items-center gap-2">
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
            className="bg-bg-elevated border border-bg-border rounded-lg px-3 py-1.5 text-sm text-text-primary font-body focus:outline-none">
            {connections.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <button onClick={load} className="p-1.5 rounded border border-bg-border text-text-muted hover:text-text-primary transition-colors">
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'FULL', icon: Save, action: () => backupService.runFull(parseInt(selectedId)) },
          { label: 'DIFF', icon: GitCommit, action: () => backupService.runDiff(parseInt(selectedId)) },
          { label: 'INC', icon: GitMerge, action: () => backupService.runIncremental(parseInt(selectedId)) },
        ].map(({ label, icon: Icon, action }) => (
          <button key={label} onClick={() => runAction(action, label)} disabled={!!running || !selectedId}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10 hover:bg-accent-cyan/20 transition-all font-display disabled:opacity-50">
            {running === label ? <Spinner size={13} /> : <Icon size={13} />} Backup {label}
          </button>
        ))}
        {['PRE_DEPLOY', 'PRE_TEST', 'PRE_IMPORT'].map((lbl) => (
          <button key={lbl} onClick={() => runAction(() => backupService.createSnapshot(parseInt(selectedId), lbl), lbl)} disabled={!!running || !selectedId}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-all font-display disabled:opacity-50">
            {running === lbl ? <Spinner size={13} /> : <Tag size={13} />} {lbl}
          </button>
        ))}
        <button onClick={() => runAction(() => backupService.simulateDisaster(parseInt(selectedId)), 'disaster')} disabled={!!running || !selectedId}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all font-display disabled:opacity-50">
          {running === 'disaster' ? <Spinner size={13} /> : <Skull size={13} />} Simular Desastre
        </button>
      </div>

      {/* SLA */}
      {sla && (
        <Card className="flex items-center gap-6 text-sm font-body text-text-secondary flex-wrap">
          <Target size={16} className="text-accent-cyan shrink-0" />
          <span>SLA cumplido: <strong className="font-display text-emerald-400">{sla.sla_met || 0}</strong></span>
          <span>Incumplido: <strong className="font-display text-red-400">{sla.sla_missed || 0}</strong></span>
          <span>RPO promedio: <strong className="font-display text-text-primary">{sla.avg_rpo ? Math.round(sla.avg_rpo) : '—'} min</strong></span>
          <span>RTO promedio: <strong className="font-display text-text-primary">{sla.avg_rto ? Math.round(sla.avg_rto) : '—'} min</strong></span>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : (
        <DataTable columns={columns} data={history} rowKey={(r) => String(r.id)} emptyMessage="No hay backups registrados." />
      )}
    </div>
    </>
  );
}
