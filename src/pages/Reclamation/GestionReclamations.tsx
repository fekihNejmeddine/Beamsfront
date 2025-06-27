import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Grid,
  Container,
  Tabs,
  Tab,
  Typography,
  List,
  ListItem,
  ListItemText,
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
  Box,
  CircularProgress,
  styled,
  Tooltip,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Reply as ReplyIcon,
  Edit as EditIcon,
  DeleteOutline,
  Image,
} from "@mui/icons-material";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { RootState, AppDispatch } from "../../store/store";
import { IReclamation } from "../../store/reclamation/types";
import {
  deleteReclamation,
  fetchAllReclamations,
  updateReclamation,
} from "../../store/reclamation/slice";
import { useTranslation } from "react-i18next";
import { Status } from "../../types/enum/Status.enum";
import CustomInput from "../../components/UI/Input";
import { EntityModal, FieldConfig } from "../../components/UI/Modal"; // Import from Modal.tsx

// Styled Components (unchanged)
const StyledContainer = styled(Container)(({ theme }) => ({
  maxWidth: "none",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[100],
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  color: theme.palette.common.white,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  textAlign: "center",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  background: "rgba(255, 255, 255, 0.95)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
  },
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(1),
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  width: "100%",
  marginBottom: theme.spacing(2),
  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "1rem",
    padding: theme.spacing(1, 3),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 1.5),
      fontSize: "0.9rem",
    },
  },
  "& .Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  transition: "background-color 0.2s ease, transform 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.grey[50],
    transform: "scale(1.01)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
    flexDirection: "column",
    alignItems: "flex-start",
    gap: theme.spacing(1),
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  fontSize: "1rem",
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  transition: "all 0.3s ease",
  "&:hover": {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[4],
  },
  "&:disabled": {
    background: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: "8px",
  padding: theme.spacing(0.5, 1),
  fontSize: "0.875rem",
  "& .MuiChip-label": {
    padding: theme.spacing(0.5, 1),
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.75rem",
    padding: theme.spacing(0.25, 0.5),
  },
}));

