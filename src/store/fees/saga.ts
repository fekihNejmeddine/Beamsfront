import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { actions } from "./caisseSlice";

import PATHS from "../../PATH/apiPath";

const deleteCaisse = (caisseId: number, token: string) =>
  axios.delete(`${PATHS.FEES.DELETE_CAISSE}/${caisseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });



const updateTransaction = (data: any, token: string) =>
  axios.put(`${PATHS.FEES.UPDATE_TRANSACTION}/${data.id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });



function* fetchCaisseSaga(action: any) {
  try {
    const response = yield call(axios.get, PATHS.FEES.GET_CAISSE);
    console.log("response :", response);
    yield put(actions.fetchCaisseSuccess(response.data));
  } catch (error: any) {
    yield put(actions.fetchCaisseFailure(error.message));
  }
}

function* fetchCaissesSaga(action: any) {
  try {
    const { page, limit, search, name, pageSize, authToken } = action.payload;
    const response = yield call(axios.get, PATHS.FEES.GET_ALL_CAISSE, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { page, limit, search, name, pageSize },
    });

    yield put(actions.fetchCaissesSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchCaissesFailure(error.message));
  }
}
function* createCaisseSaga(action: any) {
  try {
    const { caisse, token } = action.payload;
    console.log("caisse:", caisse);
    const response = yield call(axios.post, PATHS.FEES.CREATE_CAISSE, caisse, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("createCaisse response:", response.data);
    yield put(actions.createCaisseSuccess(response.data.Data));
  } catch (error: any) {
    yield put(actions.createCaisseFailure(error.message));
  }
}

function* updateCaisseSaga(action: any) {
  try {
    const { caisse, token } = action.payload;
    let caisseID = caisse.id;
    const response = yield call(
      axios.put,
      `${PATHS.FEES.PUT_CAISSE}/${caisseID}`,
      caisse,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    yield put(actions.updateCaisseSuccess(response.data));
  } catch (error: any) {
    yield put(actions.updateCaisseFailure(error.message));
  }
}

function* deleteCaisseSaga(action: any) {
  try {
    const { caisseId, token } = action.payload;
    yield call(deleteCaisse, caisseId, token);
    yield put(actions.deleteCaisseSuccess(caisseId));
  } catch (error: any) {
    yield put(actions.deleteCaisseFailure(error.message));
  }
}

function* fetchTransactionsSaga(action: any) {
  try {
    const { caisseId, token, annee, mois, Tpage, Tlimit, TpageSize } =
      action.payload;
    const response = yield call(
      axios.get,
      `${PATHS.FEES.GET_BY_CAISSE_TRANSACTION}/${caisseId}/transactions`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { annee, mois, Tpage, Tlimit, TpageSize },
      }
    );
    console.log("response :", response.data);
    yield put(actions.fetchTransactionsSuccess(response.data));
  } catch (error: any) {
    yield put(actions.fetchTransactionsFailure(error.message));
  }
}

function* createTransactionSaga(action: any) {
  try {
    const { transaction, token } = action.payload;
    console.log("data :", transaction);
    const response = yield call(
      axios.post,
      PATHS.FEES.CREATE_TRANSACTION,
      transaction,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    yield put(actions.createTransactionSuccess(response.data.Data));
  } catch (error: any) {
    yield put(actions.createTransactionFailure(error.message));
  }
}

function* updateTransactionSaga(action: any) {
  try {
    const { data, token } = action.payload;
    const response = yield call(updateTransaction, data, token);
    yield put(actions.updateTransactionSuccess(response.data));
  } catch (error: any) {
    yield put(actions.updateTransactionFailure(error.message));
  }
}

function* deleteTransactionSaga(action: any) {
  try {
    const { id, token } = action.payload;
    yield call(axios.delete, `${PATHS.FEES.DELETE_TRANSACTION}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    yield put(actions.deleteTransactionSuccess(id));
  } catch (error: any) {
    yield put(actions.deleteTransactionFailure(error.message));
  }
}

export default function* feesSaga() {
  yield takeLatest(actions.fetchCaisseRequest.type, fetchCaisseSaga);
  yield takeLatest(actions.fetchCaissesRequest.type, fetchCaissesSaga);
  yield takeLatest(actions.createCaisseRequest.type, createCaisseSaga);
  yield takeLatest(actions.updateCaisseRequest.type, updateCaisseSaga);
  yield takeLatest(actions.deleteCaisseRequest.type, deleteCaisseSaga);

  yield takeLatest(
    actions.fetchTransactionsRequest.type,
    fetchTransactionsSaga
  );
  yield takeLatest(
    actions.createTransactionRequest.type,
    createTransactionSaga
  );
  yield takeLatest(
    actions.updateTransactionRequest.type,
    updateTransactionSaga
  );
  yield takeLatest(
    actions.deleteTransactionRequest.type,
    deleteTransactionSaga
  );
}
