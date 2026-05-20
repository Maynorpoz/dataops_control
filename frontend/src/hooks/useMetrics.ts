import { useState, useEffect } from 'react';
import { DashboardData } from '../types';
import { metricsService } from '../services/metricsService';

export function useMetrics(intervalMs = 30000) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        const res = await metricsService.getDashboard();
        if (!cancelled) { setData(res.data); setError(null); }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    const timer = setInterval(fetch, intervalMs);
    return () => { cancelled = true; clearInterval(timer); };
  }, [intervalMs]);

  return { data, loading, error };
}
