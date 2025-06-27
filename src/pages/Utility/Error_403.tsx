import React from "react";
import { useNavigate  } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Fade,
  Zoom,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { styled } from "@mui/material/styles";



// Styled components
const ErrorContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
  padding: theme.spacing(2),
}));

const ErrorCard = styled(Card)(({ theme }) => ({
  height: 600,
  maxWidth: 500,
  width: "100%",
  textAlign: "center",
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[12],
  backgroundColor: theme.palette.background.paper,
  backdropFilter: "blur(8px)", // Subtle blur effect
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
  },
  "&:hover": {
    boxShadow: theme.shadows[16],
    transform: "translateY(-4px)",
    transition: "all 0.3s ease",
  },
  transition: "all 0.3s ease",
}));

const ErrorIcon = styled(ErrorOutlineIcon)(({ theme }) => ({
  fontSize: 120,
  color: theme.palette.error.main,
  marginBottom: theme.spacing(3),
  animation: "pulse 2s infinite",
  "@keyframes pulse": {
    "0%": { transform: "scale(1)", opacity: 1 },
    "50%": { transform: "scale(1.15)", opacity: 0.8 },
    "100%": { transform: "scale(1)", opacity: 1 },
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5, 5),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: "none",
  fontWeight: theme.typography.fontWeightBold,
  fontSize: "1.1rem",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[6],
  },
  transition: "all 0.3s ease",
}));



const Error_403: React.FC = () => {
  const navigate = useNavigate();

 

  return (
    <ErrorContainer maxWidth={false}>
      <Fade in timeout={600}>
        <ErrorCard role="alert" aria-labelledby="error-title">
          <CardContent>
            <Zoom in timeout={800}>
              <ErrorIcon aria-hidden="true" />
            </Zoom>
            <Typography
              id="error-title"
              variant="h1"
              color="error"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "3.5rem", sm: "5rem" },
                letterSpacing: "-0.02em",
              }}
            >
              403
            </Typography>
            <Typography
              variant="h4"
              color="text.primary"
              gutterBottom
              sx={{
                fontWeight: "medium",
                fontSize: { xs: "1.75rem", sm: "2.25rem" },
              }}
            >
              Access Denied
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 450, mx: "auto", lineHeight: 1.6 }}
            >
              Sorry, you don’t have permission to access this page. Please
              contact our support team if you believe this is an error.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <PrimaryButton
                variant="contained"
                onClick={() => navigate(-1)}
              >
                Back to navigate
              </PrimaryButton>
            </Box>
          </CardContent>
        </ErrorCard>
      </Fade>
    </ErrorContainer>
  );
};

export default Error_403;
