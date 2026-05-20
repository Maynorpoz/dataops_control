import { clsx } from 'clsx';

type Variant = 'success' | 'warning' | 'critical' | 'info' | 'neutral';

const variants: Record<Variant, string> = {
  success:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  warning:  'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
  info:     'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  neutral:  'bg-slate-500/15 text-slate-400 border border-slate-500/30',
};

interface BadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold font-display', variants[variant], className)}>
      {children}
    </span>
  );
}
