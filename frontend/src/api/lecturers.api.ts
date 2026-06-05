import api from './axios';
import type { ApiResponse } from '@/types/api.types';
import type {
  Lecturer,
  LecturerCreate,
  LecturerUpdate,
  LecturerFilters,
} from '@/types/lecturer.types';

export interface LecturerSummary {
  total: number;
  active: number;
}

export const lecturersApi = {
  getLecturers: async (params?: LecturerFilters) => {
    const res = await api.get<ApiResponse<Lecturer[]>>('/lecturers', { params });
    return res.data;
  },

  getSummary: async () => {
    const res = await api.get<ApiResponse<LecturerSummary>>('/lecturers/summary');
    return res.data;
  },

  getLecturer: async (id: number) => {
    const res = await api.get<ApiResponse<Lecturer>>(`/lecturers/${id}`);
    return res.data;
  },

  createLecturer: async (data: LecturerCreate) => {
    const res = await api.post<ApiResponse<Lecturer>>('/lecturers', data);
    return res.data;
  },

  updateLecturer: async (id: number, data: LecturerUpdate) => {
    const res = await api.put<ApiResponse<Lecturer>>(`/lecturers/${id}`, data);
    return res.data;
  },

  deleteLecturer: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/lecturers/${id}`);
    return res.data;
  },

  getPublications: async (id: number) => {
    const res = await api.get<ApiResponse<unknown[]>>(`/lecturers/${id}/publications`);
    return res.data;
  },

  getStudents: async (id: number) => {
    const res = await api.get<ApiResponse<unknown[]>>(`/lecturers/${id}/students`);
    return res.data;
  },
};
