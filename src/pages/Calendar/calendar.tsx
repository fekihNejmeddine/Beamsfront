import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import * as Yup from "yup";
import { useFormik } from "formik";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  Draggable,
  DropArg,
} from "@fullcalendar/interaction";
import LockIcon from "@mui/icons-material/Lock";
import {
  Box,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Modal,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import useAuth from "../../hooks/useAuth";
import { actions } from "../../store/calendar/slice";
import { RootState, AppDispatch } from "../../store/store";
import { Event } from "../../types/interface/Event";
import { EntityModal, FieldConfig } from "../../components/UI/Modal";
import {
  StyledContainer,
  StyledCard,
  StyledButton,
  CategoryBox,
  StyledCalendar,
} from "./style";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { WaitingConfirmationModal } from "../../components/UI/WaitingConfirmationModal";
import { TimeSelectionModal } from "../../components/UI/TimeSelectionModal";
import { EventApi, MoreLinkArg } from "@fullcalendar/core";
import { useTranslation } from "react-i18next";
import { SelectChangeEvent } from "@mui/material/Select";
import { usersSelectors } from "../../store/user/slice";
import { actions as actionsUser } from "../../store/user/slice";
import { User } from "../../types/interface/User";
import { RegisterOptions } from "react-hook-form";

interface Participant {
  id: number;
  username: string;
  email: string;
}

const Calendar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { auth } = useAuth();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modal, setModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  const calendarRef = useRef<any>(null);
  const [open, setOpen] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dayEvents, setDayEvents] = useState<EventApi[]>([]);
  const [modalDate, setModalDate] = useState<string>("");

  const {
    moveEventError,
    moveEventSuccess,
    EventUpdateError,
    EventUpdateSuccess,
    meetingRooms,
    events,
    showWaitingConfirmation,
    waitingEvent,
    waitingPosition,
    waitingMessage,
    showTimeSelection,
    timeSelectionEvent,
    loading,
  } = useSelector((state: RootState) => ({
    moveEventError: state.calendar.moveEventError,
    moveEventSuccess: state.calendar.moveEventSuccess,
    EventUpdateError: state.calendar.EventUpdateError,
    EventUpdateSuccess: state.calendar.EventUpdateSuccess,
    meetingRooms: state.calendar.meetingRooms,
    events: state.calendar.events,
    showWaitingConfirmation: state.calendar.showWaitingConfirmation,
    waitingEvent: state.calendar.waitingEvent,
    waitingPosition: state.calendar.waitingPosition,
    waitingMessage: state.calendar.waitingMessage,
    showTimeSelection: state.calendar.showTimeSelection,
    timeSelectionEvent: state.calendar.timeSelectionEvent,
    loading: state.calendar.loading,
  }));

  const users = useSelector(usersSelectors.selectAll);
  const { loading: usersLoading, hasMore: usersHasMore } = useSelector(
    (state: RootState) => state.users
  );
  const [localPage, setLocalPage] = useState(1);

  const categories = [
    { id: 1, type: "important", title: t("Strategic IT Meeting") },
    { id: 2, type: "important", title: t("Software Architecture Review") },
    { id: 3, type: "important", title: t("Client Meeting") },
    { id: 4, type: "normal", title: t("Team Meet") },
    { id: 5, type: "normal", title: t("Daily Stand-up (Scrum)") },
    { id: 6, type: "normal", title: t("Code Review") },
    { id: 7, type: "normal", title: t("User Workshop (UX/UI)") },
    { id: 8, type: "normal", title: t("Sprint Planning") },
    { id: 9, type: "normal", title: t("Sprint Retrospective") },
    { id: 11, type: "low", title: t("Internal Training") },
    { id: 12, type: "low", title: t("Project Meeting") },
    { id: 13, type: "low", title: t("Project Update (Progress)") },
  ];

  const statusOptions = [
    { id: 1, title: t("scheduled") },
    { id: 2, title: t("in-progress") },
    { id: 3, title: t("completed") },
    { id: 4, title: t("cancelled") },
  ];

  const initialLocation =
    meetingRooms.find((room) => room.id === selectedRoom)?.location || "";
  const NumParticipant =
    meetingRooms.find((room) => room.id === selectedRoom)?.capacity || 0;

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      typeMeeting: "team meet",
      location: initialLocation,
      organizer: "",
      idMeetingRoom: selectedRoom,
      participants: [],
      status: t("scheduled"),
      waitingPosition: 0,
      UserId: 0,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Event Title is required"),
      startTime: Yup.string().required("Start Time is required"),
      endTime: Yup.string().required("End Time is required"),
      typeMeeting: Yup.string().required("Category is required"),
    }),
    onSubmit: (values) => {
      const formattedStartTime = moment(values.startTime).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const formattedEndTime = moment(values.endTime).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const eventStart = moment(values.startTime);
      const today = moment().startOf("day");

      if (eventStart.isBefore(today)) {
        toast.error("Vous ne pouvez pas programmer un événement dans le passé");
        return;
      }
      const participantsToSend = Array.isArray(values.participants)
        ? values.participants
        : [];
      if (selectedEvent) {
        const updatedEvent: Event = {
          id: selectedEvent.id,
          title: values.title,
          description: values.description,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          typeMeeting: values.typeMeeting,
          location: values.location,
          organizer: values.organizer,
          idMeetingRoom: selectedRoom,
          participants: participantsToSend,
          status: values.status,
          waitingPosition: values.waitingPosition,
          UserId: auth?.user?.id,
        };
        console.log(updatedEvent);
        dispatch(
          actions.updateEvent({
            event: updatedEvent,
            token: auth?.accessToken,
          })
        );
      } else {
        const adddEvent: Event = {
          title: values.title,
          description: values.description,
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          typeMeeting: values.typeMeeting,
          location: values.location,
          organizer: values.organizer,
          idMeetingRoom: selectedRoom,
          participants: participantsToSend,
          status: values.status,
          waitingPosition: values.waitingPosition,
          UserId: auth?.user?.id,
        };
        dispatch(
          actions.onAddNewEvent({
            event: adddEvent,
            token: auth?.accessToken,
          })
        );
      }
      validation.resetForm();
      setSelectedDay(null);
      toggle();
    },
  });

  // const parseParticipants = (participants: any): Participant[] => {
  //   // Si c'est déjà un tableau, le retourner directement
  //   if (Array.isArray(participants)) {
  //     return participants.map((p) => ({
  //       id: p.id || 0,
  //       username: p.username || "",
  //       email: p.email || "",
  //     }));
  //   }

  //   // Si c'est une chaîne JSON, la parser
  //   if (typeof participants === "string") {
  //     try {
  //       const parsed = JSON.parse(participants);
  //       // Si le parsing réussit et que c'est un tableau
  //       if (Array.isArray(parsed)) {
  //         return parsed.map((p) => ({
  //           id: p.id || 0,
  //           username: p.username || "",
  //           email: p.email || "",
  //         }));
  //       }
  //       // Si c'est un seul objet
  //       if (parsed && typeof parsed === "object") {
  //         return [
  //           {
  //             id: parsed.id || 0,
  //             username: parsed.username || "",
  //             email: parsed.email || "",
  //           },
  //         ];
  //       }
  //     } catch (error) {
  //       console.error("Error parsing participants:", error);
  //     }
  //   }

  //   // Si c'est un seul objet (pas dans un tableau)
  //   if (participants && typeof participants === "object") {
  //     return [
  //       {
  //         id: participants.id || 0,
  //         username: participants.username || "",
  //         email: participants.email || "",
  //       },
  //     ];
  //   }

  //   // Par défaut, retourner un tableau vide
  //   return [];
  // };
  const parseParticipants = (participants: any): Participant[] => {
    if (Array.isArray(participants)) {
      return participants.map((p) => ({
        id: p.id || 0,
        username: p.username || "",
        email: p.email || "",
      }));
    }

    if (typeof participants === "string") {
      try {
        const parsed = JSON.parse(participants);
        if (Array.isArray(parsed)) {
          return parsed.map((p) => ({
            id: p.id || 0,
            username: p.username || "",
            email: p.email || "",
          }));
        }
        if (parsed && typeof parsed === "object") {
          return [
            {
              id: parsed.id || 0,
              username: parsed.username || "",
              email: parsed.email || "",
            },
          ];
        }
      } catch (error) {
        console.error("Error parsing participants:", error);
      }
    }

    if (participants && typeof participants === "object") {
      return [
        {
          id: participants.id || 0,
          username: participants.username || "",
          email: participants.email || "",
        },
      ];
    }

    return [];
  };
  const eventFields: FieldConfig[] = useMemo(() => {
    const isPastEvent = selectedEvent?.isPastEvent || false;
    const initialStartTime = selectedEvent?.startTime
      ? moment(selectedEvent.startTime).format("YYYY-MM-DD HH:mm")
      : selectedDay
      ? moment(selectedDay).startOf("day").format("YYYY-MM-DD HH:mm")
      : "";
    const initialEndTime = selectedEvent?.endTime
      ? moment(selectedEvent.endTime).format("YYYY-MM-DD HH:mm")
      : selectedDay
      ? moment(selectedDay).endOf("day").format("YYYY-MM-DD HH:mm")
      : "";
    const participantObjects = parseParticipants(
      validation.values.participants
    );
    const participantsValue = participantObjects.length
      ? JSON.stringify(participantObjects)
      : "";

    return [
      {
        label: t("Meet Title"),
        name: "title",
        type: "text",
        value: validation.values.title || "",
        required: true,
        disabled: isPastEvent,
        rules: {
          required: t("Meet Title is required"),
        },
      },
      {
        label: t("Description"),
        name: "description",
        inputType: "input",
        type: "text",
        required: true,
        value: validation.values.description || "",
        disabled: isPastEvent,
        multiline: true,
        rows: 4,
      },
      {
        label: t("Category"),
        name: "typeMeeting",
        inputType: "select",
        value: validation.values.typeMeeting || "",
        required: true,
        disabled: isPastEvent,
        selectOptions: categories.map((category) => ({
          value: category.title,
          label: category.title,
        })),
        rules: {
          required: t("Category is required"),
        },
      },
      {
        label: t("Status"),
        name: "status",
        inputType: "select",
        required: true,

        value: validation.values.status || t("scheduled"),
        disabled: isPastEvent,
        selectOptions: statusOptions.map((status) => ({
          value: status.title,
          label: status.title,
          disabled:
            // Disable "scheduled" if status is "in-progress" or "completed"
            (status.title === t("scheduled") &&
              (validation.values.status === t("in-progress") ||
                validation.values.status === t("completed"))) ||
            // Disable "in-progress" if status is "completed"
            (status.title === t("in-progress") &&
              validation.values.status === t("completed")),
        })),
        rules: {
          validate: (value) => {
            if (
              (value === t("scheduled") || value === t("cancelled")) &&
              (validation.values.status === t("in-progress") || 
               validation.values.status === t("completed"))
            ) {
              return t("Cannot revert to scheduled or cancelled");
            }
            if (
              value === t("in-progress") && 
              validation.values.status === t("completed")
            ) {
              return t("Cannot revert to in-progress");
            }
            return true;
          },
        },
      },

      {
        label: t("Start Time"),
        name: "startTime",
        inputType: "datetime-picker",
        value: initialStartTime
          ? moment(initialStartTime, "YYYY-MM-DD HH:mm")
          : null,
        required: true,
        disabled: isPastEvent,
        inputProps: {
          minDateTime: moment(), // Désactiver les dates/heures passées
          format: "DD/MM/YYYY HH:mm",
        },
        rules: {
          required: t("Start Time is required"),
        },
      },
      {
        label: t("End Time"),
        name: "endTime",
        inputType: "datetime-picker",
        value: initialEndTime
          ? moment(initialEndTime, "YYYY-MM-DD HH:mm")
          : null,
        required: true,
        disabled: !validation.values.startTime || isPastEvent,
        inputProps: {
          minDateTime: validation.values.startTime
            ? moment(validation.values.startTime, "YYYY-MM-DD HH:mm")
            : moment(), // Désactiver les dates/heures avant startTime
          format: "DD/MM/YYYY HH:mm",
        },
        rules: {
          required: t("End Time is required"),
        },
      },
      {
        label: t("Participants"),
        name: "participants",
        inputType: "autocomplete",
        value: Array.isArray(validation.values.participants)
          ? validation.values.participants
          : [],
        disabled: isPastEvent,
        options: users,

        required: true,
        getOptionLabel: (user: User) => user.username,
        getOptionDisabled: (user: User) => {
          // Check if user is already in the participants array
          return validation.values.participants.some(
            (participant: Participant) => (participant.id = user.id)
          );
        },
        rules: {
          required: t("At least one participant is required"),
          validate: {
            validNumber: (value: Participant[]) => {
              const participantCount = Array.isArray(value) ? value.length : 0;
              if (participantCount === 0) {
                return t("At least one participant is required");
              }
              if (participantCount > NumParticipant) {
                return t(
                  `Number of participants cannot exceed room capacity (${NumParticipant})`
                );
              }
              return true;
            },
          },
        },
      },
    ];
  }, [
    selectedEvent,
    selectedDay,
    validation.values,
    categories,
    statusOptions,
    users,
    t,
  ]);
  console.log("Current participants:", validation.values.participants);
  console.log("All users:", users);
  useEffect(() => {
    const selectedRoomData = meetingRooms.find(
      (room) => room.id === validation.values.idMeetingRoom
    );
    if (selectedRoomData) {
      validation.setFieldValue("location", selectedRoomData.location);
    }
  }, [validation.values.idMeetingRoom, meetingRooms]);

  const formattedEvents = useMemo(() => {
    return events.map((event: Event) => {
      const isEditable = event.UserId === auth?.user?.id;
      return {
        id: String(event.id),
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        editable: isEditable,
        extendedProps: {
          typeMeeting: event.typeMeeting,
          description: event.description,
          location: event.location,
          organizer: event.organizer,
          idMeetingRoom: event.idMeetingRoom,
          participants: event.participants,
          status: event.status,
          waitingPosition: event.waitingPosition,
          UserId: event.UserId,
        },
      };
    });
  }, [events, auth?.user?.id]);

  useEffect(() => {
    dispatch(actions.fetchMeetingRoom());
    dispatch(
      actionsUser.fetchAllUsersRequest({
        authToken: auth.accessToken,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (meetingRooms.length > 0 && selectedRoom === null) {
      const defaultRoomId = meetingRooms[0].id;
      setSelectedRoom(defaultRoomId);
      dispatch(actions.onGetEvents({ meetingRoom: defaultRoomId }));
    }
  }, [dispatch, meetingRooms, selectedRoom]);

  const handleRoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const roomId = Number(event.target.value);
    setSelectedRoom(roomId);
    dispatch(actions.onGetEvents({ meetingRoom: roomId }));
  };

  useEffect(() => {
    const draggableEl = document.getElementById("draggable-elements");
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: ".draggable-item",
      });
    }
  }, []);

  useEffect(() => {
    if (moveEventError) {
      toast.error(moveEventError);
      dispatch(actions.clearMoveEventStatus());
    }
    if (moveEventSuccess) {
      toast.success(moveEventSuccess);
      dispatch(actions.clearMoveEventStatus());
    }
    if (EventUpdateError) {
      toast.error(EventUpdateError);
      dispatch(actions.resetEventUpdated());
    }
    if (EventUpdateSuccess) {
      toast.success(EventUpdateSuccess);
      dispatch(actions.resetEventUpdated());
    }
  }, [
    moveEventError,
    moveEventSuccess,
    EventUpdateError,
    EventUpdateSuccess,
    dispatch,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = moment();
      events.forEach((event) => {
        const startTime = moment(event.startTime, "YYYY-MM-DDTHH:mm");
        const endTime = moment(event.endTime, "YYYY-MM-DDTHH:mm");

        if (
          event.status === "scheduled" &&
          now.isSameOrAfter(event.startTime) &&
          event.waitingPosition === 1
        ) {
          dispatch(
            actions.updateEvent({
              event: { ...event, status: "in-progress" },
              token: auth?.accessToken,
            })
          );
        }

        if (event.status === "in-progress" && now.isSameOrAfter(endTime)) {
          dispatch(
            actions.updateEvent({
              event: { ...event, status: "completed" },
              token: auth?.accessToken,
            })
          );
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [events, dispatch, auth?.accessToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = moment();
      events.forEach((event) => {
        if (
          event.status === "scheduled" &&
          event.waitingPosition &&
          event.waitingPosition > 1 &&
          moment(event.startTime).add(1, "hour").isBefore(now)
        ) {
          dispatch(
            actions.deleteEvent({
              eventId: event.id,
              token: auth?.accessToken,
            })
          );
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [events, dispatch, auth?.accessToken]);

  useEffect(() => {
    return () => {
      if (revertRef.current) {
        revertRef.current();
      }
    };
  }, []);

  const handleConfirmWaitingPosition = useCallback(
    (accept: boolean) => {
      if (waitingEvent && auth?.accessToken) {
        dispatch(
          actions.confirmWaitingPosition({
            event: waitingEvent,
            token: auth.accessToken,
            accept,
          })
        );
      }
    },
    [dispatch, waitingEvent, auth?.accessToken]
  );

  useEffect(() => {
    if (EventUpdateSuccess) {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.refetchEvents();
      }
      dispatch(actions.resetEventUpdated());
    }
  }, [EventUpdateSuccess, dispatch]);

  const handleTimeSelectionSubmit = useCallback(
    (startTime: string, endTime: string) => {
      if (timeSelectionEvent && auth?.accessToken) {
        const updatedEvent = {
          ...timeSelectionEvent,
          startTime: moment(startTime).format("YYYY-MM-DD HH:mm:ss"),
          endTime: moment(endTime).format("YYYY-MM-DD HH:mm:ss"),
        };
        dispatch(
          actions.updateEvent({
            event: updatedEvent,
            token: auth.accessToken,
          })
        );
        dispatch(actions.closeTimeSelectionModal());
      }
    },
    [dispatch, timeSelectionEvent, auth?.accessToken]
  );

  const revertRef = useRef<(() => void) | null>(null);

  const handleEventDrop = useCallback(
    (eventInfo: any) => {
      const formattedStartTime = moment(eventInfo.event.startStr).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const formattedEndTime = moment(eventInfo.event.endStr).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const eventStart = moment(eventInfo.event.startStr);
      const today = moment().startOf("day");

      if (eventStart.isBefore(today)) {
        toast.error(
          "Vous ne pouvez pas déplacer un événement à une date passée"
        );
        eventInfo.revert();
        return;
      }
      const updatedEvent: Event = {
        id: eventInfo.event.id,
        title: eventInfo.event.title,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        typeMeeting: eventInfo.event.extendedProps.typeMeeting,
        description: eventInfo.event.extendedProps.description || "",
        location: eventInfo.event.extendedProps.location || "",
        organizer: eventInfo.event.extendedProps.organizer || "",
        idMeetingRoom: selectedRoom,
        participants: eventInfo.event.extendedProps.participants,
        status: eventInfo.event.extendedProps.status,
        waitingPosition: eventInfo.event.extendedProps.waitingPosition,
        UserId: auth?.user?.id,
      };

      revertRef.current = eventInfo.revert;

      dispatch(
        actions.moveEventRequest({
          event: updatedEvent,
          token: auth?.accessToken,
        })
      );
    },
    [dispatch, auth?.accessToken, selectedRoom]
  );

  const toggle = () => {
    setModal(!modal);
    if (!modal) {
      setSelectedEvent(null);
      setOpen(false);
      validation.resetForm();
    } else {
      setOpen(!!selectedDay);
      setOpen(true);
    }
  };

  const handleDateClick = (arg: any) => {
    setSelectedDay(arg.date);
    toggle();
  };

  const handleEventClick = useCallback(
    (eventInfo: any) => {
      const isEditable =
        eventInfo.event.extendedProps.UserId === auth?.user?.id ||
        auth?.user?.role === "Admin";
      if (!isEditable) {
        toast.info(
          "Vous ne pouvez pas modifier cet événement car il ne vous appartient pas"
        );
        return;
      }
      const rawParticipants = eventInfo.event.extendedProps.participants;

      const isPastEvent = moment(eventInfo.event.end).isBefore(
        moment().startOf("day")
      );
      console.log(eventInfo.event.startStr);
      const startTime = moment(eventInfo.event.start).format(
        "YYYY-MM-DDTHH:mm"
      );
      const endTime = moment(eventInfo.event.end).format("YYYY-MM-DDTHH:mm");
      const event: Event = {
        id: eventInfo.event.id || "",
        title: eventInfo.event.title || "",
        description: eventInfo.event.extendedProps.description || "",
        startTime: eventInfo.event.startStr || "",
        endTime: eventInfo.event.endStr || "",
        typeMeeting: eventInfo.event.extendedProps.typeMeeting || "",
        location: eventInfo.event.extendedProps.location || "",
        organizer: eventInfo.event.extendedProps.organizer || "",
        idMeetingRoom: eventInfo.event.extendedProps.idMeetingRoom || 0,
        participants: parseParticipants(
          eventInfo.event.extendedProps.participants
        ),
        status: eventInfo.event.extendedProps.status || "scheduled",
        waitingPosition: eventInfo.event.extendedProps.waitingPosition || 0,
        UserId: eventInfo.event.extendedProps.UserId,
        isPastEvent,
      };

      setSelectedEvent(event);
      validation.setValues({
        title: event.title,
        description: event.description,
        startTime: startTime,
        endTime: endTime,
        typeMeeting: event.typeMeeting,
        location: event.location,
        organizer: event.organizer,
        idMeetingRoom: event.idMeetingRoom,
        participants: parseParticipants(
          eventInfo.event.extendedProps.participants
        ),
        status: event.status,
        waitingPosition: event.waitingPosition,
        UserId: auth?.user?.id,
      });
      setModal(true);
    },
    [validation, auth?.user?.id]
  );

  const onDelete = () => {
    if (selectedEvent) {
      dispatch(
        actions.deleteEvent({
          eventId: selectedEvent.id!,
          token: auth.accessToken,
        })
      );
      toggle();
    }
  };

  const handleMoreLinkClick = (arg: MoreLinkArg) => {
    setDayEvents(arg.allSegs.map((seg) => seg.event));
    setModalDate(arg.date.toDateString());
    setModalOpen(true);
  };

  const handleModalSubmit = (data: Record<string, any>) => {
    // Ne pas parser les participants s'ils sont déjà un objet/tableau
    const participants = Array.isArray(data.participants)
      ? data.participants
      : typeof data.participants === "string"
      ? JSON.parse(data.participants)
      : [];

    validation.setValues({
      ...validation.values,
      title: data.title,
      description: data.description,
      typeMeeting: data.typeMeeting,
      status: data.status,
      participants,
      startTime: moment(data.startTime).format("YYYY-MM-DD HH:mm:ss"),
      endTime: moment(data.endTime).format("YYYY-MM-DD HH:mm:ss"),
    });
    validation.handleSubmit();
  };
  const handleModalChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | SelectChangeEvent<string>
      | { target: { name: string; value: any } }
  ) => {
    const name = e.target.name;
    const value = e.target.value;

    // Mettre à jour la valeur du champ dans Formik
    validation.setFieldValue(name, value);
  };

  const renderEventContent = (eventInfo: any) => {
    const eventStatus = eventInfo.event.extendedProps?.status || t("scheduled");
    const isPastEvent = moment(eventInfo.event.end).isBefore(
      moment().startOf("day")
    );
    const isEditable =
      eventInfo.event.extendedProps.UserId === auth?.user?.id ||
      auth?.user?.role === "Admin";

    if (eventStatus === "cancelled") return null;

    const statusColors = {
      scheduled: "#ff5722",
      "in-progress": "#10b981",
      completed: "#4caf50",
      cancelled: "#f44336",
    };

    const statusColor = statusColors[eventStatus] || "#9e9e9e";
    const backgroundColor = isEditable
      ? eventStatus === "scheduled"
        ? "#fce4dc"
        : eventStatus === "in-progress"
        ? "#dcf7ee"
        : eventStatus === "completed"
        ? "#e3fae3"
        : eventStatus === "cancelled"
        ? "#fae5e3"
        : "#9e9e9e"
      : "#e5e7eb";

    return (
      <Box
        sx={{
          opacity: isPastEvent || !isEditable ? 0.6 : 1,
          filter: isPastEvent || !isEditable ? "grayscale(30%)" : "none",
          padding: "6px 8px",
          borderRadius: "6px",
          backgroundColor,
          borderLeft: `4px solid ${statusColor}`,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)",
          "&:hover": {
            boxShadow: isEditable ? "0 4px 12px rgba(0, 0, 0, 0.1)" : "none",
            transform: isEditable ? "translateY(-1px)" : "none",
            backgroundColor: isEditable ? "#f9fafb" : backgroundColor,
          },
          transition: "all 0.2s ease-in-out",
          position: "relative",
          overflow: "hidden",
          minWidth: "140px",
          cursor: isEditable ? "pointer" : "default",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color:
              eventStatus === "scheduled" && isEditable ? "#e65100" : "#1e293b",
            lineHeight: 1.2,
            marginBottom: "6px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {eventInfo.event.title}
          {!isEditable && (
            <LockIcon
              sx={{
                fontSize: 14,
                color: "#64748b",
                ml: 1,
                verticalAlign: "middle",
              }}
            />
          )}
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {["start", "end"].map((timeType) => (
            <Box
              key={timeType}
              sx={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <ScheduleIcon
                sx={{
                  fontSize: 14,
                  color: "#64748b",
                  animation: isEditable ? "bounce 1.5s infinite" : "none",
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontSize: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                {timeType === "start" ? "Début" : "Fin"}:
                {moment(eventInfo.event[timeType]).format("HH:mm")}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            position: "absolute",
            top: "4px",
            right: "4px",
            padding: "2px 6px",
            borderRadius: "4px",
            backgroundColor: statusColor,
            color: "#fff",
            fontSize: "0.65rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
          }}
        >
          {t(eventStatus)}
        </Box>
      </Box>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <StyledContainer>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <StyledCard>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
                >
                  {t("Event Controls")}
                </Typography>
                <TextField
                  select
                  fullWidth
                  label={t("Filter by Room")}
                  variant="outlined"
                  value={selectedRoom ?? ""}
                  onChange={handleRoomChange}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                    },
                  }}
                >
                  {meetingRooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name}
                    </MenuItem>
                  ))}
                </TextField>
                <StyledButton
                  variant="contained"
                  fullWidth
                  onClick={toggle}
                  sx={{ mb: 3 }}
                >
                  {t("Create New Meet")}
                </StyledButton>
                <Box id="draggable-elements">
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#475569", mb: 1 }}
                  >
                    {t("Drag & Drop Meet")}
                  </Typography>
                  {categories.map((category) => (
                    <CategoryBox
                      key={`cat-${category.id}`}
                      className="draggable-item"
                      draggable={true}
                      onDragStart={(event) => {
                        event.dataTransfer.setData(
                          "application/json",
                          JSON.stringify(category)
                        );
                      }}
                      sx={{
                        backgroundColor:
                          category.type === "important"
                            ? "#f97316"
                            : category.type === "normal"
                            ? "#3b82f6"
                            : "#10b981",
                        color: "#fff",
                      }}
                    >
                      <Typography variant="body2">{category.title}</Typography>
                    </CategoryBox>
                  ))}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={9}>
            <StyledCard>
              <CardContent>
                <StyledCalendar>
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={formattedEvents}
                    editable={true}
                    selectable={true}
                    height="auto"
                    dayMaxEventRows={2}
                    moreLinkClick={handleMoreLinkClick}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    droppable={true}
                    drop={(eventInfo: DropArg) => {
                      const draggedElement = eventInfo.draggedEl as HTMLElement;
                      const eventData =
                        draggedElement.querySelector("p")?.textContent ||
                        draggedElement.title;
                      if (!eventData) return;

                      const startTime = moment(eventInfo.dateStr).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );
                      const endTime = moment(eventInfo.dateStr).format(
                        "YYYY-MM-DD HH:mm:ss"
                      );

                      const newEvent = {
                        title: eventData,
                        startTime,
                        endTime,
                        typeMeeting: eventData,
                        description: "",
                        location: initialLocation,
                        organizer: auth?.user?.name || "",
                        idMeetingRoom: selectedRoom,
                        participants: [],
                        status: t("scheduled"),
                        waitingPosition: 0,
                        UserId: auth?.user?.id,
                      };
                      validation.setValues(newEvent);
                      setModal(true);
                      setSelectedEvent(null);
                      setOpen(true);
                    }}
                    headerToolbar={{
                      left: "prev,next,today",
                      center: "title",
                      right: "dayGridMonth,timeGridDay",
                    }}
                    buttonText={{
                      prev: t("prev") || "Previous",
                      next: t("next") || "Next",
                      today: t("today") || "Today",
                      month: t("dayGridMonth") || "Month",
                      day: t("timeGridDay") || "Day",
                    }}
                    eventContent={renderEventContent}
                    locale={i18n.language}
                  />

                  <Modal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    aria-labelledby="event-modal-title"
                    aria-describedby="event-modal-description"
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 450,
                        maxHeight: 500,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 3,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography
                        id="event-modal-title"
                        variant="h6"
                        gutterBottom
                      >
                        Événements du {modalDate}
                      </Typography>
                      <Box sx={{ overflowY: "auto", flex: 1 }}>
                        <List>
                          {dayEvents.map((event, idx) => (
                            <ListItem key={idx} divider>
                              <ListItemText
                                primary={event.title}
                                secondary={`${event.start?.toLocaleTimeString()} - ${event.end?.toLocaleTimeString()}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Box>
                  </Modal>
                </StyledCalendar>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <EntityModal
          open={modal}
          onClose={toggle}
          title={
            selectedEvent?.isPastEvent
              ? t("Meet Details")
              : selectedEvent
              ? t("Edit Meet")
              : t("Add Meet")
          }
          entity={validation.values}
          fields={eventFields}
          onChange={handleModalChange}
          onSubmit={handleModalSubmit}
          entityType={t("Event")}
        />

        <WaitingConfirmationModal
          open={showWaitingConfirmation}
          onClose={() => handleConfirmWaitingPosition(false)}
          onConfirm={handleConfirmWaitingPosition}
          waitingPosition={waitingPosition}
          waitingMessage={waitingMessage}
        />
        <TimeSelectionModal
          open={showTimeSelection}
          onClose={() => dispatch(actions.closeTimeSelectionModal())}
          onSubmit={handleTimeSelectionSubmit}
          initialStartTime={timeSelectionEvent?.startTime || null}
          initialEndTime={timeSelectionEvent?.endTime || null}
        />
      </StyledContainer>
    </LocalizationProvider>
  );
};

export default Calendar;
