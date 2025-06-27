import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Box,
  CircularProgress,
  List,
  Pagination,
  Snackbar,
  Alert,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  IconButton,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
  styled,
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Event as EventIcon,
  Info as InfoIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { actions } from "../store/event/eventSlice";
import useAuth from "../hooks/useAuth";
import {
  HeaderBox,
  StyledCard,
  StyledListItem,
  StyledChip,
} from "../styles/common";
import { IEvent } from "../store/event/types";
import { AppDispatch, RootState } from "../store/store";
import { format, parseISO, isBefore } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { motion } from "framer-motion";
import ProgressBar from "../components/ProgressBar";
const StyledContainer = styled(Container)(({ theme }) => ({
  maxWidth: "none",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[100],
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));
const ListEventResident: React.FC = () => {
  document.title = "Resident Events";
  const { auth } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error, pagination } = useSelector(
    (state: RootState) => state.event
  );
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">(
    "success"
  );
  const [voteConfirmationOpen, setVoteConfirmationOpen] =
    useState<boolean>(false);
  const [voteType, setVoteType] = useState<"for" | "against" | null>(null);
  console.log(auth);
  const fetchEvents = useCallback(() => {
    if (auth?.user?.idsyndic && auth?.user?.id) {
      dispatch(
        actions.fetchEventsRequest({
          page: currentPage,
          limit: pagination.limit || 10,
          idsyndic: auth.user.idsyndic,
          userId: auth.user.id,
          authToken: auth?.accessToken,
        })
      );
    }
  }, [
    dispatch,
    currentPage,
    auth?.user?.idsyndic,
    auth?.user?.id,
    pagination.limit,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };
  const handleVote = async (eventId: number, vote: "for" | "against") => {
    try {
      dispatch(
        actions.voteEventRequest({
          eventId,
          vote,
          userId: auth?.user?.id,
          authToken: auth?.accessToken,
        })
      );
      setVoteType(vote);
      setVoteConfirmationOpen(true);
      fetchEvents();
    } catch (error) {
      setSnackbarMessage(t("Failed to record vote"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseVoteConfirmation = () => {
    setVoteConfirmationOpen(false);
    setVoteType(null);
  };

  const formatEventDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, "PPpp", {
      locale: i18n.language === "fr" ? fr : enUS,
    });
  };

  const calculateVotePercentage = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst;
    if (total === 0) return { for: 50, against: 50 };
    return {
      for: Math.round((votesFor / total) * 100),
      against: 100 - Math.round((votesFor / total) * 100),
    };
  };

  const isVotingDisabled = (eventDate: string) => {
    return isBefore(parseISO(eventDate), new Date());
  };
  const renderEventCard = (event: IEvent) => {
    console.log(event);

    const percentages = calculateVotePercentage(
      event.votesFor,
      event.votesAgainst
    );

    const votingDisabled = isVotingDisabled(event.date);
    const userHasVoted = !!event.userVote;
    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StyledCard>
          <StyledListItem>
            <Box width="100%">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <EventIcon color="primary" fontSize="small" />
                    {event.title}
                  </Typography>
                  <StyledChip
                    label={t(event.type)}
                    color="primary"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Tooltip title={t("More Info")}>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {event.description}
              </Typography>

              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="caption" color="text.disabled">
                  {formatEventDate(event.date)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    {t("For")}:
                    <Badge
                      badgeContent={event.votesFor}
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2">{percentages.for}%</Typography>
                </Box>
                <ProgressBar
                  value={percentages.for}
                  color="success"
                  height={8}
                />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  mt={2}
                  mb={1}
                >
                  <Typography variant="body2">
                    {t("Against")}:
                    <Badge
                      badgeContent={event.votesAgainst}
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant="body2">
                    {percentages.against}%
                  </Typography>
                </Box>
                <ProgressBar
                  value={percentages.against}
                  color="error"
                  height={8}
                />
              </Box>

              <Box display="flex" gap={2} sx={{ mt: 2 }}>
                <Button
                  variant={event.userVote === "for" ? "contained" : "outlined"}
                  color="success"
                  startIcon={<ThumbUpIcon />}
                  onClick={() => handleVote(event.id!, "for")}
                  fullWidth={isMobile}
                  disabled={votingDisabled || userHasVoted}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  aria-label={t("Vote for this event")}
                >
                  {event.userVote === "for" ? t("Voted For") : t("Vote For")}
                </Button>
                <Button
                  variant={
                    event.userVote === "against" ? "contained" : "outlined"
                  }
                  color="error"
                  startIcon={<ThumbDownIcon />}
                  onClick={() => handleVote(event.id!, "against")}
                  fullWidth={isMobile}
                  disabled={votingDisabled || userHasVoted}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  aria-label={t("Vote against this event")}
                >
                  {event.userVote === "against"
                    ? t("Voted Against")
                    : t("Vote Against")}
                </Button>
              </Box>
              {votingDisabled && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ mt: 1 }}
                >
                  {t("Voting is closed for this event")}
                </Typography>
              )}
            </Box>
          </StyledListItem>
        </StyledCard>
      </motion.div>
    );
  };

  return (
    <StyledContainer maxWidth={false} disableGutters>
      <HeaderBox>
        <Typography
          variant="h3"
          sx={{ fontWeight: 700, fontSize: { xs: "1.8rem", sm: "2.5rem" } }}
        >
          {t("Community Events")}
        </Typography>
      </HeaderBox>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="300px"
        >
          <CircularProgress color="primary" size={60} />
        </Box>
      ) : error ? (
        <Box
          sx={{
            backgroundColor: "error.light",
            color: "error.contrastText",
            p: 3,
            borderRadius: 2,
            boxShadow: theme.shadows[1],
            textAlign: "center",
          }}
        >
          <Typography variant="body1">{error}</Typography>
        </Box>
      ) : events.length === 0 ? (
        <Box
          textAlign="center"
          p={4}
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: theme.shadows[1],
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {t("No events found")}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {t("Check back later")}
          </Typography>
        </Box>
      ) : (
        <List sx={{ py: 0 }}>{events.map(renderEventCard)}</List>
      )}

      {pagination.total > 0 && (
        <Box display="flex" justifyContent="center" mt={4} mb={2}>
          <Pagination
            count={Math.ceil(pagination.total / (pagination.limit || 10))}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size={isMobile ? "small" : "medium"}
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
              },
            }}
          />
        </Box>
      )}

      <Dialog
        open={voteConfirmationOpen}
        onClose={handleCloseVoteConfirmation}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", color: "success.main" }}>
          {t("Vote Recorded Successfully")}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Box display="flex" justifyContent="center" gap={1} mb={2}>
            <StarIcon sx={{ color: "gold", fontSize: 30 }} />
            <StarIcon sx={{ color: "gold", fontSize: 30 }} />
            <StarIcon sx={{ color: "gold", fontSize: 30 }} />
          </Box>
          <Typography variant="body1" color="text.primary">
            {t("You voted")} {voteType === "for" ? t("For") : t("Against")}{" "}
            {t("this event.")}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {t("Thank you for participating!")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            onClick={handleCloseVoteConfirmation}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default ListEventResident;
