import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Divider,
  useTheme,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import Fade from "@mui/material/Fade";
import moment, { Moment } from "moment";
import EventIcon from "@mui/icons-material/Event";

interface TimeSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (startTime: string, endTime: string) => void;
  initialStartTime: string | null;
  initialEndTime: string | null;
}

const TimeSelectionModal: React.FC<TimeSelectionModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialStartTime,
  initialEndTime,
}) => {
  const theme = useTheme();
  const [startTime, setStartTime] = useState<Moment | null>(
    initialStartTime ? moment(initialStartTime) : null
  );
  const [endTime, setEndTime] = useState<Moment | null>(
    initialEndTime ? moment(initialEndTime) : null
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    console.log('submit')
    if (!startTime || !endTime) {
      setError("Veuillez sélectionner une heure de début et de fin.");
      console.log('submit2')

      return;
    }
    if (startTime.isSameOrAfter(endTime)) {
      setError("L'heure de fin doit être postérieure à l'heure de début.");
      console.log('submit3')

      return;
    }
    console.log('submit4')

    setError(null);
    onSubmit(startTime.toISOString(), endTime.toISOString());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          maxWidth: 500,
          width: "100%",
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: theme.palette.info.light,
          color: theme.palette.info.contrastText,
          py: 1.5,
          fontWeight: "bold",
        }}
      >
        <EventIcon fontSize="small" />
        Choisir un nouveau créneau horaire
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 3, px: 4 }}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <DateTimePicker
              label="Nouvelle heure de début"
              value={startTime}
              onChange={(value) => setStartTime(value)}
              slotProps={{
                textField: {
                  variant: "outlined",
                  fullWidth: true,
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      bgcolor: "background.default",
                    },
                  },
                },
              }}
              minDate={moment().startOf("day")}
            />

            <DateTimePicker
              label="Nouvelle heure de fin"
              value={endTime}
              onChange={(value) => setEndTime(value)}
              slotProps={{
                textField: {
                  variant: "outlined",
                  fullWidth: true,
                  sx: {
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      bgcolor: "background.default",
                    },
                  },
                },
              }}
              minDate={startTime || moment().startOf("day")}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: "medium",
            px: 3,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: "medium",
            px: 3,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export  {TimeSelectionModal};
