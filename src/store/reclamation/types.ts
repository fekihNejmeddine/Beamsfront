import { Status } from "../../types/enum/Status.enum";

export interface IReclamation {
  id?: number;
  description: string;
  user_id: number;
  user_role?: string;
  title: string;
  status?: Status;
  created_at?: string;
  Photo?: string[];
}

export interface ReclamationState {
  reclamations: IReclamation[];
  error: string | null;
  loading: boolean;
  filters: {
    searchQuery: string;
    statusFilter: string;
    page: number;
    limit: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  createSuccess: boolean;
}
