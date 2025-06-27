import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IReclamation, ReclamationState } from "./types";
import { Reclamation } from "../../types/interface/Reclamation";

interface FetchReclamationsPayload {
  userId: number;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

const initialState: ReclamationState = {
  reclamations: [],
  error: null,
  loading: false,
  filters: {
    searchQuery: "",
    statusFilter: "All",
    page: 1,
    limit: 5,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 5,
  },
  createSuccess: false,
};
const reclamationSlice = createSlice({
  name: "reclamation",
  initialState,
  reducers: {
    fetchAllReclamations(
      state,
      action: PayloadAction<{
        idSyndic: number;
      }>
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchAllReclamationsSuccess(state, action: PayloadAction<IReclamation[]>) {
      console.log("action.payload :", action.payload);
      state.reclamations = action.payload;
      state.loading = false;
    },
    fetchAllReclamationsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
    fetchReclamations: (
      state,
      action: PayloadAction<FetchReclamationsPayload>
    ) => {
      state.loading = true;
      state.error = null;
    },
    fetchReclamationsSuccess: (
      state,
      action: PayloadAction<{
        data: IReclamation[];
        total: number;
        page: number;
        limit: number;
      }>
    ) => {
      state.reclamations = action.payload.data;
      state.pagination = {
        total: action.payload.total,
        page: action.payload.page,
        limit: action.payload.limit,
      };
      state.loading = false;
    },
    fetchReclamationsFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    createReclamation: (
      state,
      action: PayloadAction<Partial<IReclamation>>
    ) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    },
    createReclamationSuccess: (state, action: PayloadAction<IReclamation>) => {
      console.log(action.payload);
      state.reclamations.push(action.payload);
      state.loading = false;
      state.createSuccess = true;
    },
    createReclamationFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.createSuccess = false;
    },
    updateReclamation: (
      state,
      action: PayloadAction<Partial<IReclamation> & { id: number }>
    ) => {
      state.loading = true;
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
    updateReclamationSuccess: (state, action: PayloadAction<IReclamation>) => {
      const index = state.reclamations.findIndex(
        (rec) => rec.id === action.payload.id
      );
      if (index !== -1) {
        state.reclamations[index] = action.payload;
      }
      state.loading = false;
    },
    updateReclamationFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    deleteReclamation: (state, action: PayloadAction<number>) => {
      state.loading = true;
      state.error = null;
    },
    deleteReclamationSuccess: (state, action: PayloadAction<number>) => {
      state.reclamations = state.reclamations.filter(
        (rec) => rec.id !== action.payload
      );
      state.loading = false;
    },
    deleteReclamationFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  fetchAllReclamations,
  fetchAllReclamationsSuccess,
  fetchAllReclamationsFailure,
  fetchReclamations,
  fetchReclamationsSuccess,
  fetchReclamationsFailure,
  createReclamation,
  createReclamationSuccess,
  createReclamationFailure,
  updateReclamation,
  updateReclamationSuccess,
  updateReclamationFailure,
  deleteReclamation,
  deleteReclamationSuccess,
  deleteReclamationFailure,
  resetFilters,
} = reclamationSlice.actions;

export default reclamationSlice.reducer;
