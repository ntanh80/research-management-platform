export interface Role {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface RoleCreate {
  code: string;
  name: string;
  description?: string;
  status?: boolean;
  permission_ids?: number[];
}

export interface RoleUpdate {
  name?: string;
  description?: string;
  status?: boolean;
  permission_ids?: number[];
}

export interface RoleFilters {
  code?: string;
  name?: string;
  status?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  module: string;
}

export interface PermissionModule {
  module: string;
  permissions: Permission[];
}
