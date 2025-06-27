import { all, fork } from "redux-saga/effects";

import buildingSaga from "./building/saga";
import meetingRoomSaga from "./room/saga";
import userSaga from "./user/saga";
import calendarSaga from "./calendar/saga";
import feesSaga from "./fees/saga";
import reclamationSaga from "./reclamation/saga";
import notificationsSaga from "./notifications/saga";
import event from "./event/saga";

export default function* rootSaga() {
  yield all([
    fork(buildingSaga),
    fork(meetingRoomSaga),
    fork(userSaga),
    fork(calendarSaga),
    fork(feesSaga),
    fork(reclamationSaga),
    fork(notificationsSaga),
    fork(event),
  ]);
}
