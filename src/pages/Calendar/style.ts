import { Box, Button, Card, styled } from "@mui/material";

const StyledContainer = styled(Box)(({ theme }) => ({
  padding: 10,
  marginLeft: 20,
  background: "linear-gradient(135deg, #f5f7fa, #e4e9f0)",
  minHeight: "100vh",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  backgroundColor: "#ffffff",
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

const CategoryBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: "8px",
  marginTop: theme.spacing(1),
  cursor: "grab",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
}));

const StyledCalendar = styled(Box)(({ theme }) => ({
  "& .fc": {
    borderRadius: "12px",
    backgroundColor: "#fff",
    padding: theme.spacing(2),
    "& .fc-toolbar": {
      backgroundColor: "#1e3a8a",
      color: "#fff",
      borderRadius: "8px 8px 0 0",
      padding: theme.spacing(1),
    },
    "& .fc-button": {
      backgroundColor: "#3b82f6",
      border: "none",
      "&:hover": {
        backgroundColor: "#60a5fa",
      },
    },
    "& .fc-daygrid-day": {
      borderRadius: "8px",
      transition: "background-color 0.2s ease",
      "&:hover": {
        backgroundColor: "#f1f5f9",
      },
    },
  },
}));
export {
  StyledContainer,
  StyledCard,
  StyledButton,
  CategoryBox,
  StyledCalendar,
};
