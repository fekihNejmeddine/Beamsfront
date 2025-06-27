import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  useTheme,
} from "@mui/material";
import Fade from "@mui/material/Fade";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface WaitingConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (accept: boolean) => void;
  waitingPosition: number | null;
  waitingMessage: string | null;
}

const WaitingConfirmationModal: React.FC<WaitingConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  waitingPosition,
  waitingMessage,
}) => {
  const theme = useTheme();

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
          maxWidth: 400,
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
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.contrastText,
          py: 1.5,
          fontWeight: "bold",
        }}
      >
        <WarningAmberIcon fontSize="small" />
        Confirmer la file d'attente
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 3, px: 4 }}>
        <Typography variant="body1" sx={{ mb: 1.5, color: "text.primary" }}>
          Ce créneau horaire est déjà pris ! Voulez-vous placer votre événement dans la file
          d'attente en position
          <Typography component="span" fontWeight="bold" color="warning.main">
            {waitingPosition}
          </Typography>
          ?
        </Typography>
        {waitingMessage && (
          <Typography variant="body2" color="text.secondary">
            {waitingMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 2, gap: 1 }}>
        <Button
          onClick={() => onConfirm(false)}
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
          Non
        </Button>
        <Button
          onClick={() => onConfirm(true)}
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
          Accepter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export  {WaitingConfirmationModal};