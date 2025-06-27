import React, { useEffect, useState, ChangeEvent } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";

interface PhotoUploadProps {
  photos: File[];
  setPhotos: (photos: File[]) => void;
  error?: string;
  onBlur?: () => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  setPhotos,
  error,
  onBlur,
}) => {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Generate previews when photos change
  useEffect(() => {
    const newPreviews: string[] = photos.map((photo) =>
      URL.createObjectURL(photo)
    );
    setPhotoPreviews(newPreviews);

    // Cleanup blob URLs
    return () => {
      newPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [photos]);

  // Handle file input change
  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setPhotos([...photos, ...newFiles]);
    }
    onBlur?.();
  };

  // Remove a photo
  const handleRemovePhoto = (index: number) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
  };

  return (
    <Box mt={2}>
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadFileIcon />}
      >
        Télécharger des photos
        <input
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handlePhotoChange}
        />
      </Button>
      {error && (
        <Typography color="error" variant="caption" mt={1}>
          {error}
        </Typography>
      )}
      {photoPreviews.length > 0 && (
        <Box mt={2}>
          <Box display="flex" flexWrap="wrap" gap={2}>
            {photoPreviews.map((src, index) => (
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
                    left: 4,
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
    </Box>
  );
};

export default PhotoUpload;
