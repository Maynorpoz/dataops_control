import { useState, useEffect } from 'react';
import { Activity, Cpu, MemoryStick, HardDrive, Network, RefreshCw } from 'lucide-react';
import { metricsService } from '../services/metricsService';
import { connectionsService } from '../services/connectionsService';
import { Connection, DbMetric } from '../types';
import { ConnectionsChart } from '../components/dashboard/ConnectionsChart';
import { MetricGauge } from '../components/dashboard/MetricGauge';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';

export function MetricsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [history, setHistory] = useState<DbMetric[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    connectionsService.getAll().then((res) => {
      setConnections(res.data);
      if (res.data.length) setSelected(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    metricsService.getHistory(selected, 50)
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, [selected]);

  const latest = history[0];
  const conn = connections.find((c) => c.id === selected);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Activity size={18} className="text-accent-cyan" /> Métricas en Tiempo Real
        </h1>
        <select
          value={selected || ''}
          onChange={(e) => setSelected(parseInt(e.target.value))}
          className="bg-bg-elevated border border-bg-border rounded-lg px-3 py-1.5 text-sm text-text-primary font-body focus:outline-none focus:border-accent-cyan/60"
        >
          {connections.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : (
        <>
          {latest && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="flex items-center gap-3">
                <Cpu size={20} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-xl font-bold font-display text-text-primary">{latest.cpu}%</p>
                  <p className="text-xs text-text-muted font-body">CPU</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <MemoryStick size={20} className="text-purple-400 shrink-0" />
                <div>
                  <p className="text-xl font-bold font-display text-text-primary">{latest.memory}%</p>
                  <p className="text-xs text-text-muted font-body">RAM</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <Network size={20} className="text-accent-cyan shrink-0" />
                <div>
                  <p className="text-xl font-bold font-display text-text-primary">{latest.connections}</p>
                  <p className="text-xs text-text-muted font-body">Conexiones activas</p>
                </div>
              </Card>
              <Card className="flex items-center gap-3">
                <HardDrive size={20} className="text-amber-400 shrink-0" />
                <div>
                  <p className="text-xl font-bold font-display text-text-primary">{latest.disk_usage} MB</p>
                  <p className="text-xs text-text-muted font-body">Uso de disco</p>
                </div>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <h3 className="text-xs font-semibold font-display text-text-muted mb-3">
                Historial de telemetría — {conn?.nombre || ''}
              </h3>
              <ConnectionsChart data={history} />
            </Card>

            {latest && (
              <Card className="flex items-center justify-around">
                <MetricGauge value={parseFloat(String(latest.cpu))} label="CPU"   icon={<Cpu size={12} />} />
                <MetricGauge value={parseFloat(String(latest.memory))} label="RAM" icon={<MemoryStick size={12} />} />
                <MetricGauge
                  value={Math.round((parseFloat(String(latest.disk_usage)) / parseFloat(String(latest.disk_total))) * 100)}
                  label="Disco"
                  icon={<HardDrive size={12} />}
                />
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
