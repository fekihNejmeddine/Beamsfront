import { combineReducers } from "redux";
import buildingReducer from "./building/slice";
import usersReducer from "./user/slice";
import events from "./calendar/slice";
import feesReducer from "./fees/caisseSlice";
import reclamationSlice from "./reclamation/slice";
import notificationsReducer from "./notifications/slice";
import profileFormReducer from "./user/profileForm";
import meetingroomsReducer from "./room/slice";
import event from "./event/eventSlice";

const rootReducer = combineReducers({
  buildings: buildingReducer,
  users: usersReducer,
  calendar: events,
  fees: feesReducer,
  reclamation: reclamationSlice,
  notifications: notificationsReducer,
  profileForm: profileFormReducer,
  meetingRooms: meetingroomsReducer,
  event: event,
});

export default rootReducer;
