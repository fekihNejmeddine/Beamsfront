import {
  takeEvery,
  put,
  call,
  takeLatest,
  SagaReturnType,
  select,
} from "redux-saga/effects";
import { actions } from "./slice";
import axios from "axios";
import PATHS from "../../PATH/apiPath";
import { RootState } from "../store";
import { Event } from "./types";

interface Payload<T> {
  payload: T;
  type: string;
}

interface AvailabilityResponse {
  exists: boolean;
  waitingPosition: number;
  message: string;
}

enum AvailabilityStatus {
  FIRST_CHOICE = 1,
  SECOND_CHOICE = 2,
  THIRD_CHOICE = 3,
  FOURTH_CHOICE = 4,
  UPDATE_CHOICE = 5,
  DEFAULT_CHOICE = 6,
}

// API Response Types
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Utility function to handle API errors
const handleApiError = (error: any): string => {
  return (
    error.response?.data?.message || error.message || "Une erreur est survenue"
  );
};

// Saga Workers
function* fetchEventsByRoom(action: Payload<{ meetingRoom: string }>) {
  try {
    const { meetingRoom } = action.payload;

    const response: ApiResponse<any> = yield call(
      axios.get,
      `${PATHS.MEET.GET_MEET_BY_ROOM}${meetingRoom}`
    );
    yield put(actions.getEventsSuccess(response.data));
  } catch (error) {
    yield put(actions.getEventsFail(handleApiError(error)));
  }
}

function* fetchMeetingRoom(action: Payload<{}>) {
  try {
    const response: ApiResponse<any> = yield call(
      axios.get,
      PATHS.MEET.GET_ALL_MEETINGROOM
    );
    yield put(actions.fetchMeetingRoomsSuccess(response.data.meetingRooms));
  } catch (error) {
    yield put(actions.fetchMeetingRoomsFail(handleApiError(error)));
  }
}

