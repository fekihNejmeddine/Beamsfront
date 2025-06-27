import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  debounce,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import moment, { Moment } from "moment";
import { SelectChangeEvent } from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import { Event } from "../../types/interface/Event";
import { User } from "../../types/interface/User";
import { useDispatch, useSelector } from "react-redux";
import { usersSelectors } from "../../store/user/slice";
import { AppDispatch, RootState } from "../../store/store";
import { actions as actionsUser } from "../../store/user/slice";
import useAuth from "../../hooks/useAuth";
import { boolean } from "yup";
import { t } from "i18next";

interface Participant {
  id: number;
  username: string;
  email: string;
}
interface EventModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  event: Partial<Event>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: SelectChangeEvent<string | Participant[]>) => void;
  onSubmit: () => void;
  onDelete: () => void;
  typeMeeting: TypeMeeting[];
  selectedDay: string | Moment | null;
  onDateChange: (field: string, value: Moment | null) => void;
  isNewEvent: boolean;
  isPastEvent?: boolean;
  isEditable: boolean;
}

const CustomInput: React.FC<{
  label: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ label, name, value, onChange, disabled }) => (
  <TextField
    fullWidth
    margin="normal"
    label={label}
    name={name}
    value={value || ""}
    onChange={onChange}
    disabled={disabled}
    sx={{
      "& .MuiInputBase-root": {
        borderRadius: "8px",
        backgroundColor: disabled ? "#f5f5f5" : "inherit",
      },
    }}
  />
);

