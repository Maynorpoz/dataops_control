import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Wifi, CheckCircle2, AlertTriangle, XCircle, Database, Server, Cylinder, RefreshCw, X } from 'lucide-react';
import { connectionsService } from '../services/connectionsService';
import { Connection, HealthStatus, EngineType } from '../types';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

type Toast = { id: number; message: string; type: 'success' | 'error' };

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg font-body text-sm min-w-[260px] animate-fade-in
            ${t.type === 'success'
              ? 'bg-bg-elevated border-accent-cyan/40 text-text-primary'
              : 'bg-bg-elevated border-red-500/40 text-text-primary'}`}>
          {t.type === 'success'
            ? <CheckCircle2 size={16} className="text-accent-cyan shrink-0" />
            : <XCircle size={16} className="text-red-400 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => onDismiss(t.id)} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

const HEALTH_BADGE: Record<HealthStatus, any> = {
  HEALTHY:  { v: 'success',  icon: CheckCircle2,  label: 'Saludable' },
  WARNING:  { v: 'warning',  icon: AlertTriangle, label: 'Advertencia' },
  CRITICAL: { v: 'critical', icon: XCircle,       label: 'Crítico' },
};

const ENGINE_ICONS: Record<EngineType, any> = {
  PostgreSQL: Database,
  SQLServer:  Server,
  Oracle:     Cylinder,
};

const EMPTY_FORM = { nombre: '', motor: 'PostgreSQL' as EngineType, host: '', port: 5432, database_name: '', user_name: '', password: '' };

export function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editConn, setEditConn] = useState<Connection | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await connectionsService.getAll();
      setConnections(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditConn(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (c: Connection) => {
    setEditConn(c);
    setForm({ ...EMPTY_FORM, nombre: c.nombre, motor: c.motor, host: c.host, port: c.port, database_name: c.database_name, user_name: c.user_name });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (editConn) await connectionsService.update(editConn.id, form);
    else await connectionsService.create(form);
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    await connectionsService.delete(confirmDeleteId);
    setConfirmDeleteId(null);
    showToast('Conexión eliminada', 'error');
    load();
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    const conn = connections.find((c) => c.id === id);
    const connName = conn ? `${conn.nombre} (${conn.motor})` : `Conexión #${id}`;
    try {
      const res = await connectionsService.test(id);
      if (res.data.success) {
        setActiveId(id);
        showToast(`${connName} — conectada exitosamente en ${res.data.latencyMs}ms`, 'success');
      } else {
        setActiveId(null);
        const reason = res.data.error ? `: ${res.data.error}` : '. Verifica los datos de acceso';
        showToast(`${connName} — conexión fallida${reason}`, 'error');
      }
      load();
    } catch (err: any) {
      showToast(`${connName} — ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setTestingId(null);
    }
  };

  return (
    <>
    <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Database size={18} className="text-accent-cyan" /> Conexiones de Base de Datos
        </h1>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary border border-bg-border hover:border-bg-elevated transition-colors font-display">
            <RefreshCw size={13} /> Actualizar
          </button>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/30 transition-colors font-display">
            <Plus size={13} /> Nueva conexión
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connections.map((conn) => {
            const hb         = HEALTH_BADGE[conn.health_status || 'HEALTHY'];
            const HealthIcon  = hb.icon;
            const EngineIcon  = ENGINE_ICONS[conn.motor];
            const isActive    = activeId === conn.id;
            const isCritical  = conn.health_status === 'CRITICAL' || conn.status === 'ERROR';
            const isWarning   = conn.health_status === 'WARNING';

            const cardBorder = isActive
              ? 'border-emerald-500/60 shadow-emerald-500/15 shadow-lg'
              : isCritical
              ? 'border-red-500/40'
              : isWarning
              ? 'border-amber-400/40'
              : 'border-bg-border';

            return (
              <Card key={conn.id} glass className={`space-y-3 border ${cardBorder}`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EngineIcon size={16} className={isActive ? 'text-emerald-400' : isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-accent-cyan'} />
                    <span className="font-display text-sm font-semibold text-text-primary">{conn.nombre}</span>
                  </div>
                  <Badge variant={hb.v as any}>
                    <HealthIcon size={10} /> {hb.label}
                  </Badge>
                </div>

                {/* Connection info */}
                <div className="text-xs text-text-muted font-body space-y-1">
                  <div>{conn.motor} · {conn.host}:{conn.port}/{conn.database_name}</div>
                  <div>Usuario: <span className="text-text-secondary">{conn.user_name}</span></div>
                </div>

                {/* Status indicator */}
                <div className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg border ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-bg-base border-bg-border'
                }`}>
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {isActive && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isActive ? 'bg-emerald-400' : isCritical ? 'bg-red-400' : isWarning ? 'bg-amber-400' : 'bg-text-muted/40'
                    }`} />
                  </span>
                  <span className={`text-[11px] font-display font-semibold ${
                    isActive ? 'text-emerald-400' : isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-text-muted'
                  }`}>
                    {isActive ? 'En línea — Activa' : isCritical ? 'Sin conexión' : isWarning ? 'Degradada' : 'Disponible'}
                  </span>
                  {isActive && conn.last_checked_at && (
                    <span className="ml-auto text-[10px] text-text-muted font-body">
                      {new Date(conn.last_checked_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => handleTest(conn.id)} disabled={testingId === conn.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 transition-colors font-display disabled:opacity-50">
                    {testingId === conn.id ? <Spinner size={11} /> : <Wifi size={11} />} Test
                  </button>
                  <button onClick={() => openEdit(conn)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] border border-bg-border text-text-muted hover:text-text-primary hover:border-bg-elevated transition-colors font-display">
                    <Pencil size={11} /> Editar
                  </button>
                  <button onClick={() => handleDelete(conn.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded text-[11px] border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-display">
                    <Trash2 size={11} /> Eliminar
                  </button>
                </div>
              </Card>
            );
          })}
          {!connections.length && (
            <p className="col-span-3 text-center text-text-muted text-sm font-body py-12">
              No hay conexiones. Crea la primera con el botón de arriba.
            </p>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editConn ? 'Editar conexión' : 'Nueva conexión'}>
        <div className="space-y-3">
          {(['nombre','host','database_name','user_name','password'] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs font-display text-text-muted mb-1">{field}</label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                value={(form as any)[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-accent-cyan/60"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-display text-text-muted mb-1">Motor</label>
              <select value={form.motor} onChange={(e) => {
                const motor = e.target.value as EngineType;
                const defaultPorts: Record<EngineType, number> = { PostgreSQL: 5432, SQLServer: 1433, Oracle: 1521 };
                setForm({ ...form, motor, port: defaultPorts[motor] });
              }}
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-accent-cyan/60">
                <option>PostgreSQL</option>
                <option>SQLServer</option>
                <option>Oracle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-display text-text-muted mb-1">Puerto</label>
              <input type="number" value={form.port || ''} onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 0 })}
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-accent-cyan/60" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-text-muted border border-bg-border hover:border-bg-elevated transition-colors font-display">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/30 transition-colors font-display">Guardar</button>
          </div>
        </div>
      </Modal>

      {/* Modal confirmación de eliminación */}
      <Modal open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} title="Eliminar conexión">
        <div className="space-y-4">
          <p className="text-sm font-body text-text-secondary">
            ¿Estás seguro de que deseas eliminar esta conexión? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 rounded-lg text-sm text-text-muted border border-bg-border hover:border-bg-elevated transition-colors font-display">
              Cancelar
            </button>
            <button onClick={confirmDelete}
              className="px-4 py-2 rounded-lg text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors font-display">
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
}
