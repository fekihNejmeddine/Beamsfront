interface Event {
  id?: number;
  title: string;
  startTime: string;
  endTime: string;
  typeMeeting: string;
  description: string;
  location: string;
  organizer: string;
  idMeetingRoom: number;
  participants: { username: string; email: string }[];
  status: string;
  waitingPosition: number;
  isPastEvent?: boolean;
  UserId?: number;
}

export { Event };
