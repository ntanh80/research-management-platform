export interface Lecturer {
  id: number;
  code: string;
  full_name: string;
  academic_title: string | null;
  degree: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  department_id: number | null;
  department_name?: string;
  specialization: string | null;
  research_interests: string | null;
  scholar_url: string | null;
  orcid: string | null;
  scopus_id: string | null;
  note: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface LecturerCreate {
  code: string;
  full_name: string;
  academic_title?: string;
  degree?: string;
  position?: string;
  email?: string;
  phone?: string;
  department_id?: number;
  specialization?: string;
  research_interests?: string;
  scholar_url?: string;
  orcid?: string;
  scopus_id?: string;
  note?: string;
  status?: boolean;
}

export interface LecturerUpdate {
  full_name?: string;
  academic_title?: string;
  degree?: string;
  position?: string;
  email?: string;
  phone?: string;
  department_id?: number;
  specialization?: string;
  research_interests?: string;
  scholar_url?: string;
  orcid?: string;
  scopus_id?: string;
  note?: string;
  status?: boolean;
}

export interface LecturerFilters {
  code?: string;
  full_name?: string;
  degree?: string;
  department_id?: number;
  status?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
