import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from "@reduxjs/toolkit";
import { PasswordData, User } from "./Types";
import { RootState } from "../store";

// Utilisation de createEntityAdapter pour normaliser les utilisateurs
const usersAdapter = createEntityAdapter({
  selectId: (user: User) => user.id,
});

const initialState = usersAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  total: 0,
  currentPage: 0,
  pageSize: 0,
  hasMore: true,
  searchQuery: "",
  role: "",
  idsyndic: 0,
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    fetchUsersRequest: (
      state,
      action: PayloadAction<{
        page: number;
        limit?: number;
        search?: string;
        role?: string;
        pageSize?: number;
        authToken: string;
        idsyndic?: number;
      }>
    ) => {
      state.loading = true;
      state.error = null;
      state.currentPage = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.searchQuery = action.payload.search;
      state.role = action.payload.role;
      state.idsyndic = action.payload.idsyndic;
    },
    fetchUsersSuccess: (
      state,
      action: PayloadAction<{ users: User[]; total: number }>
    ) => {
      state.error = null;
      state.loading = false;
      usersAdapter.setAll(state, action.payload.users);
      state.total = action.payload.total;
      state.hasMore = true;
    },

    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchAllUsersRequest: (
      state,
      action: PayloadAction<{
        authToken: string;
      }>
    ) => {
      state.loading = true;
    },
    fetchAllUsersSuccess: (state, action) => {
      state.loading = true;
      console.log(action.payload);
      usersAdapter.addMany(state, action.payload);
    },
    fetchUsersByRoleRequest: (
      state,
      action: PayloadAction<{
        role: string;
        authToken: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersByRoleSuccess: (state, action) => {
      state.loading = false;
      usersAdapter.addMany(state, action.payload);
    },
    createUserRequest: (
      state,
      action: PayloadAction<{ user: User; authToken: string }>
    ) => {
      state.loading = true;
    },
    createUserSuccess: (state, action: PayloadAction<User>) => {
      usersAdapter.addOne(state, action.payload);

      state.total = state.total + 1;
      state.loading = false;
      console.log(state.total);
    },
    createUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserRequest: (
      state,
      action: PayloadAction<{ user: User; authToken: string }>
    ) => {
      state.loading = true;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      usersAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload,
      });
      const caisse = action.payload.isDeleted;
      if (caisse === true) {
        usersAdapter.removeOne(state, action.payload.id);
        state.total -= 1;
      }

      state.loading = false;
    },
    updateUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteUserRequest: (
      state,
      action: PayloadAction<{ user: User; authToken: string }>
    ) => {
      usersAdapter.removeOne(state, action.payload.user.id);
      state.total = state.total - 1;

      state.loading = true;
    },

    deleteUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchUsersById: (
      state,
      action: PayloadAction<{ userId: number; authToken: string }>
    ) => {
      state.loading = true;
    },
    fetchUsersByIdSuccess: (state, action: PayloadAction<User>) => {
      usersAdapter.upsertOne(state, action.payload);
      state.loading = false;
    },
    editProfileRequest: (
      state,
      action: PayloadAction<{ user: User; authToken: string }>
    ) => {
      state.loading = true;
    },
    editProfileSuccess: (state, action: PayloadAction<User>) => {
      usersAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload,
      });
      state.loading = false;
    },
    editProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    verifyPasswordRequest: (
      state,
      action: PayloadAction<{ passwordData: PasswordData; authToken: string }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    verifyPasswordSuccess: (state) => {
      state.loading = false;
    },
    verifyPasswordFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const usersSelectors = usersAdapter.getSelectors(
  (state: RootState) => state.users
);

export const { actions } = usersSlice;
export default usersSlice.reducer;
