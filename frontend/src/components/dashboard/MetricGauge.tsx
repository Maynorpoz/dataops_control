import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface MetricGaugeProps {
  value: number;
  label: string;
  icon: React.ReactNode;
}

function getColor(value: number): string {
  if (value > 85) return '#ef4444';
  if (value > 70) return '#f59e0b';
  return '#10b981';
}

export function MetricGauge({ value, label, icon }: MetricGaugeProps) {
  const color = getColor(value);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-20 h-20">
        <CircularProgressbar
          value={value}
          text={`${Math.round(value)}%`}
          styles={buildStyles({
            textColor: color,
            pathColor: color,
            trailColor: '#1e2d4a',
            textSize: '22px',
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
