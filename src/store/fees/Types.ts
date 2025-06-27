export interface Participant {
  userId?: number;
  username: string;
  lastName?: string;
  role: "Rh" | "Syndic";
}
export interface Caisse {
  id?: number;
  name?: string;
  balance?: number;
  minBalance?:number;
  participants?: Participant[] ;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}
export interface Transaction {
  id?: number;
  caisseId: number;
  userId?:number;
  date?: Date;
  amount: number;
  description?: string;
  Photo?: string[];
  createdAt?: string;
  updatedAt?: string;
  
}
export interface CaisseInput {
  id?: number;
  name: string;
  balance: number;
  minBalance: number;
  participants: Participant[];
  isDeleted?: boolean;
}

export interface FeesState {
  loading: boolean;
  error: string | null;
  total: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  searchQuery: string;
  name: string;
  caisses: Caisse[];
  caisse: Caisse | null;
  transactions: Transaction[];
  createSuccessTransaction: boolean;
  updateSuccessTransaction: boolean;
  deleteSuccessTransaction: boolean;
  Ttotal: number;
  TcurrentPage: number;
  TpageSize: number;
  annee: number;
  mois: number;
}