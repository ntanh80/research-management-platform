import api from './axios';
import type { ApiResponse } from '@/types/api.types';
import type {
  Department,
  DepartmentCreate,
  DepartmentUpdate,
  DepartmentFilters,
} from '@/types/department.types';

export const departmentsApi = {
  getDepartments: async (params?: DepartmentFilters) => {
    const res = await api.get<ApiResponse<Department[]>>('/departments', { params });
    return res.data;
  },

  getDepartment: async (id: number) => {
    const res = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    return res.data;
  },

  createDepartment: async (data: DepartmentCreate) => {
    const res = await api.post<ApiResponse<Department>>('/departments', data);
    return res.data;
  },

  updateDepartment: async (id: number, data: DepartmentUpdate) => {
    const res = await api.put<ApiResponse<Department>>(`/departments/${id}`, data);
    return res.data;
  },

  deleteDepartment: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/departments/${id}`);
    return res.data;
  },

  getLecturers: async (id: number) => {
    const res = await api.get<ApiResponse<unknown[]>>(`/departments/${id}/lecturers`);
    return res.data;
  },
};
