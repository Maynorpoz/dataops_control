import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertLog } from '../types';

interface AlertContextValue {
  liveAlerts: AlertLog[];
  addAlert: (alert: AlertLog) => void;
  dismissAlert: (id: string) => void;
  clearAll: () => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [liveAlerts, setLiveAlerts] = useState<AlertLog[]>([]);

  const addAlert = useCallback((alert: AlertLog) => {
    setLiveAlerts((prev) => [alert, ...prev].slice(0, 50));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setLiveAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAll = useCallback(() => setLiveAlerts([]), []);

  return (
    <AlertContext.Provider value={{ liveAlerts, addAlert, dismissAlert, clearAll }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlertContext must be used inside AlertProvider');
  return ctx;
}
