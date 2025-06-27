import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from "@reduxjs/toolkit";
import { MeetingRoom } from "./Types";
import { RootState } from "../store";

// Utilisation de createEntityAdapter pour normaliser les utilisateurs
const meetingRoomsAdapter = createEntityAdapter({
  selectId: (meetingRoom: MeetingRoom) => meetingRoom.id,
});

const initialState = meetingRoomsAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  total: 0,
  currentPage: 0,
  pageSize: 0,
  hasMore: true,
  searchQuery: "",
  capacity: 0,
});

const meetingRoomsSlice = createSlice({
  name: "meetingRooms",
  initialState,
  reducers: {
    fetchMeetingRoomsRequest: (
      state,
      action: PayloadAction<{
        page: number;
        limit?: number;
        search?: string;
        capacity?: number;
        pageSize?: number;
        authToken: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
      state.currentPage = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.searchQuery = action.payload.search;
      state.capacity = action.payload.capacity;
    },
    fetchMeetingRoomsSuccess: (
      state,
      action: PayloadAction<{ meetingRooms: MeetingRoom[]; total: number }>
    ) => {
      state.error = null;
      state.loading = false;
      meetingRoomsAdapter.setAll(state, action.payload.meetingRooms);
      state.total = action.payload.total;
      state.hasMore = action.payload.meetingRooms.length === state.pageSize;
    },
    fetchMeetingRoomsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createMeetingRoomRequest: (
      state,
      action: PayloadAction<{ meetingRoom: MeetingRoom; authToken: string }>
    ) => {
      state.loading = true;
    },
    createMeetingRoomSuccess: (state, action: PayloadAction<MeetingRoom>) => {
     // meetingRoomsAdapter.addOne(state, action.payload);
      state.loading = false;
      state.total = state.total + 1;
    },
    createMeetingRoomFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateMeetingRoomRequest: (
      state,
      action: PayloadAction<{ meetingRoom: MeetingRoom; authToken: string }>
    ) => {
      state.loading = true;
    },
    updateMeetingRoomSuccess: (state, action: PayloadAction<MeetingRoom>) => {
      meetingRoomsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload,
      });
     console.log(action)
      const caisse = action.payload.isDeleted;
      if (caisse == true) {
        meetingRoomsAdapter.removeOne(state, action.payload.id);
        state.total -= 1;
      } state.loading = false;
    },
    updateMeetingRoomFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteMeetingRoomRequest: (
      state,
      action: PayloadAction<{ meetingRoom: MeetingRoom; authToken: string }>
    ) => {
      console.log(action.payload);
      meetingRoomsAdapter.removeOne(state, action.payload.meetingRoom.id);

      state.loading = true;
    },

    deleteMeetingRoomFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const meetingRoomsSelectors = meetingRoomsAdapter.getSelectors(
  (state: RootState) => state.meetingRooms
);

export const { actions } = meetingRoomsSlice;
export default meetingRoomsSlice.reducer;
