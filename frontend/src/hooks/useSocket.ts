import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAlertContext } from '../context/AlertContext';
import { AlertLog } from '../types';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { addAlert } = useAlertContext();

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || window.location.origin;
    socketRef.current = io(wsUrl, { transports: ['websocket', 'polling'] });

    socketRef.current.on('connect', () => {
      console.log('[Socket.IO] Connected:', socketRef.current?.id);
    });

    socketRef.current.on('alert', (alert: AlertLog) => {
      addAlert(alert);
    });

    socketRef.current.on('metrics', (data: any) => {
      // metrics updates handled per-page via polling + socket
    });

    return () => { socketRef.current?.disconnect(); };
  }, [addAlert]);

  return socketRef.current;
}
