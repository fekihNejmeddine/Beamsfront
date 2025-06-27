import { call, put, takeEvery } from "redux-saga/effects";
import axios from "axios";
import { setNotifications, markNotificationsRead } from "./slice";

interface NotificationAction {
  type: string;
  payload: {
    token: string;
    user_id?: number;
  };
}

function* fetchNotifications(action: NotificationAction): Generator {
  try {
    const { token } = action.payload;
    if (!token) {
      throw new Error("No access token available");
    }
    const response = yield call(
      axios.get,
      "http://localhost:3001/api/notifications/all",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    yield put(setNotifications(response.data.notifications));
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

function* markNotificationsReadSaga(action: NotificationAction): Generator {
  try {
    const { token, user_id } = action.payload;
    if (!token || !user_id) {
      throw new Error("No access token or user ID available");
    }
    yield call(
      axios.put,
      `http://localhost:3001/api/notifications/viewed/${user_id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    yield put(markNotificationsRead());
  } catch (error) {
    console.error("Error marking notifications as read:", error);
  }
}

export default function* notificationsSaga() {
  yield takeEvery("notifications/fetchNotifications", fetchNotifications);
  yield takeEvery(
    "notifications/markNotificationsRead",
    markNotificationsReadSaga
  );
}
