import { call, put, takeLatest } from "redux-saga/effects";
import axios from "axios";
import { actions } from "./eventSlice";
import { IEvent } from "./types";
import PATHS from "../../PATH/apiPath";

function* fetchEventsSaga(action: any) {
  try {
    const { page, limit, status, idsyndic, userId, authToken } = action.payload;

    const response = yield call(axios.get, PATHS.SYNDIC.GET_ALL_EVENT, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { page, limit, status, idsyndic },
    });

    const userVotes = yield call(axios.get, `${PATHS.SYNDIC.GET_ALL_EVENT}/votes`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { userId },
    });

    const voteCounts = yield call(axios.get, `${PATHS.SYNDIC.GET_ALL_EVENT}/vote-counts`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { idsyndic },
    });
    // Map events with user votes and vote counts
    const eventsWithUserVotes = response.data.events.map((event: IEvent) => {
      const userVote = userVotes.data.find((v: any) => v.eventId === event.id);
      const voteCount = voteCounts.data.find((v: any) => v.eventId === event.id);

      return {
        ...event,
        userVote: userVote ? userVote.vote : null,
        votesFor: voteCount ? voteCount.votesFor : 0,
        votesAgainst: voteCount ? voteCount.votesAgainst : 0,
      };
    });

    yield put(
      actions.fetchEventsSuccess({
        events: eventsWithUserVotes,
        total: response.data.total,
      })
    );
  } catch (error: any) {
    yield put(actions.fetchEventsFailure(error.message));
  }
}

function* createEventSaga(action: any) {
  try {
    const { authToken, ...eventData } = action.payload;
    const response = yield call(
      axios.post,
      PATHS.SYNDIC.CREATE_EVENT,
      eventData,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    yield put(actions.createEventSuccess(response.data));
  } catch (error: any) {
    yield put(actions.createEventFailure(error.message));
  }
}

function* updateEventSaga(action: any) {
  try {
    const { id, ...data } = action.payload;
    const response = yield call(
      axios.put,
      `${PATHS.SYNDIC.UPDATE_EVENT}/${id}`,
      data,
      {
        headers: { Authorization: `Bearer ${action.payload.authToken}` },
      }
    );
    yield put(actions.updateEventSuccess(response.data));
  } catch (error: any) {
    yield put(actions.updateEventFailure(error.message));
  }
}

function* deleteEventSaga(action: any) {
  try {
    const { eventId } = action.payload;
    yield call(axios.delete, `${PATHS.SYNDIC.DELETE_EVENT}/${eventId}`, {
      //   headers: { Authorization: `Bearer ${authToken}` },
    });
    yield put(actions.deleteEventSuccess(eventId));
  } catch (error: any) {
    yield put(actions.deleteEventFailure(error.message));
  }
}

function* voteEventSaga(action: any) {
  try {
    const { eventId, vote, authToken, userId } = action.payload;
    const response = yield call(
      axios.post,
      PATHS.SYNDIC.VOTE_EVENT.replace(":id", eventId),
      { vote, userId, eventId },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    yield put(actions.voteEventSuccess({ ...response.data, userVote: vote }));
  } catch (error: any) {
    yield put(actions.voteEventFailure(error.message));
  }
}

export default function* eventSaga() {
  yield takeLatest(actions.fetchEventsRequest.type, fetchEventsSaga);
  yield takeLatest(actions.createEventRequest.type, createEventSaga);
  yield takeLatest(actions.updateEventRequest.type, updateEventSaga);
  yield takeLatest(actions.deleteEventRequest.type, deleteEventSaga);
  yield takeLatest(actions.voteEventRequest.type, voteEventSaga);
}
