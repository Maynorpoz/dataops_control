import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <Loader2 size={size} className={clsx('animate-spin text-accent-cyan', className)} />;
}
