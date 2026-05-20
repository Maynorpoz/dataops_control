import { Target, CheckCircle2, XCircle } from 'lucide-react';

interface SLAIndicatorProps {
  slaMet: number;
  slaMissed: number;
  avgRpo: number | null;
  avgRto: number | null;
}

export function SLAIndicator({ slaMet, slaMissed, avgRpo, avgRto }: SLAIndicatorProps) {
  const total = slaMet + slaMissed;
  const pct = total > 0 ? Math.round((slaMet / total) * 100) : 100;

  return (
    <div className="flex items-center gap-4">
      <Target size={20} className="text-accent-cyan shrink-0" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted font-display">SLA Compliance</span>
          <span className={`text-xs font-bold font-display ${pct >= 99 ? 'text-emerald-400' : pct >= 95 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct >= 99 ? 'bg-emerald-400' : pct >= 95 ? 'bg-amber-400' : 'bg-red-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex gap-3 mt-1.5 text-[10px] text-text-muted font-display">
          <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-400" />{slaMet} cumplidos</span>
          <span className="flex items-center gap-1"><XCircle size={10} className="text-red-400" />{slaMissed} incumplidos</span>
          {avgRpo != null && <span>RPO avg: {Math.round(avgRpo)}min</span>}
          {avgRto != null && <span>RTO avg: {Math.round(avgRto)}min</span>}
        </div>
      </div>
    </div>
  );
}
