import { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, AlertCircle, Flame, Mail, Check, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { alertsService } from '../services/alertsService';
import { AlertLog, AlertRule, AlertSeverity } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import { Spinner } from '../components/ui/Spinner';

const SEV_VARIANT: Record<AlertSeverity, any> = {
  INFO: 'info', WARNING: 'warning', CRITICAL: 'critical',
};

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, r] = await Promise.all([alertsService.getAll(), alertsService.getRules()]);
    setAlerts(a.data);
    setRules(r.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAck = async (id: string) => {
    await alertsService.acknowledge(id);
    load();
  };

  const handleResolve = async (id: string) => {
    await alertsService.resolve(id);
    load();
  };

  const toggleRule = async (rule: AlertRule) => {
    await alertsService.updateRules([{ ...rule, is_active: !rule.is_active }]);
    load();
  };

  const columns = [
    { key: 'severity', header: 'Severidad', render: (r: AlertLog) => (
      <Badge variant={SEV_VARIANT[r.severity]}>{r.severity}</Badge>
    )},
    { key: 'rule_name', header: 'Regla', render: (r: AlertLog) => (
      <span className="font-display text-xs text-text-primary">{r.rule_name}</span>
    )},
    { key: 'message', header: 'Mensaje', render: (r: AlertLog) => (
      <span className="text-xs text-text-muted truncate max-w-xs block" title={r.message}>{r.message}</span>
    )},
    { key: 'status', header: 'Estado', render: (r: AlertLog) => (
      <Badge variant={r.status === 'OPEN' ? 'critical' : r.status === 'ACKNOWLEDGED' ? 'warning' : 'success'}>
        {r.status}
      </Badge>
    )},
    { key: 'created_at', header: 'Fecha', render: (r: AlertLog) => (
      <span className="text-xs text-text-muted">{new Date(r.created_at).toLocaleString()}</span>
    )},
    { key: 'id', header: 'Acciones', render: (r: AlertLog) => (
      <div className="flex gap-2">
        {r.status === 'OPEN' && (
          <button onClick={() => handleAck(r.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors font-display">
            <AlertCircle size={10} /> Ack
          </button>
        )}
        {r.status !== 'RESOLVED' && (
          <button onClick={() => handleResolve(r.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors font-display">
            <Check size={10} /> Resolver
          </button>
        )}
      </div>
    )},
  ];

  const openCount  = alerts.filter((a) => a.status === 'OPEN').length;
  const critCount  = alerts.filter((a) => a.severity === 'CRITICAL' && a.status === 'OPEN').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
          <Bell size={18} className="text-accent-cyan" /> Motor de Alertas
        </h1>
        <button onClick={load} className="p-1.5 rounded border border-bg-border text-text-muted hover:text-text-primary transition-colors">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex items-center gap-3">
          <BellRing size={20} className="text-red-400 shrink-0" />
          <div><p className="text-2xl font-bold font-display text-red-400">{openCount}</p><p className="text-xs text-text-muted font-body">Alertas abiertas</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <Flame size={20} className="text-red-500 shrink-0" />
          <div><p className="text-2xl font-bold font-display text-red-500">{critCount}</p><p className="text-xs text-text-muted font-body">Críticas activas</p></div>
        </Card>
        <Card className="flex items-center gap-3">
          <BellOff size={20} className="text-emerald-400 shrink-0" />
          <div><p className="text-2xl font-bold font-display text-emerald-400">{alerts.filter((a) => a.status === 'RESOLVED').length}</p><p className="text-xs text-text-muted font-body">Resueltas</p></div>
        </Card>
      </div>

      {/* Alert rules */}
      <Card>
        <h3 className="text-sm font-semibold font-display text-text-primary mb-3 flex items-center gap-2">
          <Mail size={14} className="text-accent-cyan" /> Reglas de alerta (recarga en caliente)
        </h3>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-bg-border">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleRule(rule)} className="text-text-muted hover:text-text-primary transition-colors">
                  {rule.is_active ? <ToggleRight size={18} className="text-accent-cyan" /> : <ToggleLeft size={18} />}
                </button>
                <span className="font-display text-xs font-semibold text-text-primary">{rule.rule_name}</span>
                <span className="text-xs text-text-muted font-body">{rule.metric} {rule.operator} {rule.threshold}</span>
              </div>
              <Badge variant={SEV_VARIANT[rule.severity]}>{rule.severity}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Alert history */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : (
        <DataTable columns={columns} data={alerts} rowKey={(r) => String(r.id)} emptyMessage="No hay alertas registradas." />
      )}
    </div>
  );
}
