export interface PhDStudent {
  id: number;
  code: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  email: string | null;
  phone: string | null;
  organization: string | null;
  major: string | null;
  major_code: string | null;
  cohort: string | null;
  admission_decision_date: string | null;
  expected_defense_date: string | null;
  status: string;
  supervisors?: Supervisor[];
  topic?: Topic | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface PhDStudentCreate {
  code: string;
  full_name: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  organization?: string;
  major?: string;
  major_code?: string;
  cohort?: string;
  admission_decision_date?: string;
  expected_defense_date?: string;
  status?: string;
  note?: string;
}

export interface PhDStudentUpdate {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  organization?: string;
  major?: string;
  major_code?: string;
  cohort?: string;
  admission_decision_date?: string;
  expected_defense_date?: string;
  status?: string;
  note?: string;
}

export interface PhDStudentFilters {
  code?: string;
  full_name?: string;
  cohort?: string;
  major?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface Supervisor {
  id: number;
  lecturer_id: number;
  full_name: string;
  role: string;
  is_primary: boolean;
}

export interface Topic {
  id: number;
  name: string;
  name_en: string | null;
  description: string | null;
  start_date: string | null;
  expected_end_date: string | null;
  status: string;
}

export interface AssignSupervisorData {
  lecturer_id: number;
  role?: string;
  is_primary?: boolean;
}
