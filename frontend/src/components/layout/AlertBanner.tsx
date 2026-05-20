import { X, Flame, Siren } from 'lucide-react';
import { useAlertContext } from '../../context/AlertContext';
import { useEffect, useState } from 'react';
import { AlertLog } from '../../types';

export function AlertBanner() {
  const { liveAlerts, dismissAlert } = useAlertContext();
  const [visible, setVisible] = useState<AlertLog | null>(null);

  useEffect(() => {
    const critical = liveAlerts.find((a) => a.severity === 'CRITICAL');
    if (critical) {
      setVisible(critical);
      const timer = setTimeout(() => setVisible(null), 30000);
      return () => clearTimeout(timer);
    }
  }, [liveAlerts]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-flash-critical">
      <div className="bg-red-500/95 border-b border-red-400 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame size={18} className="text-white" />
          <Siren size={18} className="text-white" />
          <span className="text-white font-semibold text-sm font-display">
            ALERTA CRÍTICA: {visible.rule_name} — {visible.message}
          </span>
        </div>
        <button
          onClick={() => { setVisible(null); dismissAlert(visible.id); }}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
