export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  department_id: number | null;
  is_active: boolean;
  is_superuser: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  full_name: string;
  department_id?: number;
  is_active?: boolean;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  department_id?: number;
  is_active?: boolean;
}

export interface UserFilters {
  username?: string;
  email?: string;
  is_active?: boolean;
  department_id?: number;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