function* checkAvailability(event: Event, token: string): SagaReturnType<any> {
  try {
    let id = event.id ?? 0;
    const response: ApiResponse<AvailabilityResponse> = yield call(
      axios.get,
      `${PATHS.MEET.CHECK_MEET}/${event.startTime}/${event.endTime}/${id}/${event.waitingPosition}/${event.idMeetingRoom}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const { exists, waitingPosition, message } = response.data;
    return { exists, waitingPosition, message };
  } catch (error) {
    console.error("Error checking availability:", error);
    return { exists: false, waitingPosition: 1, message: "Error occurred" };
  }
}

function* onMoveEvent(action: Payload<{ event: Event; token: string }>) {
  try {
    const { event, token } = action.payload;

    const {  waitingPosition, message } = yield call(
      checkAvailability,
      event,
      token
    );

    if (
      waitingPosition !== AvailabilityStatus.FIRST_CHOICE &&
      event.status === "scheduled"
    ) {
      yield put(
        actions.showWaitingPositionConfirmation({
          event,
          waitingPosition,
          message,
        })
      );
      return;
    }

    const updatedEvent = { ...event, waitingPosition: 1 };
    
    yield put(actions.moveEventSuccess(message));
  } catch (error) {
    yield put(actions.moveEventFail(handleApiError(error)));
  }
}

function* onAddEvent(action: Payload<{ event: Event; token: string }>) {
  try {
    const { event, token } = action.payload;

    const {  waitingPosition, message } = yield call(
      checkAvailability,
      event,
      token
    );
    if (
      waitingPosition !== AvailabilityStatus.FIRST_CHOICE &&
      event.status === "scheduled"
    ) {
      console.log("event :", event);
      yield put(
        actions.showWaitingPositionConfirmation({
          event,
          waitingPosition,
          message,
        })
      );
      return;
    }
    if (waitingPosition !== AvailabilityStatus.FIRST_CHOICE) {
      // Dispatch an action to show the confirmation modal instead of updating directly
      yield put(
        actions.showWaitingPositionConfirmation({
          event,
          waitingPosition,
          message,
        })
      );
      return; // Stop execution here, wait for user confirmation
    }
    const response: ApiResponse<any> = yield call(
      axios.post,
      PATHS.MEET.CREATE_MEET,
      { ...event, waitingPosition: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    yield put(actions.addEventSuccess(response.data.Data));
  } catch (error) {
    yield put(actions.addEventFail(handleApiError(error)));
  }
}

function* onUpdateEvent(action: Payload<{ event: Event; token: string }>) {
  try {
    const { event, token } = action.payload;
    console.log("event :", event);
    const {  waitingPosition, message } = yield call(
      checkAvailability,
      event,
      token
    );
    // Auto-delete if status is cancelled
    if (event.status === "cancelled") {
      yield call(axios.delete, `${PATHS.MEET.DELETE_MEET}/${event.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      yield put(actions.deleteEventSuccess(event.id));
      return;
    }

    if (waitingPosition !== AvailabilityStatus.FIRST_CHOICE) {
      // Dispatch an action to show the confirmation modal instead of updating directly
      yield put(
        actions.showWaitingPositionConfirmation({
          event,
          waitingPosition,
          message,
        })
      );
      return; // Stop execution here, wait for user confirmation
    }

    const updatedEvent = { ...event, waitingPosition: 1 };

    const response: ApiResponse<any> = yield call(
      axios.put,
      `${PATHS.MEET.PUT_MEET}/${event.id}`,
      updatedEvent,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    yield put(actions.updateEventSuccess(response.data));
  } catch (error) {
    yield put(actions.updateEventFail(handleApiError(error)));
  }
}

function* onDeleteEvent(action: Payload<{ eventId: number; token: string }>) {
  try {
    const { eventId, token } = action.payload;

    // Optimistic update: Remove event from store immediately
    yield put(actions.deleteEventSuccess(eventId));

    yield call(axios.delete, `${PATHS.MEET.DELETE_MEET}/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // No need to dispatch again since optimistic update already removed the event
  } catch (error) {
    // Revert optimistic update by refetching events (fallback)
    yield put(actions.deleteEventFail(handleApiError(error)));
    //yield put(actions.onGetEvents({ meetingRoom: '1' })); // Adjust meetingRoom as needed
  }
}

function* onConfirmWaitingPosition(
  action: Payload<{ event: Event; token: string; accept: boolean }>
) {
  try {
    const { event, token, accept } = action.payload;
    let id = event.id;
    console.log("event.id :", id);

    if (accept) {
      const { waitingPosition } = yield select((state: RootState) => ({
        waitingPosition: state.calendar.waitingPosition,
      }));
      if (event.id) {
        const updatedEvent = { ...event, waitingPosition };
        const response: ApiResponse<any> = yield call(
          axios.put,
          `${PATHS.MEET.PUT_MEET}/${event.id}`,
          updatedEvent,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        yield put(actions.updateEventSuccess(response.data));
      } else {
        const response: ApiResponse<any> = yield call(
          axios.post,
          PATHS.MEET.CREATE_MEET,
          { ...event, waitingPosition },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        yield put(actions.addEventSuccess(response.data.Data));
      }
    } else {
      yield put(actions.showTimeSelectionModal({ event }));
    }
  } catch (error) {
    yield put(actions.updateEventFail(handleApiError(error)));
  }
}

export default function* calendarSaga() {
  yield takeEvery(actions.fetchMeetingRoom.type, fetchMeetingRoom);
  yield takeEvery(actions.onGetEvents.type, fetchEventsByRoom);
  yield takeLatest(actions.onAddNewEvent.type, onAddEvent);
  yield takeEvery(actions.updateEvent.type, onUpdateEvent);
  yield takeEvery(actions.deleteEvent.type, onDeleteEvent);
  yield takeEvery(actions.moveEventRequest.type, onMoveEvent);
  yield takeEvery(
    actions.confirmWaitingPosition.type,
    onConfirmWaitingPosition
  );
}
