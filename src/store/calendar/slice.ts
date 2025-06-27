import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from "@reduxjs/toolkit";
import {  Event, MeetingRooms } from "./types";


const eventsAdapter = createEntityAdapter({
  selectId: (event: Event) => event.id,
});

const initialState=eventsAdapter.getInitialState ({
  events: [],
  error: null ,
  isEventUpdated: null,
  loading: false,
  isEventTaken: null,
  meetingRooms: [],
  moveEventError: null,
  moveEventSuccess: null,
  EventUpdateError: null,
  EventUpdateSuccess: null,
  Exists: null,
  showWaitingConfirmation: false,
  waitingEvent: null,
  waitingPosition: null,
  waitingMessage: null,
  showTimeSelection: false,
  timeSelectionEvent: null,
});

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    showWaitingPositionConfirmation(
      state,
      action: PayloadAction<{
        event: Event;
        waitingPosition: number;
        message: string;
      }>
    ) {
      state.showWaitingConfirmation = true;
      state.waitingEvent = action.payload.event;
      state.waitingPosition = action.payload.waitingPosition;
      state.waitingMessage = action.payload.message;
    },
    confirmWaitingPosition(
      state,
      action: PayloadAction<{ event: Event; token: string; accept: boolean }>
    ) {
      state.showWaitingConfirmation = false;
    },
    showTimeSelectionModal(state, action: PayloadAction<{ event: Event }>) {
      state.showTimeSelection = true;
      state.timeSelectionEvent = action.payload.event;
    },
    closeTimeSelectionModal(state) {
      state.showTimeSelection = false;
      state.timeSelectionEvent = null;
    },
    fetchMeetingRoom: (state) => {
      state.loading = true;
    },
    fetchMeetingRoomsSuccess: (
      state,
      action: PayloadAction<MeetingRooms[]>
    ) => {
      state.meetingRooms = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchMeetingRoomsFail: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    onGetEvents: (state, _action: PayloadAction<{ meetingRoom: number }>) => {
      state.loading = true;
    },
    getEventsSuccess: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload.filter(
        (event) => event.status !== "cancelled"
      ); 
      state.loading = false;
      state.error = null;
    },
    getEventsFail: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    moveEventRequest: (
      state,
      action: PayloadAction<{ event: Event; token: string }>
    ) => {
      state.loading = true;
      state.moveEventError = null;
      state.moveEventSuccess = null;
    },
    moveEventSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;

      state.moveEventSuccess = action.payload;
    },
    moveEventFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.moveEventError = action.payload;
    },
    clearMoveEventStatus: (state) => {
      state.moveEventError = null;
      state.moveEventSuccess = null;
    },
    onAddNewEvent: (
      state,
      _action: PayloadAction<{ event: Event; token: string }>
    ) => {
      state.loading = true;
      state.EventUpdateError = null;
      state.EventUpdateSuccess = null;
    },
    addEventSuccess: (state, action: PayloadAction<Event>) => {
      const eventExists = state.events.some(
        (event) => event.id === action.payload.id
      );
      eventsAdapter.addOne(state, action.payload);
      if (!eventExists && action.payload.status !== "cancelled") {
        state.events.push(action.payload);
        state.isEventUpdated = true;
      }
      state.loading = false;
      state.error = null;
      state.EventUpdateSuccess = "Event Add successfully";
    },
    addEventFail: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isEventUpdated = false;
      state.loading = false;
    },
    updateEvent: (
      state,
      _action: PayloadAction<{ event: Event; token: string }>
    ) => {
      state.loading = true;
      state.EventUpdateError = null;
      state.EventUpdateSuccess = null;
    },
    updateEventSuccess: (state, action: PayloadAction<Event>) => {
      if (action.payload.status !== "cancelled") {
        state.events = state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        );
      } else {
        state.events = state.events.filter(
          (event) => event.id !== action.payload.id
        );
      }
      state.loading = false;
      state.error = null;
      state.EventUpdateSuccess = "Event updated successfully";
    },
    updateEventFail: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.EventUpdateError = action.payload;
      state.loading = false;
    },
    resetEventUpdated: (state) => {
      state.EventUpdateError = null;
      state.EventUpdateSuccess = null;
    },
    deleteEvent: (
      state,
      _action: PayloadAction<{ eventId: number; token: string }>
    ) => {
      state.loading = true;
      state.EventUpdateError = null;
      state.EventUpdateSuccess = null;
    },
    deleteEventSuccess: (state, action: PayloadAction<number>) => {
      state.events = state.events.filter((event) => event.id !== action.payload);
      state.isEventUpdated = true;
      state.EventUpdateSuccess = "Event deleted successfully";
      state.loading = false;
      state.error = null;
    },
    deleteEventFail: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isEventUpdated = false;
      state.EventUpdateError = action.payload;
      state.loading = false;
    },
  },
});

export const { actions } = calendarSlice;

export default calendarSlice.reducer;
