import api from './api';
import { DashboardData, DbMetric } from '../types';

export const metricsService = {
  getDashboard: () => api.get<DashboardData>('/api/metrics/dashboard'),
  getHistory: (dbId: number, limit = 50) =>
    api.get<DbMetric[]>(`/api/metrics/${dbId}/history?limit=${limit}`),
};
