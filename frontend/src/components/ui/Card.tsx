import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export function Card({ children, className, glass }: CardProps) {
  return (
    <div className={clsx(
      'rounded-xl border border-bg-border p-5',
      glass ? 'bg-bg-surface/60 backdrop-blur-sm' : 'bg-bg-surface',
      className
    )}>
      {children}
    </div>
  );
}
