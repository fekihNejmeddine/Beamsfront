export interface Event {
  id?: number;
  title: string;
  startTime: string;
  endTime: string;
  category?: string;
  description: string;
  location: string;
  organizer: string;
  typeMeeting: string;
  idMeetingRoom: number;
  status: string;
  waitingPosition: number;
  participants: any[];
  isPastEvent?: boolean;
  UserId?: number;
}

export interface MeetingRooms {
  id?: number;
  name: string;
  location?: string;
  capacity: number;
}

export interface CalendarState {
  events: Event[];
  error: string | null;
  moveEventError: string | null;
  moveEventSuccess: string | null;
  isEventUpdated: boolean | null;
  loading: boolean;
  isEventTaken: boolean | null;
  meetingRooms: MeetingRooms[];
  EventUpdateError: string | null;
  EventUpdateSuccess: string | null;
  Exists: number | null;
  showWaitingConfirmation: boolean;
  waitingEvent: Event | null;
  waitingPosition: number | null;
  waitingMessage: string | null;
  showTimeSelection: boolean;
  timeSelectionEvent: Event | null;
}