const GestionReclamations: React.FC = () => {
  document.title = "Gestion Reclamations";
  const { auth } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { reclamations, loading, error } = useSelector(
    (state: RootState) => state.reclamation
  );
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [customActiveTab, setCustomActiveTab] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagination] = useState({ total: 0, limit: 10 });
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">(
    "error"
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState<boolean>(false);
  const [reclamationToDelete, setReclamationToDelete] = useState<number | null>(
    null
  );
  const [openReplyModal, setOpenReplyModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [selectedReclamation, setSelectedReclamation] =
    useState<IReclamation | null>(null);
  const [replySubject, setReplySubject] = useState<string>("");
  const [replyContent, setReplyContent] = useState<string>("");
  const [replyPhotos, setReplyPhotos] = useState<string[]>([]);
  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [updateStatus, setUpdateStatus] = useState<Status>(Status.Pending);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const tabIds = ["All", Status.Pending, Status.InProgress, Status.Resolved];
  const statusOptions = [
    { value: Status.Pending, label: Status.Pending },
    { value: Status.InProgress, label: Status.InProgress },
    { value: Status.Resolved, label: Status.Resolved },
  ];

  const toggleCustom = (tab: string) => {
    if (customActiveTab !== tab) {
      setCurrentPage(1);
      setCustomActiveTab(tab);
    }
  };
  useEffect(() => {
    dispatch(fetchAllReclamations({ idSyndic: auth?.user?.id }));
  }, [dispatch]);

  const filteredReclamations = reclamations.filter((rec) =>
    customActiveTab === "All" ? true : rec.status === customActiveTab
  );

  const paginatedReclamations = filteredReclamations.slice(
    (currentPage - 1) * pagination.limit,
    currentPage * pagination.limit
  );

  const countAll = reclamations.length;
  const countPending = reclamations.filter(
    (rec) => rec.status === Status.Pending
  ).length;
  const countInProgress = reclamations.filter(
    (rec) => rec.status === Status.InProgress
  ).length;
  const countResolved = reclamations.filter(
    (rec) => rec.status === Status.Resolved
  ).length;

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleDelete = async () => {
    if (!reclamationToDelete) return;

    try {
      await dispatch(deleteReclamation(reclamationToDelete));
      setSnackbarMessage(t("Reclamation deleted successfully"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setOpenDeleteDialog(false);
      setReclamationToDelete(null);
    } catch (error) {
      console.error(error);
      setSnackbarMessage(t("Failed to delete reclamation"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setReclamationToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setReclamationToDelete(null);
  };

  const handleOpenReplyModal = (reclamation: IReclamation) => {
    setSelectedReclamation(reclamation);
    setReplySubject(`Re: Reclamation #${reclamation.id}`);
    setReplyContent("");
    setReplyPhotos([]);
    setOpenReplyModal(true);
  };

  const handleCloseReplyModal = () => {
    setOpenReplyModal(false);
    setSelectedReclamation(null);
    setReplySubject("");
    setReplyContent("");
    setReplyPhotos([]);
  };

  const handleOpenUpdateModal = (reclamation: IReclamation) => {
    setSelectedReclamation(reclamation);
    setUpdateStatus(reclamation.status || Status.Pending);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setSelectedReclamation(null);
    setUpdateStatus(Status.Pending);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setReplyPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setReplyPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReplyChange = (e: { target: { name: string; value: any } }) => {
    if (e.target.name === "subject") {
      setReplySubject(e.target.value);
    } else if (e.target.name === "content") {
      setReplyContent(e.target.value);
    }
  };

  const handleSendReply = async (data: Record<string, any>) => {
    if (!selectedReclamation) return;

    setReplyLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_HOST}/compose-mail`,
        {
          destination: selectedReclamation.user_id,
          subject: data.subject,
          content: data.content,
          photos: replyPhotos,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        }
      );
      setSnackbarMessage(t("Response sent successfully"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseReplyModal();
    } catch (error) {
      console.error(error);
      setSnackbarMessage(t("Failed to send response"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleUpdateChange = (e: { target: { name: string; value: any } }) => {
    if (e.target.name === "status") {
      setUpdateStatus(e.target.value as Status);
    }
  };

  const handleUpdateStatus = async (data: Record<string, any>) => {
    if (!selectedReclamation) return;

    setUpdateLoading(true);
    try {
      await dispatch(
        updateReclamation({ id: selectedReclamation.id!, status: data.status })
      );
      setSnackbarMessage(t("Reclamation status updated successfully"));
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseUpdateModal();
    } catch (error) {
      console.error(error);
      setSnackbarMessage(t("Failed to update reclamation status"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUpdateLoading(false);
    }
  };

  const isStatusDisabled = (status: Status) => {
    if (!selectedReclamation) return false;

    switch (selectedReclamation.status) {
      case Status.InProgress:
        return status === Status.Pending;
      case Status.Resolved:
        return status === Status.Pending || status === Status.InProgress;
      default:
        return false;
    }
  };

  const normalizePhotos = (photos: any): string[] => {
    if (!photos) return [];
    if (Array.isArray(photos)) return photos;
    if (typeof photos === "string") {
      try {
        const parsed = JSON.parse(photos);
        return Array.isArray(parsed) ? parsed : [photos];
      } catch {
        return [photos];
      }
    }
    return [photos.toString()];
  };

  const replyFields: FieldConfig[] = [
    {
      label: "Subject",
      name: "subject",
      type: "text",
      value: replySubject,
      required: true,
      rules: {
        required: t("Subject is required"),
      },
    },
    {
      label: "Response",
      name: "content",
      type: "text",
      value: replyContent,
      required: true,
      multiline: true,
      rows: 6,
      rules: {
        required: t("Response is required"),
      },
    },
  ];

  const updateFields: FieldConfig[] = [
    {
      label: "Status",
      name: "status",
      inputType: "select",
      value: updateStatus,
      required: true,
      selectOptions: statusOptions.map((option) => ({
        ...option,
        label: t(option.label),
      })),
      disabled: isStatusDisabled(updateStatus),
      rules: {
        required: t("Status is required"),
      },
    },
  ];

  return (
    <StyledContainer maxWidth={false} disableGutters>
      <HeaderBox>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, fontSize: { xs: "1.8rem", sm: "2.5rem" } }}
        >
          {t("Reclamation Dashboard")}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ mt: 1, fontSize: { xs: "1rem", sm: "1.2rem" }, opacity: 0.9 }}
        >
          {t("Manage All Resident Reclamations", { countAll })}
        </Typography>
      </HeaderBox>
      <Grid>
        <StyledTabs
          value={customActiveTab}
          onChange={(e, value) => toggleCustom(value)}
          centered
        >
          {tabIds.map((tab) => (
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
              fontWeight: 500,
              fontSize: "1.1rem",
            }}
          >
            {error}
          </Box>
        ) : paginatedReclamations.length === 0 ? (
          <Typography
            textAlign="center"
            color="text.secondary"
            sx={{ py: 6, fontSize: "1.2rem" }}
          >
            {t("No reclamations found for this status")}
          </Typography>
        ) : (
          <List>
            {paginatedReclamations.map((rec) => (
              <StyledCard key={rec.id}>
                <StyledListItem>
                  <ListItemText
                    primary={
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "primary.main",
                            fontSize: { xs: "1.1rem", sm: "1.3rem" },
                          }}
                        >
                          {t("Reclamation")} #{rec.id}
                        </Typography>
                        <StyledChip
                          label={t(rec.status)}
                          color={
                            rec.status === Status.Resolved
                              ? "success"
                              : rec.status === Status.InProgress
                              ? "warning"
                              : "error"
                          }
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            mt: 1,
                            mb: 1,
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          {rec.description}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                        >
                          {rec.created_at
                            ? `${
                                months[new Date(rec.created_at).getMonth()]
                              }-${new Date(rec.created_at).getDate()}`
                            : t("Date not available")}
                        </Typography>
                        {normalizePhotos(rec.Photo).length > 0 && (
                          <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Pièces jointes:
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                              {normalizePhotos(rec.Photo).map(
                                (photo, index) => (
                                  <Avatar
                                    key={index}
                                    variant="rounded"
                                    src={photo}
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      cursor: "pointer",
                                    }}
                                    onClick={() => window.open(photo, "_blank")}
                                  >
                                    <Image />
                                  </Avatar>
                                )
                              )}
                            </Box>
                          </Box>
                        )}
                      </>
                    }
                  />
                  <Box
                    display="flex"
                    gap={1}
                    sx={{
                      flexDirection: { xs: "row", sm: "row" },
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    <Tooltip title={t("Reply to reclamation")}>
                      <IconButton
                        onClick={() => handleOpenReplyModal(rec)}
                        sx={{ "&:hover": { bgcolor: "primary.lighter" } }}
                      >
                        <ReplyIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("Edit reclamation status")}>
                      <IconButton
                        onClick={() => handleOpenUpdateModal(rec)}
                        sx={{ "&:hover": { bgcolor: "info.lighter" } }}
                      >
                        <EditIcon color="info" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("Delete reclamation")}>
                      <IconButton
                        onClick={() => handleOpenDeleteDialog(rec.id!)}
                        sx={{ "&:hover": { bgcolor: "error.lighter" } }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </StyledListItem>
              </StyledCard>
            ))}
          </List>
        )}
        <Pagination
          count={Math.ceil(filteredReclamations.length / pagination.limit)}
          page={currentPage}
          onChange={handlePageChange}
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            "& .MuiPaginationItem-root": {
              fontSize: { xs: "0.9rem", sm: "1rem" },
            },
          }}
          color="primary"
        />
      </Grid>
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        sx={{
          "& .MuiDialog-paper": {
            width: { xs: "90%", sm: 400 },
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 600 }}>
          {t("Confirm Deletion")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
            {t(
              "Are you sure you want to delete this reclamation? This action cannot be undone."
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={loading}
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
          >
            {t("Cancel")}
          </Button>
          <SubmitButton
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
            sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
          >
            {t("Confirm")}
          </SubmitButton>
        </DialogActions>
      </Dialog>
      <EntityModal
        open={openReplyModal}
        onClose={handleCloseReplyModal}
        title="Respond to Reclamation"
        entity={{ subject: replySubject, content: replyContent }}
        fields={replyFields}
        onChange={handleReplyChange}
        onSubmit={handleSendReply}
        entityType="reply"
        isLoading={replyLoading}
      >
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t("Upload Photos")}:
          </Typography>
          <Button
            variant="outlined"
            component="label"
            sx={{ mb: 2, borderRadius: "8px" }}
          >
            {t("Choose Files")}
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handlePhotoUpload}
            />
          </Button>
          {replyPhotos.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap">
              {replyPhotos.map((photo, index) => (
                <Box
                  key={index}
                  position="relative"
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={photo}
                    alt={`${t("Preview")} ${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "white",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                    }}
                    onClick={() => handleRemovePhoto(index)}
                    aria-label={t("Remove Photo")}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </EntityModal>
      <EntityModal
        open={openUpdateModal}
        onClose={handleCloseUpdateModal}
        title="Update Reclamation Status"
        entity={{ status: updateStatus }}
        fields={updateFields}
        onChange={handleUpdateChange}
        onSubmit={handleUpdateStatus}
        entityType="status"
        isLoading={updateLoading}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%", fontSize: { xs: "0.9rem", sm: "1rem" } }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export { GestionReclamations };
