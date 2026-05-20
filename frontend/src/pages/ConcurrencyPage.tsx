import { useState, useEffect } from 'react';
import { Zap, Users, Swords, Sword, Timer, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { connectionsService } from '../services/connectionsService';
import { Connection, ConcurrencyResult } from '../types';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';

export function ConcurrencyPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectionId, setConnectionId] = useState('');
  const [users, setUsers] = useState(100);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ConcurrencyResult | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    connectionsService.getAll().then((res) => {
      setConnections(res.data);
      if (res.data.length) setConnectionId(String(res.data[0].id));
    });
    api.get('/api/concurrency/stats').then((res) => setStats(res.data));
  }, []);

  const handleSimulate = async () => {
    if (!connectionId) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await api.post<ConcurrencyResult>('/api/concurrency/simulate', {
        connectionId: parseInt(connectionId), concurrentUsers: users,
      });
      setResult(res.data);
      api.get('/api/concurrency/stats').then((r) => setStats(r.data));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
        <Zap size={18} className="text-accent-cyan" /> Simulador de Concurrencia Extrema
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Control panel */}
        <Card className="md:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold font-display text-text-primary">Configuración</h3>
          <div>
            <label className="text-xs font-display text-text-muted block mb-1">Conexión destino</label>
            <select value={connectionId} onChange={(e) => setConnectionId(e.target.value)}
              className="w-full bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-accent-cyan/60">
              {connections.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-display text-text-muted block mb-1">
              Usuarios concurrentes: <span className="text-accent-cyan">{users}</span>
            </label>
            <input type="range" min={100} max={500} step={50} value={users}
              onChange={(e) => setUsers(parseInt(e.target.value))}
              className="w-full accent-cyan-400" />
            <div className="flex justify-between text-[10px] text-text-muted font-display mt-1">
              <span>100</span><span>500</span>
            </div>
          </div>
          <button onClick={handleSimulate} disabled={running || !connectionId}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-cyan/20 hover:bg-accent-cyan/30 border border-accent-cyan/30 text-accent-cyan font-display text-sm font-semibold transition-all disabled:opacity-50">
            {running ? <><Spinner size={14} /> Simulando...</> : <><Zap size={14} /> Iniciar simulación</>}
          </button>
        </Card>

        {/* Results */}
        <Card className="md:col-span-2">
          <h3 className="text-sm font-semibold font-display text-text-primary mb-4">Resultado de simulación</h3>
          {!result && !running && (
            <p className="text-text-muted text-sm font-body text-center py-8">
              Configura y ejecuta la simulación para ver los resultados.
            </p>
          )}
          {running && <div className="flex justify-center py-8"><Spinner size={32} /></div>}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-bg-elevated border border-bg-border">
                <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-accent-cyan" />
                  <span className="text-xs text-text-muted font-display">Total transacciones</span>
                </div>
                <p className="text-2xl font-bold font-display text-text-primary">{result.totalTransactions}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-elevated border border-bg-border">
                <div className="flex items-center gap-2 mb-1"><CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-xs text-text-muted font-display">Exitosas</span>
                </div>
                <p className="text-2xl font-bold font-display text-emerald-400">{result.successCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-elevated border border-bg-border">
                <div className="flex items-center gap-2 mb-1"><Swords size={14} className="text-red-400" />
                  <span className="text-xs text-text-muted font-display">Deadlocks</span>
                </div>
                <p className="text-2xl font-bold font-display text-red-400">{result.deadlockCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-elevated border border-bg-border">
                <div className="flex items-center gap-2 mb-1"><Sword size={14} className="text-purple-400" />
                  <span className="text-xs text-text-muted font-display">Resueltos</span>
                </div>
                <p className="text-2xl font-bold font-display text-purple-400">{result.resolvedDeadlocks}</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-elevated border border-bg-border">
                <div className="flex items-center gap-2 mb-1"><Timer size={14} className="text-amber-400" />
                  <span className="text-xs text-text-muted font-display">Espera promedio</span>
                </div>
                <p className="text-2xl font-bold font-display text-amber-400">{result.avgWaitTimeMs}ms</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-elevated border border-bg-border">
                <div className="flex items-center gap-2 mb-1"><RefreshCw size={14} className="text-accent-cyan" />
                  <span className="text-xs text-text-muted font-display">Duración total</span>
                </div>
                <p className="text-2xl font-bold font-display text-accent-cyan">{(result.durationMs/1000).toFixed(1)}s</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Historical stats */}
      {stats && (
        <Card>
          <h3 className="text-sm font-semibold font-display text-text-primary mb-3">Estadísticas acumuladas</h3>
          <div className="flex gap-8 text-sm font-body text-text-secondary">
            <span>Total transacciones: <strong className="font-display text-text-primary">{stats.total}</strong></span>
            <span>Deadlocks totales: <strong className="font-display text-red-400">{stats.deadlocks}</strong></span>
            <span>Resueltos: <strong className="font-display text-emerald-400">{stats.resolved}</strong></span>
            <span>Espera promedio: <strong className="font-display text-text-primary">{Math.round(stats.avg_wait_ms)}ms</strong></span>
          </div>
        </Card>
      )}
    </div>
  );
}
