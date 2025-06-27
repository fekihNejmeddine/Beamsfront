export interface IEvent {
  id?: number;
  title: string;
  description: string;
  date: string;
  type: "Maintenance" | "TrashCollection" | "Meeting" | "Other";
  idsyndic: number;
  isDeleted?: boolean;
  votesFor?: number; 
  votesAgainst?: number;
  userVote?: "for" | "against" | null; 
}

export interface EventState {
  events: IEvent[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}