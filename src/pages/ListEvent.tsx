import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  List,
  Pagination,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Avatar,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery,
  LinearProgress,
  SelectChangeEvent,
} from "@mui/material";
import { Add, Edit, Delete, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { actions } from "../store/event/eventSlice";
import useAuth from "../hooks/useAuth";
import { EntityModal, FieldConfig } from "../components/UI/Modal";
import {
  StyledContainer,
  HeaderBox,
  StyledCard,
  StyledTabs,
  StyledListItem,
  SubmitButton,
  StyledChip,
} from "../styles/common";
import { IEvent } from "../store/event/types";
import { AppDispatch, RootState } from "../store/store";

const ListEvent: React.FC = () => {
  document.title = "Event Management";
  const { auth } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error, pagination } = useSelector(
    (state: RootState) => state.event
  );
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openVoteDialog, setOpenVoteDialog] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [modalAction, setModalAction] = useState<"create" | "edit">("create");
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">(
    "success"
  );

  const tabs = ["All", "Upcoming", "Past"];
  const eventTypes = [
    { value: "Maintenance", label: t("Maintenance") },
    { value: "TrashCollection", label: t("Trash Collection") },
    { value: "Meeting", label: t("Meeting") },
    { value: "Other", label: t("Other") },
  ];

  useEffect(() => {
    dispatch(
      actions.fetchEventsRequest({
        page: currentPage,
        limit: pagination.limit || 10,
        status: activeTab !== "All" ? activeTab : undefined,
        idsyndic: auth?.user.id,
        userId: auth.user.id,
      })
    );
  }, [dispatch]);

  const filteredEvents = events.filter((event) =>
    activeTab === "All"
      ? true
      : activeTab === "Upcoming"
      ? new Date(event.date) >= new Date()
      : new Date(event.date) < new Date()
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (action: "create" | "edit", event?: IEvent) => {
    setModalAction(action);
    setSelectedEvent(event || null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null);
  };

  const handleOpenVoteDialog = (event: IEvent) => {
    setSelectedEvent(event);
    setOpenVoteDialog(true);
  };

  const handleCloseVoteDialog = () => {
    setOpenVoteDialog(false);
    setSelectedEvent(null);
  };

  const handleSubmitEvent = async (data: Record<string, any>) => {
    try {
      const eventData: IEvent = {
        title: data.title,
        description: data.description,
        date: data.date,
        type: data.type as
          | "Maintenance"
          | "TrashCollection"
          | "Meeting"
          | "Other",
        idsyndic: auth?.user?.id!,
        id: selectedEvent?.id,
      };

      if (modalAction === "create") {
        await dispatch(actions.createEventRequest({ ...eventData }));
        setSnackbarMessage(t("Event created successfully"));
      } else {
        await dispatch(actions.updateEventRequest({ ...eventData }));
        setSnackbarMessage(t("Event updated successfully"));
      }
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseModal();
    } catch (error) {
      setSnackbarMessage(t("Operation failed"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      dispatch(
        actions.deleteEventRequest({
          eventId: eventToDelete,
        })
      );
      setSnackbarMessage(t("Event deleted successfully"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
      setEventToDelete(null);
    } catch (error) {
      setSnackbarMessage(t("Failed to delete event"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const eventFields: FieldConfig[] = [
    {
      label: t("Title"),
      name: "title",
      type: "text",
      value: selectedEvent?.title || "",
      required: true,
      rules: { required: t("Title is required") },
    },
    {
      label: t("Description"),
      name: "description",
      type: "text",
      value: selectedEvent?.description || "",
      required: true,
      multiline: true,
      rows: 4,
      rules: { required: t("Description is required") },
    },
    {
    label: t("Date"),
    name: "date",
    type: "datetime-local",
    value: selectedEvent?.date
      ? new Date(selectedEvent.date).toISOString().slice(0, 16)
      : "",
    required: true,
    rules: { 
      required: t("Date is required"),
      validate: (value: string) => {
        if (modalAction === "create" && new Date(value) < new Date()) {
          return t("Date cannot be in the past");
        }
        return true;
      }
    },
    inputProps: {
      min: modalAction === "create" 
        ? new Date().toISOString().slice(0, 16) 
        : undefined
    }
  },
    {
      label: t("Type"),
      name: "type",
      inputType: "select",
      value: selectedEvent?.type || "Maintenance",
      required: true,
      selectOptions: eventTypes,
      rules: { required: t("Type is required") },
    },
  ];

  const handleModalChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | SelectChangeEvent<string>
      | { target: { name: string; value: any } }
  ) => {
    console.log("Form field changed:", e.target.name, e.target.value);
  };

  return (
    <StyledContainer maxWidth={false} disableGutters>
      <HeaderBox>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, fontSize: { xs: "1.8rem", sm: "2.5rem" } }}
        >
          {t("Event Management")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenModal("create")}
          sx={{ mt: 2 }}
        >
          {t("Add Event")}
        </Button>
      </HeaderBox>
      <StyledTabs
        value={activeTab}
        onChange={(e, value) => setActiveTab(value)}
        centered
      >
        {tabs.map((tab) => (
          <Tab key={tab} label={t(tab)} value={tab} />
        ))}
      </StyledTabs>
      {loading ? (
        <Box textAlign="center" py={6}>
          <CircularProgress color="primary" size={60} />
        </Box>
      ) : error ? (
        <Box
          sx={{
            backgroundColor: "error.light",
            color: "error.contrastText",
            p: 3,
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          {error}
        </Box>
      ) : filteredEvents.length === 0 ? (
        <Typography
          textAlign="center"
          color="text.secondary"
          sx={{ py: 6, fontSize: "1.2rem" }}
        >
          {t("No events found")}
        </Typography>
      ) : (
        <List>
          {filteredEvents.map((event) => (
            <StyledCard key={event.id}>
              <StyledListItem>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      {event.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {event.description}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(event.date).toLocaleString()}
                    </Typography>
                  </Box>
                  <StyledChip
                    label={t(event.type)}
                    color="primary"
                    size="small"
                  />
                </Box>
                <Box
                  display="flex"
                  gap={1}
                  sx={{
                    flexDirection: { xs: "row", sm: "row" },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <Tooltip title={t("View Votes")}>
                    <IconButton onClick={() => handleOpenVoteDialog(event)}>
                      <Visibility color="info" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Edit Event")}>
                    <IconButton onClick={() => handleOpenModal("edit", event)}>
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Delete Event")}>
                    <IconButton
                      onClick={() => {
                        setEventToDelete(event.id!);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </StyledListItem>
            </StyledCard>
          ))}
        </List>
      )}
      <Pagination
        count={Math.ceil(pagination.total / (pagination.limit || 10))}
        page={currentPage}
        onChange={handlePageChange}
        sx={{ mt: 3, display: "flex", justifyContent: "center" }}
        color="primary"
      />
      <EntityModal
        open={openModal}
        onClose={handleCloseModal}
        title={modalAction === "create" ? t("Create Event") : t("Edit Event")}
        entity={
          selectedEvent || {
            title: "",
            description: "",
            date: "",
            type: "Maintenance",
          }
        }
        fields={eventFields}
        onSubmit={handleSubmitEvent}
        entityType="event"
        isLoading={loading}
        onChange={handleModalChange}
      />
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>{t("Confirm Deletion")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Are you sure you want to delete this event?")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={loading}>
            {t("Cancel")}
          </Button>
          <SubmitButton
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {t("Confirm")}
          </SubmitButton>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openVoteDialog}
        onClose={handleCloseVoteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("Vote Details")} - {selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6">{t("Vote Summary")}</Typography>
              <LinearProgress
                variant="determinate"
                value={
                  (selectedEvent.votesFor || 0) +
                    (selectedEvent.votesAgainst || 0) >
                  0
                    ? ((selectedEvent.votesFor || 0) /
                        ((selectedEvent.votesFor || 0) +
                          (selectedEvent.votesAgainst || 0))) *
                      100
                    : 0
                }
                sx={{ my: 2 }}
              />
              <Typography>
                {t("For")}: {selectedEvent.votesFor || 0} (
                {(selectedEvent.votesFor || 0) +
                  (selectedEvent.votesAgainst || 0) >
                0
                  ? (
                      ((selectedEvent.votesFor || 0) /
                        ((selectedEvent.votesFor || 0) +
                          (selectedEvent.votesAgainst || 0))) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %)
              </Typography>
              <Typography>
                {t("Against")}: {selectedEvent.votesAgainst || 0} (
                {(selectedEvent.votesFor || 0) +
                  (selectedEvent.votesAgainst || 0) >
                0
                  ? (
                      ((selectedEvent.votesAgainst || 0) /
                        ((selectedEvent.votesFor || 0) +
                          (selectedEvent.votesAgainst || 0))) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %)
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVoteDialog}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default ListEvent;
