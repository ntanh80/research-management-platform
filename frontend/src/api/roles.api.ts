import api from './axios';
import type { ApiResponse } from '@/types/api.types';
import type { Role, RoleCreate, RoleUpdate, RoleFilters } from '@/types/role.types';

export const rolesApi = {
  getRoles: async (params?: RoleFilters) => {
    const res = await api.get<ApiResponse<Role[]>>('/roles', { params });
    return res.data;
  },

  getRole: async (id: number) => {
    const res = await api.get<ApiResponse<Role>>(`/roles/${id}`);
    return res.data;
  },

  createRole: async (data: RoleCreate) => {
    const res = await api.post<ApiResponse<Role>>('/roles', data);
    return res.data;
  },

  updateRole: async (id: number, data: RoleUpdate) => {
    const res = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
    return res.data;
  },

  deleteRole: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/roles/${id}`);
    return res.data;
  },

  assignPermissions: async (id: number, permissionIds: number[]) => {
    const res = await api.post<ApiResponse<Role>>(`/roles/${id}/permissions`, {
      permission_ids: permissionIds,
    });
    return res.data;
  },
};
