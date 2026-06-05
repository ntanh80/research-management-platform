import api from './axios';
import type { ApiResponse } from '@/types/api.types';

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
  };
}

export interface MeResult {
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
  };
  roles: string[];
  permissions: string[];
}

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await api.post<ApiResponse<LoginResult>>('/auth/login', {
      username,
      password,
    });
    return res.data;
  },

  logout: async () => {
    const res = await api.post<ApiResponse<null>>('/auth/logout');
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await api.post<ApiResponse<{ access_token: string }>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<ApiResponse<MeResult>>('/auth/me');
    return res.data;
  },

  getMyPermissions: async () => {
    const res = await api.get<ApiResponse<{ permissions: string[] }>>('/auth/my-permissions');
    return res.data;
  },
};
