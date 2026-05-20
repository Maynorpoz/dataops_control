import { CheckCircle2, AlertTriangle, XCircle, Database, Server, Cylinder, Cpu, MemoryStick, HardDrive, Network, Lock } from 'lucide-react';
import { Connection, HealthStatus } from '../../types';

const STATUS_CONFIG: Record<HealthStatus, { icon: any; color: string; bg: string; border: string; label: string }> = {
  HEALTHY:  { icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', label: 'Saludable' },
  WARNING:  { icon: AlertTriangle, color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   label: 'Advertencia' },
  CRITICAL: { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/30',     label: 'Crítico' },
};

const ENGINE_ICONS: Record<string, any> = {
  PostgreSQL: Database,
  SQLServer:  Server,
  Oracle:     Cylinder,
};

function MetricRow({ icon: Icon, label, value, warn, critical }: any) {
  const color = critical ? 'text-red-400' : warn ? 'text-amber-400' : 'text-text-secondary';
  return (
    <div className="flex items-center gap-2">
      <Icon size={13} className="text-text-muted shrink-0" />
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`text-xs font-semibold font-display ml-auto ${color}`}>{value}</span>
    </div>
  );
}

interface StatusCardProps {
  connection: Connection;
}

export function StatusCard({ connection }: StatusCardProps) {
  const cfg = STATUS_CONFIG[connection.health_status || 'HEALTHY'];
  const StatusIcon = cfg.icon;
  const EngineIcon = ENGINE_ICONS[connection.motor] || Database;

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-5 backdrop-blur-sm transition-all hover:scale-[1.01] hover:shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <EngineIcon size={16} className="text-accent-cyan" />
          <span className="font-display text-sm font-semibold text-text-primary">{connection.nombre}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.border} border`}>
          <StatusIcon size={12} className={cfg.color} />
          <span className={`text-xs font-semibold font-display ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Engine badge */}
      <div className="text-xs text-text-muted font-display mb-3">{connection.motor} • {connection.host}:{connection.port}</div>

      {/* Metrics */}
      <div className="space-y-1.5">
        <MetricRow icon={Cpu}        label="CPU"        value={connection.cpu != null ? `${connection.cpu}%` : '—'} warn={(connection.cpu||0) > 70} critical={(connection.cpu||0) > 85} />
        <MetricRow icon={MemoryStick} label="RAM"       value={connection.memory != null ? `${connection.memory}%` : '—'} warn={(connection.memory||0) > 70} critical={(connection.memory||0) > 85} />
        <MetricRow icon={Network}    label="Conexiones" value={connection.connections ?? '—'} />
        <MetricRow icon={Lock}       label="Bloqueos"   value={connection.locks ?? '—'} warn={(connection.locks||0) > 5} critical={(connection.deadlocks||0) > 3} />
        <MetricRow icon={HardDrive}  label="Disco"      value={connection.disk_usage != null ? `${connection.disk_usage} MB` : '—'} warn={(connection.disk_usage||0)/(connection.disk_total||1) > 0.7} critical={(connection.disk_usage||0)/(connection.disk_total||1) > 0.9} />
      </div>
    </div>
  );
}
