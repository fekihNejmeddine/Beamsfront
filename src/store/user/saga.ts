import { call, put, takeEvery } from "redux-saga/effects";
import axios, { AxiosResponse } from "axios";
import PATHS from "../../PATH/apiPath";
import { actions } from "./slice";
import { User } from "./Types";

function* fetchUsersSaga(action) {
  try {
    const { page, limit, search, role, pageSize, authToken, idsyndic } =
      action.payload;
    const response = yield call(axios.get, PATHS.AUTH.GET_ALL_USER, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { page, limit, search, role, idsyndic, pageSize },
    });
    yield put(actions.fetchUsersSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchUsersFailure(error.message));
  }
}
function* fetchAllUsersSaga(action) {
  try {
    const { authToken } = action.payload;
    const response = yield call(axios.get, PATHS.AUTH.GET_ALL_USERS, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(response);
    yield put(actions.fetchAllUsersSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchUsersFailure(error.message));
  }
}
function* fetchUsersByRoleSaga(action) {
  try {
    const { role, authToken } = action.payload;
    const response = yield call(
      axios.get,
      `${PATHS.AUTH.GET_BY_ROLE}/${role}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log("response :", response);
    yield put(actions.fetchUsersByRoleSuccess(response.data));
  } catch (error: any) {
    yield put(
      actions.fetchUsersFailure(error.message || "Failed to fetch users")
    );
  }
}
function* fetchUsersById(action) {
  try {
    const { userId, authToken } = action.payload;
    const response = yield call(
      axios.get,
      `${PATHS.AUTH.GET_BY_ID}/${userId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    yield put(actions.fetchUsersByIdSuccess(response.data));
  } catch (error) {
    yield put(actions.fetchUsersFailure(error.message));
  }
}
// Delete User (Optimistic Update)
function* deleteUserSaga(action: ReturnType<typeof actions.deleteUserRequest>) {
  const { user, authToken } = action.payload;
  try {
    yield call(axios.delete, `${PATHS.AUTH.DELETE_USER}/${user.id}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch (error: any) {
    yield put(actions.deleteUserFailure(error.message));
    yield put(
      actions.fetchUsersRequest({ page: 1, limit: 5, pageSize: 5, authToken })
    );
  }
}

// Update User
function* updateUserSaga(action: ReturnType<typeof actions.updateUserRequest>) {
  try {
    const { user, authToken } = action.payload;
    const payload = {
      ...user,
      currentPassword: user.currentPassword || undefined, // Ensure undefined if empty
    };
    const response: { data: User } = yield call(
      axios.put,
      `${PATHS.AUTH.PUT_USER}/${user.id}`,
      payload,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    yield put(actions.updateUserSuccess(response.data));
  } catch (error: any) {
    yield put(
      actions.updateUserFailure(error.message || "Failed to update profile")
    );
  }
}

// Create User
function* createUserSaga(action: any) {
  try {
    const { user, authToken } = action.payload;
    const response = yield call(axios.post, PATHS.USER.CREATE_USER, user, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("user", user);
    console.log("response", response);
    yield put(actions.createUserSuccess(response.data.userData));
  } catch (error: any) {
    yield put(actions.createUserFailure(error.response.data.message));
  }
}
function* editProfileSaga(
  action: ReturnType<typeof actions.editProfileRequest>
) {
  try {
    const { user, authToken } = action.payload;
    const payload = {
      ...user,
    };
    const response: { data: User } = yield call(
      axios.put,
      `${PATHS.USER.EDIT_PROFILE}/${user.id}`,
      payload,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    yield put(actions.editProfileSuccess(response.data));
  } catch (error: any) {
    yield put(
      actions.editProfileFailure(error.message || "Failed to update profile")
    );
  }
}
function* verifyPasswordSaga(
  action: ReturnType<typeof actions.verifyPasswordRequest>
) {
  try {
    const { passwordData, authToken } = action.payload;
    const response = yield call(
      axios.post,
      PATHS.USER.VERIFY_PASSWORD, // Assuming PATHS.AUTH.VERIFY_PASSWORD = "/auth/api/user/verify-password"
      passwordData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    yield put(actions.verifyPasswordSuccess());
  } catch (error: any) {
    yield put(
      actions.verifyPasswordFailure(
        error.response?.data?.message || "Failed to update password"
      )
    );
  }
}
// Watcher Saga
function* userSaga() {
  yield takeEvery(actions.fetchUsersRequest.type, fetchUsersSaga);
  yield takeEvery(actions.fetchAllUsersRequest.type, fetchAllUsersSaga);
  yield takeEvery(actions.fetchUsersByRoleRequest.type, fetchUsersByRoleSaga);
  yield takeEvery(actions.deleteUserRequest.type, deleteUserSaga);
  yield takeEvery(actions.updateUserRequest.type, updateUserSaga);
  yield takeEvery(actions.createUserRequest.type, createUserSaga);
  yield takeEvery(actions.fetchUsersById.type, fetchUsersById);
  yield takeEvery(actions.editProfileRequest.type, editProfileSaga);
  yield takeEvery(actions.verifyPasswordRequest.type, verifyPasswordSaga);
}

export default userSaga;
