import api from './api';
import { User } from '../types';

export const authService = {
  login: (username: string, password: string) =>
    api.post<{ accessToken: string; user: User }>('/api/auth/login', { username, password }),

  logout: () => api.post('/api/auth/logout'),

  refresh: () => api.post<{ accessToken: string }>('/api/auth/refresh'),

  me: () => api.get<User>('/api/auth/me'),
};
