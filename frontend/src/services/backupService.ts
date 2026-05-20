import api from './api';
import { BackupHistory } from '../types';

export const backupService = {
  getHistory: () => api.get<BackupHistory[]>('/api/backup/history'),
  getTree: (dbId: number) => api.get<BackupHistory[]>(`/api/backup/tree/${dbId}`),
  runFull: (dbId: number) => api.post<BackupHistory>(`/api/backup/full/${dbId}`),
  runDiff: (dbId: number) => api.post<BackupHistory>(`/api/backup/diff/${dbId}`),
  runIncremental: (dbId: number) => api.post<BackupHistory>(`/api/backup/incremental/${dbId}`),
  createSnapshot: (dbId: number, label: string) =>
    api.post<BackupHistory>(`/api/backup/snapshot/${dbId}`, { label }),
  simulateDisaster: (connectionId: number) =>
    api.post('/api/backup/simulate-disaster', { connectionId }),
  restore: (id: string) => api.post(`/api/backup/restore/${id}`),
  getSla: () => api.get('/api/backup/sla'),
};
