import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface MetricGaugeProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  max?: number;   // when provided, value/max determines the fill instead of value%
  unit?: string;  // label shown inside the gauge ("MB", "GB", etc.)
}

function getColor(pct: number): string {
  if (pct > 85) return '#ef4444';
  if (pct > 70) return '#f59e0b';
  return '#10b981';
}

export function MetricGauge({ value, label, icon, max, unit }: MetricGaugeProps) {
  const safeValue = isNaN(value) || value == null ? 0 : value;
  const pct   = max ? Math.min((safeValue / max) * 100, 100) : Math.min(safeValue, 100);
  const color = getColor(pct);

  // Text shown inside the gauge
  const displayText = unit
    ? safeValue >= 1024
      ? `${(safeValue / 1024).toFixed(1)}G`
      : `${Math.round(safeValue)}M`
    : `${Math.round(pct)}%`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-20 h-20">
        <CircularProgressbar
          value={pct}
          text={displayText}
          styles={buildStyles({
            textColor:  color,
            pathColor:  color,
            trailColor: '#1e2d4a',
            textSize:   '20px',
          })}
        />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-text-muted font-display">
        {icon}
        <span>{label}</span>
      </div>
    </div>
  );
}
