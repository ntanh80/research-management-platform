import api from './axios';
import type { ApiResponse } from '@/types/api.types';
import type { User, UserCreate, UserUpdate, UserFilters } from '@/types/user.types';

export const usersApi = {
  getUsers: async (params?: UserFilters) => {
    const res = await api.get<ApiResponse<User[]>>('/users', { params });
    return res.data;
  },

  getUser: async (id: number) => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data;
  },

  createUser: async (data: UserCreate) => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data;
  },

  updateUser: async (id: number, data: UserUpdate) => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/users/${id}`);
    return res.data;
  },

  resetPassword: async (id: number, password: string) => {
    const res = await api.post<ApiResponse<null>>(`/users/${id}/reset-password`, {
      password,
    });
    return res.data;
  },

  unlockUser: async (id: number) => {
    const res = await api.post<ApiResponse<null>>(`/users/${id}/unlock`);
    return res.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.post<ApiResponse<null>>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return res.data;
  },
};
