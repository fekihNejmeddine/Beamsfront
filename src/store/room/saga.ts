import { call, put, takeEvery } from "redux-saga/effects";
import axios from "axios";
import PATHS from "../../PATH/apiPath";
import { actions } from "./slice";

function* fetchMeetingRoomsSaga(action: any) {
  try {
    const { page, limit, search, capacity, pageSize, authToken } =
      action.payload;
      console.log(action.payload)
    const response = yield call(axios.get, PATHS.MEETINGROOM.GET_ALL, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { page, limit, search, capacity, pageSize },
    });
   
    yield put(actions.fetchMeetingRoomsSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchMeetingRoomsFailure(error.message));
  }
}

function* deleteMeetingRoomSaga(
  action: ReturnType<typeof actions.deleteMeetingRoomRequest>
) {
  const { meetingRoom, authToken } = action.payload;
  try {
    yield call(axios.delete, `${PATHS.MEETINGROOM.DELETE}/${meetingRoom.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (error: any) {
    yield put(actions.deleteMeetingRoomFailure(error.message));
    yield put(
      actions.fetchMeetingRoomsRequest({
        page: 1,
        limit: 5,
        pageSize: 5,
        authToken,
      })
    );
  }
}

function* updateMeetingRoomSaga(action: any) {
  try {
    const { meetingRoom, authToken } = action.payload;
    yield call(
      axios.put,
      PATHS.MEETINGROOM.UPDATE + meetingRoom.id,
      meetingRoom,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    yield put(actions.updateMeetingRoomSuccess(meetingRoom));
  } catch (error) {
    yield put(actions.updateMeetingRoomFailure(error.message));
  }
}

function* createMeetingRoomSaga(action: any) {
  try {
    const { meetingRoom, authToken } = action.payload;
    const response = yield call(
      axios.post,
      PATHS.MEETINGROOM.CREATE_MEET,
      meetingRoom,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log(response)
    yield put(actions.createMeetingRoomSuccess(response.data.Data));
  } catch (error) {
    yield put(actions.createMeetingRoomFailure(error.message));
  }
}

function* meetingRoomSaga() {
  yield takeEvery(actions.fetchMeetingRoomsRequest.type, fetchMeetingRoomsSaga);
  yield takeEvery(actions.deleteMeetingRoomRequest.type, deleteMeetingRoomSaga);
  yield takeEvery(actions.updateMeetingRoomRequest.type, updateMeetingRoomSaga);
  yield takeEvery(actions.createMeetingRoomRequest.type, createMeetingRoomSaga);
}

export default meetingRoomSaga;
