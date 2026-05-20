import { Swords, Sword } from 'lucide-react';

interface DeadlockAlertProps {
  deadlockCount: number;
  resolvedCount: number;
}

export function DeadlockAlert({ deadlockCount, resolvedCount }: DeadlockAlertProps) {
  if (deadlockCount === 0) return null;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
      <Swords size={16} className="text-red-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold font-display text-red-400">
          {deadlockCount} deadlock{deadlockCount > 1 ? 's' : ''} detectado{deadlockCount > 1 ? 's' : ''}
        </p>
        {resolvedCount > 0 && (
          <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
            <Sword size={9} />
            {resolvedCount} resuelto{resolvedCount > 1 ? 's' : ''} automáticamente
          </p>
        )}
      </div>
    </div>
  );
}
