import { Status } from "../enum/Status.enum";

export interface Reclamation {
  id: number;
  title: string;
  description: string;
  category: string;
  status: Status;
  createdAt: string;
}
