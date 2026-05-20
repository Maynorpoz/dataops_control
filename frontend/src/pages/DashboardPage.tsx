import { CheckCircle2, AlertTriangle, XCircle, Bell, RefreshCw, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import { useMetrics } from '../hooks/useMetrics';
import { StatusCard } from '../components/dashboard/StatusCard';
import { MetricGauge } from '../components/dashboard/MetricGauge';
import { ConnectionsChart } from '../components/dashboard/ConnectionsChart';
import { DeadlockAlert } from '../components/dashboard/DeadlockAlert';
import { Card } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { useState, useEffect } from 'react';
import { metricsService } from '../services/metricsService';
import { DbMetric } from '../types';

export function DashboardPage() {
  const { data, loading, error } = useMetrics(30000);
  const [history, setHistory] = useState<DbMetric[]>([]);

  // Load history for first active connection
  useEffect(() => {
    if (!data?.connections.length) return;
    const firstId = data.connections[0].id;
    metricsService.getHistory(firstId, 30)
      .then((res) => setHistory(res.data))
      .catch(() => {});
  }, [data]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  );

  if (error) return (
    <div className="text-red-400 text-sm font-display p-4">{error}</div>
  );

  const { connections = [], summary = { healthy: 0, warning: 0, critical: 0 }, openAlerts = 0 } = data || {};
  const totalDeadlocks = connections.reduce((s, c) => s + (c.deadlocks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3">
          <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-2xl font-bold font-display text-emerald-400">{summary.healthy}</p>
            <p className="text-xs text-text-muted font-body">Saludables</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <AlertTriangle size={22} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-2xl font-bold font-display text-amber-400">{summary.warning}</p>
            <p className="text-xs text-text-muted font-body">Advertencias</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <XCircle size={22} className="text-red-400 shrink-0" />
          <div>
            <p className="text-2xl font-bold font-display text-red-400">{summary.critical}</p>
            <p className="text-xs text-text-muted font-body">Críticos</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Bell size={22} className="text-purple-400 shrink-0" />
          <div>
            <p className="text-2xl font-bold font-display text-purple-400">{openAlerts}</p>
            <p className="text-xs text-text-muted font-body">Alertas abiertas</p>
          </div>
        </Card>
      </div>

      {/* Deadlock alert */}
      {totalDeadlocks > 0 && (
        <DeadlockAlert deadlockCount={totalDeadlocks} resolvedCount={0} />
      )}

      {/* Connection cards grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw size={14} className="text-text-muted" />
          <h2 className="text-sm font-semibold font-display text-text-primary">Conexiones monitoreadas</h2>
          <span className="text-xs text-text-muted font-body">(actualiza cada 30s)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {connections.map((conn) => (
            <StatusCard key={conn.id} connection={conn} />
          ))}
          {connections.length === 0 && (
            <p className="col-span-3 text-text-muted text-sm font-body py-8 text-center">
              No hay conexiones activas. Agrega una en <span className="text-accent-cyan">Conexiones</span>.
            </p>
          )}
        </div>
      </div>

      {/* History chart + Gauges */}
      {history.length > 0 && connections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <h3 className="text-xs font-semibold font-display text-text-muted mb-3">
              Telemetría en tiempo real — {connections[0].nombre}
            </h3>
            <ConnectionsChart data={history} />
          </Card>

          <Card className="flex items-center justify-around">
            <MetricGauge value={connections[0].cpu || 0} label="CPU" icon={<Cpu size={12} />} />
            <MetricGauge value={connections[0].memory || 0} label="RAM" icon={<MemoryStick size={12} />} />
            <MetricGauge
              value={Math.round(((connections[0].disk_usage || 0) / (connections[0].disk_total || 1)) * 100)}
              label="Disco"
              icon={<HardDrive size={12} />}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
