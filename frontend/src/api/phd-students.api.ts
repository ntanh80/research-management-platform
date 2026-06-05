import api from './axios';
import type { ApiResponse } from '@/types/api.types';
import type {
  PhDStudent,
  PhDStudentCreate,
  PhDStudentUpdate,
  PhDStudentFilters,
  Supervisor,
  Topic,
  AssignSupervisorData,
} from '@/types/phd-student.types';

export interface PhDStudentSummary {
  total: number;
  studying: number;
  defended: number;
  no_publications: number;
}

export const phdStudentsApi = {
  getPhDStudents: async (params?: PhDStudentFilters) => {
    const res = await api.get<ApiResponse<PhDStudent[]>>('/phd-students', { params });
    return res.data;
  },

  getSummary: async () => {
    const res = await api.get<ApiResponse<PhDStudentSummary>>('/phd-students/summary');
    return res.data;
  },

  getPhDStudent: async (id: number) => {
    const res = await api.get<ApiResponse<PhDStudent>>(`/phd-students/${id}`);
    return res.data;
  },

  createPhDStudent: async (data: PhDStudentCreate) => {
    const res = await api.post<ApiResponse<PhDStudent>>('/phd-students', data);
    return res.data;
  },

  updatePhDStudent: async (id: number, data: PhDStudentUpdate) => {
    const res = await api.put<ApiResponse<PhDStudent>>(`/phd-students/${id}`, data);
    return res.data;
  },

  deletePhDStudent: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/phd-students/${id}`);
    return res.data;
  },

  getTopic: async (id: number) => {
    const res = await api.get<ApiResponse<Topic>>(`/phd-students/${id}/topic`);
    return res.data;
  },

  getPublications: async (id: number) => {
    const res = await api.get<ApiResponse<unknown[]>>(`/phd-students/${id}/publications`);
    return res.data;
  },

  getSupervisors: async (id: number) => {
    const res = await api.get<ApiResponse<Supervisor[]>>(`/phd-students/${id}/supervisors`);
    return res.data;
  },

  assignSupervisor: async (id: number, data: AssignSupervisorData) => {
    const res = await api.post<ApiResponse<Supervisor>>(
      `/phd-students/${id}/assign-supervisor`,
      data
    );
    return res.data;
  },
};
