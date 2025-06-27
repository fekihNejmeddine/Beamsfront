import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import {
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
} from "./slice";
import { IReclamation } from "./types";
import PATHS from "../../PATH/apiPath";

function* fetchAllReclamationsSaga(action) {
  try {
    const { idSyndic } = action.payload;
    console.log(idSyndic)
    const response = yield call(
      axios.get,
      PATHS.RECLAMATION.GET_ALL_RECLAMATIONS,
      { params: { idSyndic } }
    );
    console.log("response :", response.data);

    yield put(fetchAllReclamationsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchAllReclamationsFailure(error.message));
  }
}

function* fetchReclamationsSaga(
  action: ReturnType<typeof fetchReclamations>
): Generator {
  try {
    const { userId, search, status, page, limit } = action.payload;

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const url = `${
      PATHS.RECLAMATION.GET_RECLAMATION_BY_USERID
    }/${userId}?${params.toString()}`;

    const response: any = yield call(axios.get, url);

    yield put(
      fetchReclamationsSuccess({
        data: response.data.data,
        total: response.data.total,
        page: response.data.page || 1,
        limit: response.data.limit || 5,
      })
    );
  } catch (error: any) {
    yield put(fetchReclamationsFailure(error.message));
  }
}

function* createReclamationSaga(
  action: ReturnType<typeof createReclamation>
): Generator {
  console.log("action.payload :", action.payload);
  try {
    const response: any = yield call(
      axios.post,
      PATHS.RECLAMATION.CREATE_RECLAMATION,
      action.payload
    );
    console.log("response :", response);
    yield put(createReclamationSuccess(response.data.Data));
  } catch (error: any) {
    yield put(createReclamationFailure(error.message));
  }
}

function* updateReclamationSaga(
  action: ReturnType<typeof updateReclamation>
): Generator {
  try {
    const { id, ...data } = action.payload;
    console.log("id :", id);
    console.log("data :", data);
    const response = yield call(
      axios.put,
      `${PATHS.RECLAMATION.PUT_RECLAMATION}/${id}`,
      data
    );
    yield put(updateReclamationSuccess(response.data.data));
  } catch (error: any) {
    yield put(updateReclamationFailure(error.message));
  }
}

function* deleteReclamationSaga(
  action: ReturnType<typeof deleteReclamation>
): Generator {
  try {
    yield call(
      axios.delete,
      `${PATHS.RECLAMATION.DELETE_RECLAMATION}/${action.payload}`
    );
    yield put(deleteReclamationSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteReclamationFailure(error.message));
  }
}

export default function* reclamationSaga() {
  yield takeLatest(fetchReclamations.type, fetchReclamationsSaga);
  yield takeLatest(fetchAllReclamations.type, fetchAllReclamationsSaga);
  yield takeLatest(createReclamation.type, createReclamationSaga);
  yield takeLatest(updateReclamation.type, updateReclamationSaga);
  yield takeLatest(deleteReclamation.type, deleteReclamationSaga);
}
