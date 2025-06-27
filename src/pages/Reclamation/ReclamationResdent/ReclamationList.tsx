import React, { useState  } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Modal,
  TextField,
  Button,
  CircularProgress,
  Tooltip,
  Avatar,
  Divider,
  Alert,
  Paper,
  LinearProgress,
  Pagination,
} from "@mui/material";
import { Edit, Delete, Close, Image } from "@mui/icons-material";
import { IReclamation } from "../../../store/reclamation/types";
import {
  deleteReclamation,
  updateReclamation,
} from "../../../store/reclamation/slice";
import { RootState, AppDispatch } from "../../../store/store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { t } from "i18next";
import Swal from "sweetalert2";

interface ReclamationListProps {
  reclamations: IReclamation[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}
const ReclamationList: React.FC<ReclamationListProps> = ({
  reclamations,
  total,
  page,
  limit,
  onPageChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector(
    (state: RootState) => state.reclamation
  );
  const [openModal, setOpenModal] = useState(false);
  const [selectedReclamation, setSelectedReclamation] =
    useState<IReclamation | null>(null);
  const [description, setDescription] = useState("");
 
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);

  const handleOpenModal = (rec: IReclamation) => {
    setSelectedReclamation(rec);
    setDescription(rec.description);
    setPhotoPreview(rec.Photo || []);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedReclamation(null);
    setDescription("");
    setPhotoPreview([]);
  };

  const handleUpdate = async () => {
    if (!selectedReclamation) return;

    try {
      await dispatch(
        updateReclamation({
          id: selectedReclamation.id!,
          description,
          status: selectedReclamation.status,
          Photo: photoPreview,
        })
      );
      handleCloseModal();
    } catch (error) {
      console.error("Error updating reclamation:", error);
    }
  };

  const handleConfirmDelete = async (id: number) => {
    const result = await Swal.fire({
      title: t("Are you sure ?"),
      text: `${t("Do you really want to delete")} ${t("this claim")}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Yes, delete"),
      cancelButtonText: t("Cancel"),
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteReclamation(id));
        Swal.fire(t("Deleted!"), t("The claim has been deleted."), "success");
      } catch (error) {
        console.error("Error deleting reclamation:", error);
        Swal.fire(t("Error"), t("Unable to delete the claim."), "error");
      }
    }
  };

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "Inconnu";

    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }
      return format(date, "PPpp", { locale: fr });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date invalide";
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "success";
      case "In Progress":
        return "warning";
      case "Pending":
        return "info";
      default:
        return "default";
    }
  };
  const normalizePhotos = (photos: any): string[] => {
    if (!photos) return [];
    if (Array.isArray(photos)) return photos;
    if (typeof photos === "string") {
      try {
        // Handle case where photos might be a JSON string
        const parsed = JSON.parse(photos);
        return Array.isArray(parsed) ? parsed : [photos];
      } catch {
        return [photos];
      }
    }
    return [photos.toString()];
  };
  return (
    <Box sx={{ mt: 4 }}>
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {reclamations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            Aucune réclamation trouvée
          </Typography>
        </Paper>
      ) : (
        reclamations.map((rec) => (
          <Card
            key={rec.id}
            sx={{
              mb: 3,
              boxShadow: 2,
              borderRadius: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {rec.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Créé le: {formatDate(rec.created_at)}
                  </Typography>
                </Box>
                <Chip
                  label={rec.status}
                  color={getStatusColor(rec.status)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body1" paragraph>
                {rec.description}
              </Typography>

              {normalizePhotos(rec.Photo).length > 0 && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Pièces jointes:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {normalizePhotos(rec.Photo).map((photo, index) => (
                      <Avatar
                        key={index}
                        variant="rounded"
                        src={photo}
                        sx={{ width: 80, height: 80, cursor: "pointer" }}
                        onClick={() => window.open(photo, "_blank")}
                      >
                        <Image />
                      </Avatar>
                    ))}
                  </Box>
                </Box>
              )}
              <Box
                display="flex"
                justifyContent="flex-end"
                gap={1}
                sx={{ mt: 2 }}
              >
                <Tooltip
                  title={
                    rec.status !== "Pending"
                      ? "Seules les réclamations en attente peuvent être modifiées"
                      : "Modifier"
                  }
                >
                  <span>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenModal(rec)}
                      disabled={rec.status !== "Pending"}
                    >
                      <Edit />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Supprimer">
                  <IconButton
                    color="error"
                    onClick={() => handleConfirmDelete(rec.id!)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        ))
      )}

      {/* Edit Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 500 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">{t("Modify the claim")}</Typography>
            <IconButton onClick={handleCloseModal}>
              <Close />
            </IconButton>
          </Box>

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            sx={{ mb: 3 }}
          />

          {normalizePhotos(photoPreview).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Photos:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {normalizePhotos(photoPreview).map((photo, index) => (
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
                      alt={`Preview ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              disabled={loading || !description.trim()}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Mettre à jour
            </Button>
          </Box>
        </Box>
      </Modal>

      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={Math.ceil(total / limit)}
          page={page}
          onChange={(_, value) => onPageChange(value)}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
    </Box>
  );
};

export default ReclamationList;
