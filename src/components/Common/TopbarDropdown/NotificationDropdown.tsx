import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { io } from "socket.io-client";
import useAuth from "../../../hooks/useAuth";
import { AppDispatch, RootState } from "../../../store/store";
import { addNotification } from "../../../store/notifications/slice";
import { useTranslation } from "react-i18next";

interface Notification {
  id: number;
  user_id: number;
  title: string;
  detail: string;
  type: string; // userId as string
  isRead: boolean;
  created_at: string;
}

const NotificationDropdown: React.FC = () => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [socket, setSocket] = useState<any>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<number[]>([]);

  useEffect(() => {
    if (!auth?.accessToken || !auth?.user?.id) return;

    // Initialize WebSocket
    const newSocket = io("http://localhost:3000", {
      auth: { token: auth.accessToken },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("join", `user:${auth.user.id}`);
    });

    newSocket.on("notification", (notification: Notification) => {
      console.log("Received notification:", notification);
      dispatch(addNotification(notification));
    });

    setSocket(newSocket);

    // Fetch initial notifications
    dispatch({
      type: "notifications/fetchNotifications",
      payload: { token: auth.accessToken },
    });

    return () => {
      newSocket.disconnect();
    };
  }, [auth?.accessToken, auth?.user?.id, dispatch]);

  useEffect(() => {
    // Auto-remove read notifications after 5 seconds
    const timers = notifications
      .filter(
        (notification) =>
          notification.isRead && !readNotificationIds.includes(notification.id)
      )
      .map((notification) =>
        setTimeout(() => {
          dispatch({
            type: "notifications/removeNotification",
            payload: notification.id,
          });
          setReadNotificationIds((prev) => [...prev, notification.id]);
        }, 5000)
      );

    return () => timers.forEach(clearTimeout);
  }, [notifications, readNotificationIds, dispatch]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Mark displayed (unread) notifications as read
    const unreadNotificationIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n.id);
    if (
      unreadNotificationIds.length > 0 &&
      auth?.accessToken &&
      auth?.user?.id
    ) {
      dispatch({
        type: "notifications/markNotificationsRead",
        payload: { token: auth.accessToken, user_id: auth?.user?.id },
      });
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);

  return (
    <Box>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          bgcolor: "transparent",
          borderRadius: "50%",
          "&:hover": { bgcolor: "grey.200", color: "black" },
          transition: "all 0.2s",
        }}
      >
        <Badge
          badgeContent={unreadNotifications.length}
          color="primary"
          sx={{
            "& .MuiBadge-badge": {
              fontSize: 10,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
            },
          }}
        >
          <NotificationsIcon sx={{ color: "inherit" }} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 3,
          sx: {
            maxWidth: 500,
            minWidth: 300,
            borderRadius: 2,
            bgcolor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "visible",
          },
        }}
      >
        {unreadNotifications.length === 0 ? (
          <MenuItem
            sx={{
              py: 2,
              justifyContent: "center",
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("No new notifications")}
            </Typography>
          </MenuItem>
        ) : (
          unreadNotifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={handleClose}
              sx={{
                py: 1.5,
                px: 2,
                "&:hover": {
                  bgcolor: "primary.light",
                  "& .MuiTypography-root": { color: "primary.main" },
                },
                transition: "background-color 0.2s",
              }}
            >
              <ListItemIcon>
                <CheckCircleIcon
                  fontSize="small"
                  color={notification.isRead ? "success" : "action"}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {notification.title}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5}}
                    >
                      {notification.detail}
                    </Typography>
                    <Typography variant="caption" color="grey.500">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
            </MenuItem>
          ))
        )}
        <Divider sx={{ my: 1 }} />
      </Menu>
    </Box>
  );
};

export default NotificationDropdown;