// Event Modal Component
const EventModal: React.FC<EventModalProps> = ({
  open,
  onClose,
  title,
  event,
  onChange,
  onSelectChange,
  onSubmit,
  typeMeeting,
  selectedDay,
  onDateChange,
  onDelete,
  isNewEvent,
  isPastEvent = false,
  isEditable = true,
}) => {
  const initialStartTime = event?.startTime
    ? moment(event.startTime)
    : selectedDay
    ? moment(selectedDay).startOf("day")
    : null;
  const initialEndTime = event?.endTime
    ? moment(event.endTime)
    : selectedDay
    ? moment(selectedDay).endOf("day")
    : null;
  const statusOptions = [
    { id: 1, title: t("scheduled") },
    { id: 2, title: t("in-progress") },
    { id: 3, title: t("completed") },
    { id: 4, title: t("cancelled") },
  ] as const;
  const parseParticipants = (participants: any): Participant[] => {
    if (!participants) return [];
    try {
      if (typeof participants === "string") {
        const parsed = JSON.parse(participants);
        return Array.isArray(parsed)
          ? parsed.map((p: any) => ({
              id: p.id,
              username: p.username || "",
              email: p.email || "",
            }))
          : [
              {
                id: parsed.id,
                username: parsed.username || "",
                email: parsed.email || "",
              },
            ];
      }
      if (Array.isArray(participants)) {
        return participants.map((p: any) => ({
          id: p.id,
          username: p.username || "",
          email: p.email || "",
        }));
      }
      return [];
    } catch (error) {
      console.error("Error parsing participants:", error);
      return [];
    }
  };

  const { auth } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const users = useSelector(usersSelectors.selectAll);
  const { loading, error, currentPage, hasMore } = useSelector(
    (state: RootState) => state.users
  );
  const [localPage, setLocalPage] = useState(1);

  const fetchMoreUsers = useCallback(() => {
    if (!loading && hasMore) {
      dispatch(
        actionsUser.fetchUsersRequest({
          page: localPage,
          pageSize: 5,
          role: "",
          authToken: auth.accessToken,
        })
      );
      setLocalPage((prev) => prev + 1);
    }
  }, [dispatch, loading, hasMore, localPage]);
  const listboxRef = useRef<HTMLElement | null>(null);
  const isFetching = useRef(false); // Prevent multiple simultaneous fetches

  // Debounce fetchMoreUsers to prevent excessive calls
  const debouncedFetchMoreUsers = useCallback(
    debounce(() => {
      if (!isFetching.current) {
        isFetching.current = true;
        fetchMoreUsers();
        // Reset isFetching after fetch completes (adjust based on your fetchMoreUsers implementation)
        setTimeout(() => {
          isFetching.current = false;
        }, 500); // Adjust delay as needed
      }
    }, 300),
    [fetchMoreUsers]
  );
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLElement>) => {
      const listbox = event.currentTarget;
      const { scrollTop, clientHeight, scrollHeight } = listbox;

      // Only fetch on bottom scroll (remove top scroll if not needed)
      if (scrollTop + clientHeight >= scrollHeight - 5 && !isFetching.current) {
        const scrollPosition = scrollTop;
        debouncedFetchMoreUsers();
        // Restore scroll position after fetch
        requestAnimationFrame(() => {
          if (listboxRef.current) {
            listboxRef.current.scrollTop = scrollPosition;
          }
        });
      }
    },
    [debouncedFetchMoreUsers]
  );
  useEffect(() => {
    if (open && users.length === 0 && !loading && hasMore) {
      debouncedFetchMoreUsers();
    }
  }, [open, users.length, loading, hasMore, debouncedFetchMoreUsers]);
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90vw", sm: 400, md: 450 },
          maxWidth: "95vw",
          maxHeight: "90vh",
          bgcolor: "background.paper",
          p: { xs: 2, sm: 3, md: 4 },
          boxShadow: 24,
          borderRadius: "12px",
          border: "1px solid",
          borderColor: "divider",
          overflow: "auto",
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Roboto Mono", monospace',
            color: "success.dark",
            backgroundColor: "rgba(0,128,0,0.08)",
            px: 2,
            py: 1,
            borderRadius: "4px",
            borderLeft: "4px solid",
            borderColor: "success.main",
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            "&:before": {
              content: '"❯"',
              color: "success.light",
            },
          }}
        >
          {title}
        </Typography>
        {event && (
          <>
            <CustomInput
              label={t("Meet Title")}
              name="title"
              value={event.title}
              onChange={onChange}
              disabled={isPastEvent}
            />
            <CustomInput
              label={t("Description")}
              name="description"
              value={event.description}
              onChange={onChange}
              disabled={isPastEvent}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="demo-simple-select-label">
                {t("Category")}
              </InputLabel>
              <Select
                label={t("Category")}
                name="typeMeeting"
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={event.typeMeeting}
                onChange={onSelectChange}
                disabled={isPastEvent}
              >
                {typeMeeting.map((meeting) => (
                  <MenuItem key={meeting.id} value={meeting.title}>
                    {meeting.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-select-label">{t("Status")}</InputLabel>
              <Select
                label={t("Status")}
                name="status"
                labelId="status-select-label"
                id="status-select"
                value={event.status}
                onChange={onSelectChange}
                disabled={isPastEvent}
              >
                {statusOptions.map((status) => (
                  <MenuItem
                    key={status.id}
                    value={status.title}
                    disabled={
                      ((status.title === "scheduled" ||
                        status.title === "cancelled") &&
                        (event.status === "in-progress" ||
                          event.status === "completed")) ||
                      (status.title === "in-progress" &&
                        event.status === "completed")
                    }
                  >
                    {status.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              multiple
              options={users}
              getOptionKey={(option: User) => `${option.id}`}
              getOptionLabel={(option: User) => `${option.username}`}
              getOptionDisabled={(option: User) =>
                parseParticipants(event.participants).some(
                  (selected) => selected.email === option.email
                )
              }
              value={parseParticipants(event.participants).map((p) => ({
                ...p,
                id: users.find((u) => u.email === p.email)?.id,
                lastName: "",
                role: "",
              }))}
              onChange={(event, value: User[]) => {
                const strippedParticipants: Participant[] = value.map(
                  (user) => ({
                    id: Number(user.id),
                    username: user.username,
                    email: user.email,
                  })
                );
                onSelectChange({
                  target: {
                    name: "participants",
                    value: strippedParticipants,
                  },
                } as SelectChangeEvent<Participant[]>);
              }}
              renderInput={(params) => (
                <TextField {...params} label={t("Participants")} />
              )}
              disabled={isPastEvent}
              onOpen={() => {
                if (users.length === 0 && !loading && hasMore) {
                  debouncedFetchMoreUsers();
                }
              }}
              ListboxProps={{
                onScroll: handleScroll,
                style: {
                  maxHeight: "100px", // Increased for better usability
                  overflow: "auto",
                },
                ref: listboxRef, // Attach ref to listbox
              }}
            />

            {!isNewEvent ? (
              <>
                <Grid item xs={12} sx={{ mb: 2, mt: 2 }}>
                  <DateTimePicker
                    label={t("Start Time")}
                    value={initialStartTime}
                    onChange={(value) => onDateChange("startTime", value)}
                    format="YYYY/MM/DD hh:mm a"
                    disabled={isPastEvent}
                    minutesStep={1}
                    minDateTime={moment()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            borderRadius: "12px",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "white",
                            "& .MuiPickersDay-root": {
                              borderRadius: "8px",
                              "&:hover": {
                                backgroundColor: "primary.light",
                                color: "white",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "primary.dark",
                                },
                              },
                            },
                            "& .MuiClock-root": {
                              backgroundColor: "background.paper",
                              "& .MuiClock-pin": {
                                backgroundColor: "primary.main",
                              },
                              "& .MuiClockPointer-root": {
                                backgroundColor: "primary.main",
                              },
                              "& .MuiClockPointer-thumb": {
                                borderColor: "primary.main",
                                backgroundColor: "white",
                              },
                            },
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ mb: 2, mt: 2 }}>
                  <DateTimePicker
                    label={t("End Time")}
                    value={initialEndTime}
                    format="YYYY/MM/DD hh:mm a"
                    onChange={(value) => onDateChange("endTime", value)}
                    minDate={initialStartTime || undefined} // Use start time as minDate
                    disabled={isPastEvent || !initialStartTime} // Disable if no start time
                    minutesStep={1}
                    minDateTime={initialStartTime || moment()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            borderRadius: "12px",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "white",
                            "& .MuiPickersDay-root": {
                              borderRadius: "8px",
                              "&:hover": {
                                backgroundColor: "primary.light",
                                color: "white",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "primary.dark",
                                },
                              },
                            },
                            "& .MuiClock-root": {
                              backgroundColor: "background.paper",
                              "& .MuiClock-pin": {
                                backgroundColor: "primary.main",
                              },
                              "& .MuiClockPointer-root": {
                                backgroundColor: "primary.main",
                              },
                              "& .MuiClockPointer-thumb": {
                                borderColor: "primary.main",
                                backgroundColor: "white",
                              },
                            },
                          },
                        },
                      },
                    }}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sx={{ mb: 2, mt: 2 }}>
                  <DateTimePicker
                    label={t("Start Time")}
                    value={initialStartTime}
                    onChange={(value) => onDateChange("startTime", value)}
                    minDate={moment()}
                    disabled={isPastEvent}
                    format="YYYY/MM/DD hh:mm a"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            borderRadius: "12px",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "white",
                            "& .MuiPickersDay-root": {
                              borderRadius: "8px",
                              "&:hover": {
                                backgroundColor: "primary.light",
                                color: "white",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "primary.dark",
                                },
                              },
                            },
                            "& .MuiClock-root": {
                              backgroundColor: "background.paper",
                              "& .MuiClock-pin": {
                                backgroundColor: "primary.main",
                              },
                              "& .MuiClockPointer-root": {
                                backgroundColor: "primary.main",
                              },
                              "& .MuiClockPointer-thumb": {
                                borderColor: "primary.main",
                                backgroundColor: "white",
                              },
                            },
                          },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ mb: 2, mt: 2 }}>
                  <DateTimePicker
                    label={t("End Time")}
                    value={initialEndTime}
                    onChange={(value) => onDateChange("endTime", value)}
                    minDate={initialStartTime || moment()}
                    disabled={isPastEvent}
                    format="YYYY/MM/DD hh:mm a"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": {
                            borderRadius: "12px",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "white",
                            "& .MuiPickersDay-root": {
                              borderRadius: "8px",
                              "&:hover": {
                                backgroundColor: "primary.light",
                                color: "white",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "primary.main",
                                color: "white",
                                "&:hover": {
                                  backgroundColor: "primary.dark",
                                },
                              },
                            },
                            "& .MuiClock-root": {
                              backgroundColor: "background.paper",
                              "& .MuiClock-pin": {
                                backgroundColor: "primary.main",
                              },
                              "& .MuiClockPointer-root": {
                                backgroundColor: "primary.main",
                              },
                              "& .MuiClockPointer-thumb": {
                                borderColor: "primary.main",
                                backgroundColor: "white",
                              },
                            },
                          },
                        },
                      },
                    }}
                  />
                </Grid>
              </>
            )}
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={2}
              mt={4}
              px={3}
              py={2}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                onClick={onClose}
                variant="text"
                startIcon={<CloseIcon fontSize="small" />}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {t("Cancel")}
              </Button>

              {isNewEvent && (
                <Button
                  onClick={onDelete}
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlineIcon fontSize="small" />}
                  sx={{
                    border: "1.5px solid",
                    "&:hover": {
                      backgroundColor: "error.light",
                      border: "1.5px solid",
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {t("DELETE")}
                </Button>
              )}

              {!isPastEvent && (
                <Button
                  onClick={onSubmit}
                  variant="contained"
                  color="primary"
                  startIcon={isNewEvent ? <SaveIcon /> : <AddIcon />}
                  sx={{
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {isNewEvent ? t("Update") : t("Create")}
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export { EventModal };
