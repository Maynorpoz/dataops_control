import { useState, useEffect } from 'react';
import { AlertLog } from '../types';
import { alertsService } from '../services/alertsService';

export function useAlerts(intervalMs = 30000) {
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const res = await alertsService.getOpen();
        if (!cancelled) setAlerts(res.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    const timer = setInterval(fetch, intervalMs);
    return () => { cancelled = true; clearInterval(timer); };
  }, [intervalMs]);

  return { alerts, loading };
}
