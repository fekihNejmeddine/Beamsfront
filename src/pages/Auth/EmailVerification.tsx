import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Box,
} from "@mui/material";
import PATHS from "../../PATH/apiPath";
import ROUTE from "../../PATH/route";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const EmailVerification: React.FC = () => {
  const { t } = useTranslation();
  const snackbarShownRef = useRef<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [found, setFound] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const expire = queryParams.get("token");
    if (expire === "expired" && !snackbarShownRef.current) {
      toast.warning("Token expired, try again");
      snackbarShownRef.current = true;
    }
  }, [location.search]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value.trim().toLowerCase());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(PATHS.AUTH.FORGETPASSWORD, { email });
      setFound(true);
      toast.success("Password reset mail sent successfully!");
      navigate(ROUTE.LOGIN, { replace: true });
    } catch (error) {
      setFound(false);
      toast.warning("Wrong Email, try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", color: "text.primary" }}
          >
            {t("Password Reset")}
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            {t("Enter your email address to receive a password reset link.")}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              label="Email Address"
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={handleEmailChange}
              error={found === false}
              helperText={found === false ? "Invalid email, try again" : ""}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading || !email}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 1,
                  fontSize: "1rem",
                  textTransform: "none",
                  maxWidth: 300,
                }}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EmailVerification;
