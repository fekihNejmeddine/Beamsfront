import { call, put, takeEvery } from "redux-saga/effects";
import axios from "axios";
import PATHS from "../../PATH/apiPath";
import { actions } from "./slice";

// Fetch Buildings
function* fetchBuildingsSaga(action: any) {
  try {
    const {
      page,
      limit,
      search,
      address,
      numberOfFloors,
      pageSize,
      authToken,
    } = action.payload;
    const response = yield call(axios.get, PATHS.SYNDIC.GET_ALL_BUILDING, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { page, limit, search, address, numberOfFloors, pageSize },
    });
    console.log(response)
    yield put(actions.fetchBuildingsSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchBuildingsFailure(error.message));
  }
}

// Delete Building
function* deleteBuildingSaga(
  action: ReturnType<typeof actions.deleteBuildingRequest>
) {
  const { building, authToken } = action.payload;
  try {
    yield call(axios.delete, `${PATHS.SYNDIC.DELETE_BUILDING}/${building.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (error: any) {
    yield put(actions.deleteBuildingFailure(error.message));
  }
}

// Update Building
function* updateBuildingSaga(action: any) {
  try {
    const { building, authToken } = action.payload;
    yield call(axios.put, PATHS.SYNDIC.PUT_BUILDING + building.id, building, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    yield put(actions.updateBuildingSuccess(building));
  } catch (error) {
    yield put(actions.updateBuildingFailure(error.message));
  }
}

// Create Building
function* createBuildingSaga(action: any) {
  try {
    const { building, authToken } = action.payload;
    const response = yield call(
      axios.post,
      PATHS.SYNDIC.CREATE_BUILDING,
      building,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    yield put(actions.createBuildingSuccess(response.data.buildingData));
  } catch (error) {
    yield put(actions.createBuildingFailure(error.message));
  }
}

function* userSaga() {
  yield takeEvery(actions.fetchBuildingsRequest.type, fetchBuildingsSaga);
  yield takeEvery(actions.deleteBuildingRequest.type, deleteBuildingSaga);
  yield takeEvery(actions.updateBuildingRequest.type, updateBuildingSaga);
  yield takeEvery(actions.createBuildingRequest.type, createBuildingSaga);
}

export default userSaga;
