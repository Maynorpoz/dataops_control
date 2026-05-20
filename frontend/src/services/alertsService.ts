import api from './api';
import { AlertLog, AlertRule } from '../types';

export const alertsService = {
  getAll: () => api.get<AlertLog[]>('/api/alerts'),
  getOpen: () => api.get<AlertLog[]>('/api/alerts/open'),
  acknowledge: (id: string) => api.put(`/api/alerts/${id}/acknowledge`),
  resolve: (id: string) => api.put(`/api/alerts/${id}/resolve`),
  getRules: () => api.get<AlertRule[]>('/api/alerts/rules'),
  updateRules: (rules: Partial<AlertRule>[]) => api.put('/api/alerts/rules', rules),
};
