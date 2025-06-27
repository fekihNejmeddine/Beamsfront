import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import {  Transaction, Caisse } from "./Types";
import { RootState } from "../store";

const caissesAdapter = createEntityAdapter({
  selectId: (caisse: Caisse) => caisse.id,
});

const initialState = caissesAdapter.getInitialState({
  loading: false,
  error: null as string | null,
  total: 0,
  currentPage: 0,
  pageSize: 0,
  hasMore: true,
  searchQuery: "",
  name: "",
  caisses: [],
  caisse: null,
  transactions: [],
  createSuccessTransaction: false,
  updateSuccessTransaction: false,
  deleteSuccessTransaction: false,

  Ttotal: 0,
  TcurrentPage: 0,
  TpageSize: 0,
  annee: 0,
  mois: 0,
});

const feesSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    fetchCaissesRequest: (
      state,
      action: PayloadAction<{
        page?: number;
        limit?: number;
        search?: string;
        name?: string;
        pageSize?: number;
        authToken?: string;
      }>
    ) => {
      state.loading = true;
      state.error = null;
      state.currentPage = action.payload.page ?? state.currentPage;
      state.pageSize = action.payload.pageSize ?? state.pageSize;
      state.searchQuery = action.payload.search ?? state.searchQuery;
      state.name = action.payload.name ?? state.name;
    },

    fetchCaissesSuccess: (
      state,
      action: PayloadAction<{ caisses: Caisse[]; total: number }>
    ) => {
      state.error = null;
      state.loading = false;

      caissesAdapter.setAll(state, action.payload.caisses);
      state.total = action.payload.total;
      state.hasMore = action.payload.caisses.length === state.pageSize;
    },
    fetchCaissesFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    createCaisseRequest(
      state,
      _action: PayloadAction<{ caisse: Caisse; token: string }>
    ) {
      state.loading = true;
      state.error = null;
    },
    createCaisseSuccess(state, action: PayloadAction<Caisse>) {
      state.total += 1;
      state.loading = false;
    },
    createCaisseFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    updateCaisseRequest(
      state,
      _action: PayloadAction<{ caisse: Caisse; token: string }>
    ) {
      state.loading = true;
      state.error = null;
    },
    updateCaisseSuccess(state, action: PayloadAction<Caisse>) {
      caissesAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload,
      });
      const caisse = action.payload.isDeleted;
      if (caisse == true) {
        caissesAdapter.removeOne(state, action.payload.id);
        state.total -= 1;
      }

      state.loading = false;
      state.error = null;
    },
    updateCaisseFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    deleteCaisseRequest(
      state,
      _action: PayloadAction<{ caisseId: number; token: string }>
    ) {
      state.loading = true;
      state.error = null;
    },
    deleteCaisseSuccess(state, action: PayloadAction<number>) {
      //caissesAdapter.removeOne(state, action.payload.caisses.id);
      console.log(action.payload);
      state.caisses = state.caisses.filter((c) => c.id !== action.payload);
      state.loading = false;
    },
    deleteCaisseFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    fetchCaisseRequest: (
      state,
      action: PayloadAction<{
        authToken: string;
      }>
    ) => {
      state.loading = true;
    },

    fetchCaisseSuccess(state, action) {
      state.loading = true;
      console.log(action.payload);
      caissesAdapter.addMany(state, action.payload);
    },
    fetchCaisseFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    fetchTransactionsRequest: (
      state,
      action: PayloadAction<{
        caisseId: number;
        token: string;
        Tpage?: number;
        Tlimit?: number;
        annee?: number;
        mois?: number;
        TpageSize?: number;
      }>
    ) => {
      state.loading = true;
      state.error = null;
      state.TcurrentPage = action.payload.Tpage ?? state.TcurrentPage;
      state.TpageSize = action.payload.TpageSize ?? state.TpageSize;
      state.annee = action.payload.annee ?? state.annee;
      state.mois = action.payload.mois ?? state.mois;
    },
    fetchTransactionsSuccess: (
      state,
      action: PayloadAction<{
        transactions: Transaction[];
        Ttotal: number;
        Tpage?: number;
        TpageSize?: number;
      }>
    ) => {
      state.loading = false;
      state.transactions = action.payload.transactions;

      state.Ttotal = action.payload.Ttotal;
    },
    fetchTransactionsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    createTransactionRequest(
      state,
      _action: PayloadAction<{ transaction: Transaction; token: string }>
    ) {
      state.loading = true;
      state.error = null;
    },
    createTransactionSuccess(state, action: PayloadAction<Transaction>) {
      state.transactions = [...state.transactions, action.payload];
      if (state.caisse) {
        state.caisse.balance += action.payload.amount;
      }state.Ttotal += 1;
      state.loading = false;
      state.createSuccessTransaction = true;
    },
    createTransactionFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    updateTransactionRequest(
      state,
      _action: PayloadAction<{ data: Transaction; token: string }>
    ) {
      state.loading = true;
      state.error = null;
    },

    updateTransactionSuccess(state, action: PayloadAction<Transaction>) {
      state.transactions = state.transactions.map((transaction) =>
        transaction.id === action.payload.id ? action.payload : transaction
      );

      state.loading = false;
      state.updateSuccessTransaction = true;
    },
    updateTransactionFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    deleteTransactionRequest(
      state,
      _action: PayloadAction<{ id: number; token: string }>
    ) {
      state.loading = true;
      state.error = null;
    },
    deleteTransactionSuccess(state, action: PayloadAction<number>) {
      const index = state.transactions.findIndex(
        (t) => t.id === action.payload
      );
      if (index !== -1) {
        if (state.caisse) {
          state.caisse.balance -= state.transactions[index].amount;
        }
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.payload
        );
      }
      state.loading = false;
      state.deleteSuccessTransaction = true;
    },
    deleteTransactionFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },

    resetCreateTransactionSuccess(state) {
      state.createSuccessTransaction = false;
    },
    resetUpdateTransactionSuccess(state) {
      state.updateSuccessTransaction = false;
    },
    resetDeleteTransactionSuccess(state) {
      state.deleteSuccessTransaction = false;
    },
  },
});
export const caissesSelectors = caissesAdapter.getSelectors(
  (state: RootState) => state.fees
);
export const { actions } = feesSlice;

export default feesSlice.reducer;
