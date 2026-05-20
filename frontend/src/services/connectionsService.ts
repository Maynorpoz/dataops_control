import api from './api';
import { Connection } from '../types';

export const connectionsService = {
  getAll: () => api.get<Connection[]>('/api/connections'),
  getOne: (id: number) => api.get<Connection>(`/api/connections/${id}`),
  create: (data: Partial<Connection> & { password: string }) =>
    api.post<Connection>('/api/connections', data),
  update: (id: number, data: Partial<Connection> & { password?: string }) =>
    api.put<Connection>(`/api/connections/${id}`, data),
  delete: (id: number) => api.delete(`/api/connections/${id}`),
  test: (id: number) =>
    api.post<{ success: boolean; latencyMs: number }>(`/api/connections/${id}/test`),
};
