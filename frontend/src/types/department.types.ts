export interface Department {
  id: number;
  code: string;
  name: string;
  description: string | null;
  head_lecturer_id: number | null;
  head_lecturer_name?: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentCreate {
  code: string;
  name: string;
  description?: string;
  head_lecturer_id?: number;
  status?: boolean;
}

export interface DepartmentUpdate {
  name?: string;
  description?: string;
  head_lecturer_id?: number;
  status?: boolean;
}

export interface DepartmentFilters {
  code?: string;
  name?: string;
  status?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
