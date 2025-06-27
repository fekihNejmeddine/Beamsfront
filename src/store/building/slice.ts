import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Building } from "./Types";
import { RootState } from "../store";

// Utilisation de createEntityAdapter pour normaliser les utilisateurs
const buildingsAdapter = createEntityAdapter({
  selectId: (building: Building) => building.id,
});

const initialState = buildingsAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  total: 0,
  currentPage: 0,
  pageSize: 0,
  hasMore: true,
  searchQuery: "",
  address: "",
  numberOfFloors: 0,
});

const buildingsSlice = createSlice({
  name: "buildings",
  initialState,
  reducers: {
    fetchBuildingsRequest: (
      state,
      action: PayloadAction<{
        page: number;
        limit?: number;
        search?: string;
        address?: string;
        numberOfFloors?: number;
        pageSize?: number;
        authToken: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
      state.currentPage = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.searchQuery = action.payload.search;
      state.address = action.payload.address;
      state.numberOfFloors = action.payload.numberOfFloors;
    },
    fetchBuildingsSuccess: (
      state,
      action: PayloadAction<{ buildings: Building[]; total: number }>
    ) => {
      state.error = null;
      state.loading = false;

      buildingsAdapter.setAll(state, action.payload.buildings);
      state.total = action.payload.total;
      state.hasMore = action.payload.buildings.length === state.pageSize;
    },
    fetchBuildingsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    createBuildingRequest: (
      state,
      action: PayloadAction<{ building: Building; authToken: string }>
    ) => {
      state.loading = true;
    },
    createBuildingSuccess: (state, action: PayloadAction<Building>) => {
     // buildingsAdapter.addOne(state, action.payload);
      state.loading = false;

      state.total = state.total + 1;
    },
    createBuildingFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateBuildingRequest: (
      state,
      action: PayloadAction<{ building: Building; authToken: string }>
    ) => {
      state.loading = true;
    },
    updateBuildingSuccess: (state, action: PayloadAction<Building>) => {
      buildingsAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload,
      });
      const caisse = action.payload.isDeleted;
      if (caisse == true) {
        buildingsAdapter.removeOne(state, action.payload.id);
        state.total -= 1;
      }
      state.loading = false;
    },
    updateBuildingFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteBuildingRequest: (
      state,
      action: PayloadAction<{ building: Building; authToken: string }>
    ) => {
      buildingsAdapter.removeOne(state, action.payload.building.id);

      state.loading = true;
    },

    deleteBuildingFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const buildingsSelectors = buildingsAdapter.getSelectors(
  (state: RootState) => state.buildings
);

export const { actions } = buildingsSlice;
export default buildingsSlice.reducer;
