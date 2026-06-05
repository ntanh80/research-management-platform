import api from './axios';
import type { ApiResponse } from '@/types/api.types';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_superuser: boolean;
}

export const authApi = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const res = await api.post<ApiResponse<LoginResult>>('/auth/login', formData);
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
    const res = await api.get<ApiResponse<UserInfo>>('/auth/me');
    return res.data;
  },

  getMyPermissions: async () => {
    const res = await api.get<ApiResponse<string[]>>('/auth/permissions');
    return res.data;
  },
};
