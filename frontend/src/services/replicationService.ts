import api from './api';
import { ReplicationLag } from '../types';

export const replicationService = {
  getStatus: () => api.get<ReplicationLag>('/api/replication/status'),
  getLagHistory: () => api.get<ReplicationLag[]>('/api/replication/lag/history'),
  stressScenario: (scenario: string) =>
    api.post(`/api/replication/stress/${scenario}`),
};
