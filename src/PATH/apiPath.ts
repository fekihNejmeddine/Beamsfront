const AUTH = "http://localhost:3001/auth";
const SYNDIC = "http://localhost:3001/syndic";
const MEET = "http://localhost:3001/meetings";
const FEES = "http://localhost:3001/fees";
const RECLAMATION = "http://localhost:3001/auth/api/reclamation";
const PATHS = {
  AUTH: {
    LOGIN: AUTH + "/api/auth/login",
    LOGOUT: AUTH + "/api/auth/logout",
    CREATE: AUTH + "/api/auth/Signup",
    ACTIVATE: AUTH + "/api/auth/activate",
    GET_ALL_USER: AUTH + "/api/user",
    GET_ALL_USERS: AUTH + "/api/user/ALLUSERS",
    GET_BY_ID: AUTH + "/api/user/",
    GET_BY_ROLE: AUTH + "/api/user/role/",
    PUT_USER: AUTH + "/api/user/",
    DELETE_USER: AUTH + "/api/user/",
    FORGETPASSWORD: AUTH + "/api/auth/forgot-password/",
    CHANGE_PASSWORD: AUTH + "/api/auth/change-password",
    RESET_PASSWORD: AUTH + "/api/auth/reset-password",
    REFRESH_TOKEN: AUTH + "/api/auth/refresh-token",
  },
  USER: {
    CREATE_USER: AUTH + "/api/user/create",
    EDIT_PROFILE: AUTH + "/api/user/edit-profile",
    VERIFY_PASSWORD: AUTH + "/api/user/verify-password",
  },
  RECLAMATION: {
    CREATE_RECLAMATION: RECLAMATION,
    DELETE_RECLAMATION: RECLAMATION,
    PUT_RECLAMATION: RECLAMATION,
    GET_RECLAMATION_BY_USERID: RECLAMATION,
    GET_ALL_RECLAMATIONS: RECLAMATION,
  },
  SYNDIC: {
    CREATE_ROOM: SYNDIC + "/api/room",
    GET_ALL_ROOM: SYNDIC + "/api/room",
    PUT_ROOM: SYNDIC + "/api/room/",
    DELETE_ROOM: SYNDIC + "/api/room/",

    CREATE_BUILDING: SYNDIC + "/api/building",
    GET_ALL_BUILDING: SYNDIC + "/api/building",
    PUT_BUILDING: SYNDIC + "/api/building/",
    DELETE_BUILDING: SYNDIC + "/api/building/",

   
    CREATE_EVENT: SYNDIC +"/api/event/events",
    GET_ALL_EVENT:SYNDIC + "/api/event/events",
    GET_BY_ID_EVENT:SYNDIC + "/api/event/events/:id",
    DELETE_EVENT: SYNDIC +"/api/event/:id",
    UPDATE_EVENT:SYNDIC + "/api/event/:id",
    VOTE_EVENT: SYNDIC +"/api/event/events/:id/vote",

  },
  MEET: {
    CREATE_MEET: MEET + "/api/meeting",
    GET_ALL_MEET: MEET + "/api/meeting",
    GET_MEET_BY_ID: MEET + "/api/meeting",
    GET_MEET_BY_ROOM: MEET + "/api/meeting/Room/",
    PUT_MEET: MEET + "/api/meeting/",
    DELETE_MEET: MEET + "/api/meeting/",
    CHECK_MEET: MEET + "/api/meeting/check",

    GET_ALL_MEETINGROOM: MEET + "/api/meetingRoom",
  },
  MEETINGROOM: {
    CREATE_MEET: MEET + "/api/meetingRoom",
    GET_ALL: MEET + "/api/meetingRoom",
    GET_BY_ID: MEET + "/api/meetingRoom/",
    DELETE: MEET + "/api/meetingRoom/",
    UPDATE: MEET + "/api/meetingRoom/",
  },
  FEES: {
    CREATE_TRANSACTION: FEES + "/transaction",
    UPDATE_TRANSACTION: FEES + "/transaction",
    DELETE_TRANSACTION: FEES + "/transaction",
    GET_BY_CAISSE_TRANSACTION: FEES + "/transaction/caisse",

    CREATE_CAISSE: FEES + "/caisse",
    DELETE_CAISSE: FEES + "/caisse",
    PUT_CAISSE: FEES + "/caisse",
    GET_ALL_CAISSE: FEES + "/caisse",
    GET_CAISSE: FEES + "/caisse/AllCaisses",
    GET_BY_CAISSE_BALANCE: FEES + "/caisse",
    ADD_PARTICIPANT: FEES + "/caisse/participants",
    DELETE_PARTICIPANT: FEES + "/caisse/participants",
    GET_PARTICIPANT_CAISSE: FEES + "/caisse/participants",
  },
};

export default PATHS;
