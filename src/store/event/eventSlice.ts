import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEvent, EventState } from "./types";

const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    fetchEventsRequest: (
      state,
      action: PayloadAction<{
        page?: number;
        limit?: number;
        status?: string;
        idsyndic: number;
        userId?: number;
        authToken?: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
      state.pagination.page = action.payload.page ?? state.pagination.page;
      state.pagination.limit = action.payload.limit ?? state.pagination.limit;
    },
    fetchEventsSuccess: (
      state,
      action: PayloadAction<{ events: IEvent[]; total: number }>
    ) => {
      state.loading = false;
      state.events = action.payload.events;
      state.pagination.total = action.payload.total;
    },
    fetchEventsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createEventRequest: (state, action: PayloadAction<IEvent>) => {
      state.loading = true;
      state.error = null;
    },
    createEventSuccess: (state, action: PayloadAction<IEvent>) => {
      state.loading = false;
      state.events.push(action.payload);
      state.pagination.total += 1;
    },
    createEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateEventRequest: (state, action: PayloadAction<IEvent>) => {
      state.loading = true;
      state.error = null;
    },
    updateEventSuccess: (state, action: PayloadAction<IEvent>) => {
      state.loading = false;
      state.events = state.events.map((event) =>
        event.id === action.payload.id ? action.payload : event
      );
    },
    updateEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteEventRequest: (
      state,
      action: PayloadAction<{ eventId: number; authToken?: string }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    deleteEventSuccess: (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.events = state.events.filter(
        (event) => event.id !== action.payload
      );
      state.pagination.total -= 1;
    },
    deleteEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    voteEventRequest: (
      state,
      action: PayloadAction<{
        eventId: number;
        vote: "for" | "against";
        userId: number;
        authToken: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    voteEventSuccess: (state, action: PayloadAction<IEvent>) => {
      state.loading = false;
      state.events = state.events.map((event) =>
        event.id === action.payload.id ? action.payload : event
      );
    },
    voteEventFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { actions } = eventSlice;
export default eventSlice.reducer;
