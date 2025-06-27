import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Notification {
  id: number;
  user_id: number;
  title: string;
  detail: string;
  type: string;
  isRead: boolean;
  created_at: string;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.push(action.payload);
    },
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
    },
    markNotificationsRead(state) {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
    },
    removeNotification(state, action: PayloadAction<number>) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const {
  addNotification,
  setNotifications,
  markNotificationsRead,
  removeNotification,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;