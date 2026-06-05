import api from './axios';
import type { ApiResponse } from '@/types/api.types';
import type { Permission, PermissionModule } from '@/types/role.types';

export const permissionsApi = {
  getPermissions: async () => {
    const res = await api.get<ApiResponse<Permission[]>>('/permissions');
    return res.data;
  },

  getModules: async () => {
    const res = await api.get<ApiResponse<PermissionModule[]>>('/permissions/modules');
    return res.data;
  },
};
