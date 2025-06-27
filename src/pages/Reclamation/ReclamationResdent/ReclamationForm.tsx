import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  IconButton,
  LinearProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import { createReclamation } from "../../../store/reclamation/slice";
import { RootState, AppDispatch } from "../../../store/store";
import CustomInput from "../../../components/UI/Input";
import CustomButton from "../../../components/UI/Button";
import CustomForm from "../../../components/UI/Form";
import { useTranslation } from "react-i18next";

interface ReclamationFormData {
  title: string;
  description: string;
  Photo: File[];
}

const cleanPhotoUrl = (photo: string): string => {
  return photo.replace(/^"|"$/g, "").replace(/\\"/g, "");
};

const ReclamationForm: React.FC = () => {
  const { auth } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, createSuccess } = useSelector(
    (state: RootState) => state.reclamation
  );
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    setValue,
    reset,
  } = useForm<ReclamationFormData>({
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      Photo: [],
    } as ReclamationFormData,
  });

  const onSubmit = async (data: ReclamationFormData) => {
    if (!auth?.accessToken || !auth?.user?.id) {
      toast.error(t("Erreur : informations d'authentification manquantes"));
      return;
    }

    // Convert files to base64 URLs
    const photoUrls: string[] = [];
    for (const photo of data.Photo) {
      if (photo instanceof File) {
        const photoUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });
        photoUrls.push(photoUrl);
      } else {
        photoUrls.push(cleanPhotoUrl(photo as any));
      }
    }

    // Prepare data for API
    const reclamationData = {
      title: data.title,
      description: data.description,
      user_id: auth.user.id,
      Photo: photoUrls,
      status: "Pending",
    };

    dispatch(createReclamation(reclamationData));
  };

  // Handle photo upload button click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle photo file selection
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      // Get current files from form
      const currentFiles = photoPreview as any;
      const updatedFiles = [...currentFiles, ...newFiles];
      const updatedPreviews = [...photoPreview, ...newPreviews];

      setPhotoPreview(updatedPreviews);
      setValue("Photo", updatedFiles as any, { shouldValidate: true });
    }
  };

  // Remove a photo
  const handleRemovePhoto = (index: number) => {
    const updatedPreviews = [...photoPreview];
    const removedPreview = updatedPreviews.splice(index, 1)[0];
    
    if (removedPreview.startsWith("blob:")) {
      URL.revokeObjectURL(removedPreview);
    }

    const updatedFiles = [...(photoPreview as any)];
    updatedFiles.splice(index, 1);

    setPhotoPreview(updatedPreviews);
    setValue("Photo", updatedFiles as any, { shouldValidate: true });
  };

  // Effects for handling success/errors
  useEffect(() => {
    if (createSuccess) {
      toast.success(t("Réclamation envoyée avec succès"));
      reset();
      setPhotoPreview([]);
    }
  }, [createSuccess, reset,t]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Cleanup previews
  useEffect(() => {
    return () => {
      photoPreview.forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [photoPreview]);

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", p: 3, boxShadow: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t("New Reclamation")}
      </Typography>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <CustomForm onSubmit={handleSubmit(onSubmit)} isSubmitting={loading}>
        <CustomInput
          label={t("Title of the Reclamation")}
          name="title"
          type="text"
          register={register}
          rules={{
            required: t("Le titre est requis"),
            minLength: {
              value: 3,
              message: t("Le titre doit contenir au moins 3 caractères"),
            },
          }}
          error={!!errors.title}
          helperText={errors.title?.message}
          sx={{ mb: 2 }}
        />

        {/* Description Field */}
        <CustomInput
          label={t("Detailed description")}
          name="description"
          type="text"
          register={register}
          rules={{
            required: t("La description est requise"),
            minLength: {
              value: 10,
              message: t("La description doit contenir au moins 10 caractères"),
            },
          }}
          error={!!errors.description}
          helperText={errors.description?.message}
          sx={{ mb: 2 }}
        />

        <Box mt={2}>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <CustomButton
            fullWidth
            type="button"
            onClick={handleUploadClick}
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <UploadFileIcon />
            {t("Upload photos")}
          </CustomButton>
          {errors.Photo && (
            <Typography color="error" variant="caption" mt={1} display="block">
              {errors.Photo.message}
            </Typography>
          )}
        </Box>

        {photoPreview.length > 0 && (
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary" mb={1}>
              {t("Selected photos")} ({photoPreview.length})
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2} mt={1}>
              {photoPreview.map((src, index) => (
                <Box
                  key={index}
                  position="relative"
                  width={120}
                  height={120}
                  sx={{
                    borderRadius: 1,
                    boxShadow: 1,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt={`Preview ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemovePhoto(index)}
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      backgroundColor: "rgba(255,255,255,0.7)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,1)",
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
          <CustomButton
            type="submit"
            variant="contained"
            isFormValid={isValid}
          >
            {loading ? t("Envoi en cours...") : t("Submit the Reclamation")}
          </CustomButton>
          <CustomButton
            type="button"
            onClick={() => {
              reset();
              setPhotoPreview([]);
            }}
          >
            {t("Cancel")}
          </CustomButton>
        </Box>
      </CustomForm>
    </Card>
  );
};

export default ReclamationForm;