import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Wifi, WifiOff, CheckCircle2, AlertTriangle, XCircle, Database, Server, Cylinder, RefreshCw } from 'lucide-react';
import { connectionsService } from '../services/connectionsService';
import { Connection, HealthStatus, EngineType } from '../types';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

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
    if (!confirm('¿Eliminar esta conexión?')) return;
    await connectionsService.delete(id);
    load();
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    try {
      const res = await connectionsService.test(id);
      alert(`Conexión ${res.data.success ? '✓ exitosa' : '✗ fallida'} — ${res.data.latencyMs}ms`);
      load();
    } finally {
      setTestingId(null);
    }
  };

  return (
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
            const hb = HEALTH_BADGE[conn.health_status || 'HEALTHY'];
            const HealthIcon = hb.icon;
            const EngineIcon = ENGINE_ICONS[conn.motor];
            return (
              <Card key={conn.id} glass className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EngineIcon size={16} className="text-accent-cyan" />
                    <span className="font-display text-sm font-semibold text-text-primary">{conn.nombre}</span>
                  </div>
                  <Badge variant={hb.v as any}>
                    <HealthIcon size={10} /> {hb.label}
                  </Badge>
                </div>
                <div className="text-xs text-text-muted font-body space-y-1">
                  <div>{conn.motor} · {conn.host}:{conn.port}/{conn.database_name}</div>
                  <div>Usuario: <span className="text-text-secondary">{conn.user_name}</span></div>
                </div>
                <div className="flex gap-2 pt-1">
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
              <select value={form.motor} onChange={(e) => setForm({ ...form, motor: e.target.value as EngineType })}
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-accent-cyan/60">
                <option>PostgreSQL</option>
                <option>SQLServer</option>
                <option>Oracle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-display text-text-muted mb-1">Puerto</label>
              <input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) })}
                className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-accent-cyan/60" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-text-muted border border-bg-border hover:border-bg-elevated transition-colors font-display">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/30 transition-colors font-display">Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
