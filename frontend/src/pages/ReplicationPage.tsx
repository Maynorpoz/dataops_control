import { useState, useEffect } from 'react';
import { GitBranch, ArrowRightLeft, Radio, Satellite, RefreshCw, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { replicationService } from '../services/replicationService';
import { ReplicationLag, HealthStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const HEALTH_CFG: Record<HealthStatus, any> = {
  HEALTHY:  { v: 'success',  icon: CheckCircle2,  label: 'Saludable' },
  WARNING:  { v: 'warning',  icon: AlertTriangle, label: 'Advertencia' },
  CRITICAL: { v: 'critical', icon: XCircle,       label: 'Crítico' },
};

export function ReplicationPage() {
  const [status, setStatus] = useState<ReplicationLag | null>(null);
  const [history, setHistory] = useState<ReplicationLag[]>([]);
  const [loading, setLoading] = useState(true);
  const [stressing, setStressing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [s, h] = await Promise.all([
      replicationService.getStatus(),
      replicationService.getLagHistory(),
    ]);
    setStatus(s.data as any);
    setHistory((h.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const runScenario = async (scenario: string) => {
    setStressing(scenario);
    try { await replicationService.stressScenario(scenario); await load(); }
    finally { setStressing(null); }
  };

  const chartData = [...history].reverse().slice(-30).map((r) => ({
    time: format(new Date(r.measured_at), 'HH:mm:ss'),
    lag: parseFloat(String(r.lag_seconds)),
  }));

  const hcfg = (status && HEALTH_CFG[status.health_status]) ?? HEALTH_CFG.HEALTHY;
  const HealthIcon = hcfg.icon;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
        <GitBranch size={18} className="text-accent-cyan" /> Replicación Distribuida
      </h1>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size={28} /></div>
      ) : (
        <>
          {/* Topology */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="flex flex-col items-center gap-2 py-6">
              <Radio size={24} className="text-accent-cyan" />
              <p className="font-display text-sm font-semibold text-text-primary">Primary</p>
              <p className="text-xs text-text-muted font-body">postgres-target</p>
              <Badge variant="success"><CheckCircle2 size={10} /> Activo</Badge>
            </Card>

            <Card className="flex flex-col items-center justify-center gap-2">
              <ArrowRightLeft size={20} className="text-accent-cyan" />
              <div className="text-center">
                <p className="text-2xl font-bold font-display text-text-primary">
                  {status ? parseFloat(String(status.lag_seconds)).toFixed(2) : '—'}s
                </p>
                <p className="text-xs text-text-muted font-body">Lag actual</p>
              </div>
              {status && <Badge variant={hcfg.v}><HealthIcon size={10} />{hcfg.label}</Badge>}
            </Card>

            <Card className="flex flex-col items-center gap-2 py-6">
              <Satellite size={24} className="text-purple-400" />
              <p className="font-display text-sm font-semibold text-text-primary">Replica</p>
              <p className="text-xs text-text-muted font-body">postgres-replica</p>
              <Badge variant="info">Standby</Badge>
            </Card>
          </div>

          {/* Stress scenarios */}
          <Card>
            <h3 className="text-sm font-semibold font-display text-text-primary mb-3">Simulación de escenarios</h3>
            <div className="flex gap-3 flex-wrap">
              {[
                { s: 'NORMAL_LOAD', label: 'Normal (~2s)', color: 'emerald' },
                { s: 'MEDIUM_LOAD', label: 'Medio (~5s)',  color: 'amber' },
                { s: 'HIGH_LOAD',   label: 'Alta (~20s)',  color: 'red' },
              ].map(({ s, label, color }) => (
                <button key={s} onClick={() => runScenario(s)} disabled={!!stressing}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border font-display disabled:opacity-50 transition-all
                    ${color === 'emerald' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20' :
                    color === 'amber'   ? 'border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' :
                    'border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20'}`}>
                  {stressing === s ? <Spinner size={13} /> : <RefreshCw size={13} />}
                  {label}
                </button>
              ))}
            </div>
          </Card>

          {/* Lag chart */}
          {chartData.length > 0 && (
            <Card>
              <h3 className="text-xs font-semibold font-display text-text-muted mb-3">Historial de lag (últimas 30 mediciones)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" />
                  <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f1629', border: '1px solid #1e2d4a', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="lag" stroke="#00d4ff" strokeWidth={2} dot={false} name="Lag (s)" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
