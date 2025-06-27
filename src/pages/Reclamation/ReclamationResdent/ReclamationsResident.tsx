import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReclamationForm from "./ReclamationForm";
import {
  Typography,
  CircularProgress,
  Box,
  Button,
  TextField,
  MenuItem,
  styled,
  Grid,
  Card,
  CardContent,
} from "@mui/material";

import useAuth from "../../../hooks/useAuth";
import { RootState } from "../../../store/store";
import {
  fetchReclamations,
  resetFilters,
} from "../../../store/reclamation/slice";
import { toast } from "react-toastify";
import ReclamationList from "./ReclamationList";
import { useTranslation } from "react-i18next";

const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  background: "linear-gradient(145deg, #eef2f6, #d9e2ec)",
  minHeight: "100vh",
  borderRadius: "20px",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.06)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(90deg, #1e3a8a, #3b82f6)",
  color: "#fff",
  padding: theme.spacing(3),
  borderRadius: "12px 12px 0 0",
  textAlign: "center",
  marginBottom: theme.spacing(4),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 28px rgba(0, 0, 0, 0.12)",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: theme.spacing(1.5, 3),
  textTransform: "none",
  fontWeight: 600,
  background: "linear-gradient(45deg, #1e3a8a, #3b82f6)",
  color: "#fff",
  "&:hover": {
    background: "linear-gradient(45deg, #1e40af, #60a5fa)",
    boxShadow: "0 4px 12px rgba(30, 58, 138, 0.3)",
  },
}));

const FilterBox = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: "wrap",
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  backgroundColor: "#f8fafc",
  padding: theme.spacing(2),
  textAlign: "center",
}));

const ReclamationResident: React.FC = () => {
  const { t } = useTranslation();

  const [searchQuery] = useState<string>("");
  const [statusFilter] = useState<string>("All");
  const [filters, setFilters] = useState({
    searchQuery: "",
    statusFilter: "All",
    page: 1,
    limit: 5, // Adjust based on your needs
  });

  const dispatch = useDispatch();
  const { auth } = useAuth();
  const { reclamations, loading, error, pagination } = useSelector(
    (state: RootState) => state.reclamation
  );
  const user_id = auth?.user?.id;
  useEffect(() => {
    document.title = "Beams Reclmation";
    const showToast = localStorage.getItem("showWelcomeToast");
    if (showToast === "true") {
      toast.success("Welcome to Beams", { autoClose: 3000 });
      localStorage.removeItem("showWelcomeToast");
    }
  });

  useEffect(() => {
    if (user_id) {
      dispatch(
        fetchReclamations({
          userId: user_id,
          search: filters.searchQuery,
          status:
            filters.statusFilter !== "All" ? filters.statusFilter : undefined,
          page: filters.page,
          limit: filters.limit,
        })
      );
    }
  }, [dispatch, user_id, filters]);

  const filteredReclamations = reclamations.filter((rec) => {
    const matchesSearch = rec.description
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalReclamations = reclamations.length;
  const pendingReclamations = reclamations.filter(
    (rec) => rec.status === "Pending"
  ).length;
  const resolvedReclamations = reclamations.filter(
    (rec) => rec.status === "Resolved"
  ).length;
  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      statusFilter: "All",
      page: 1,
      limit: 5,
    });
    dispatch(resetFilters());
  };
  return (
    <StyledContainer>
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t("Reclamation Dashboard")}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {t("Total Reclamations")}: {totalReclamations}
        </Typography>
      </HeaderBox>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <SummaryCard>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                {t("Total")}
              </Typography>
              <Typography variant="h4" color="primary">
                {totalReclamations}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                {t("Pending")}
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingReclamations}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <SummaryCard>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                {t("Resolved")}
              </Typography>
              <Typography variant="h4" color="success.main">
                {resolvedReclamations}
              </Typography>
            </CardContent>
          </SummaryCard>
        </Grid>
      </Grid>

      <StyledCard sx={{ mb: 4 }}>
        <CardContent>
          <ReclamationForm />
        </CardContent>
      </StyledCard>

      <FilterBox>
        <TextField
          label={t("Search Reclamations")}
          variant="outlined"
          value={filters.searchQuery}
          onChange={(e) =>
            setFilters({ ...filters, searchQuery: e.target.value, page: 1 })
          }
          sx={{ flex: 1, backgroundColor: "#fff", borderRadius: "8px" }}
        />
        <TextField
          select
          label={t("Filter by Status")}
          variant="outlined"
          value={filters.statusFilter}
          onChange={(e) =>
            setFilters({ ...filters, statusFilter: e.target.value, page: 1 })
          }
          sx={{ width: "200px", backgroundColor: "#fff", borderRadius: "8px" }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Resolved">Resolved</MenuItem>
        </TextField>
        <StyledButton
          onClick={handleResetFilters}
          variant="outlined"
          sx={{
            background: "transparent",
            color: "#1e3a8a",
            border: "1px solid #1e3a8a",
            "&:hover": {
              background: "transparent",
              border: "1px solid #1e40af",
            },
          }}
        >
          {t("Reset")}
        </StyledButton>
      </FilterBox>

      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Box
          sx={{
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            p: 2,
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          {error}
        </Box>
      ) : (
        <StyledCard>
          <CardContent>
            <ReclamationList
              reclamations={filteredReclamations}
              total={pagination.total}
              page={filters.page}
              limit={filters.limit}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </CardContent>
        </StyledCard>
      )}
    </StyledContainer>
  );
};

export default ReclamationResident;
