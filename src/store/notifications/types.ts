import { Status } from "../../types/enum/Status.enum";


export interface IReclamation {
  id?: number;
  description: string;
  user_id: number;
  user_role?: string;
  status?: Status;
  created_at?: number;
}

export interface ReclamationState {
  reclamations: IReclamation[];
  error: string | null;
  loading: boolean;
}
