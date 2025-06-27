import React, { useEffect, useReducer, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import PATHS from "../../PATH/apiPath";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Visibility, VisibilityOff, CheckCircle, Cancel } from "@mui/icons-material";
import { toast } from "react-toastify";

const newPasswordReducer = (prevState, action) => {
  const validateNewPassword = (password) => {
    const lengthValid = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    return lengthValid && hasUppercase && hasNumber && hasSpecialChar;
  };

  if (action.type === "Password changed") {
    return { value: action.value, isValid: validateNewPassword(action.value) };
  }
  if (action.type === "validate_password") {
    return {
      value: prevState.value,
      isValid: validateNewPassword(prevState.value),
    };
  }
  return { value: "", isValid: null };
};

const confirmPasswordReducer = (prevState, action) => {
  if (action.type === "Confirm password changed") {
    return { value: action.value, isValid: action.value === action.password };
  }
  if (action.type === "validate_confirm_password") {
    return {
      value: prevState.value,
      isValid: prevState.value === action.password,
    };
  }
  return { value: "", isValid: null };
};

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPasswordState, dispatchNewPassword] = useReducer(newPasswordReducer, {
    value: "",
    isValid: null,
  });
  const [confirmPasswordState, dispatchConfirmPassword] = useReducer(confirmPasswordReducer, {
    value: "",
    isValid: null,
  });
  const [formIsValid, setFormIsValid] = useState(false );
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const verifyToken = async () => {
      try {
        await axios.get(`${PATHS.AUTH.RESET_PASSWORD}/${token}`);

      } catch (error) {
        toast.error(error.response?.data?.message || "Invalid or expired token");
        navigate("/forgot-password", { replace: true });
      }
    };

    verifyToken();
  }, [token, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormIsValid(newPasswordState.isValid && confirmPasswordState.isValid);
    }, 1000);
    return () => clearTimeout(timer);
  }, [newPasswordState.isValid, confirmPasswordState.isValid]);

  const newPasswordChangeHandler = (event) => {
    const trimmedValue = event.target.value.replace(/\s+/g, "");
    dispatchNewPassword({ type: "Password changed", value: trimmedValue });
  };

  const confirmPasswordChangeHandler = (event) => {
    const trimmedValue = event.target.value.replace(/\s+/g, "");
    dispatchConfirmPassword({
      type: "Confirm password changed",
      value: trimmedValue,
      password: newPasswordState.value,
    });
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${PATHS.AUTH.RESET_PASSWORD}/${token}`, {
        newPassword: newPasswordState.value,
      });
      toast.success("Password reset successfully");
      navigate("/login?changed=true", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: "At least 8 characters", isValid: newPasswordState.value.length >= 8 },
    { label: "Contains an uppercase letter", isValid: /[A-Z]/.test(newPasswordState.value) },
    { label: "Contains a number", isValid: /[0-9]/.test(newPasswordState.value) },
    { label: "Contains a special character", isValid: /[^A-Za-z0-9]/.test(newPasswordState.value) },
  ];

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "text.primary" }}>
            Reset Your Password
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Enter a new password below to secure your account.
          </Typography>
          <form onSubmit={submitHandler}>
            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPasswordState.value}
              onChange={newPasswordChangeHandler}
              error={newPasswordState.isValid === false && newPasswordState.value !== ""}
              helperText={
                newPasswordState.isValid === false && newPasswordState.value !== ""
                  ? "Password does not meet requirements"
                  : ""
              }
              variant="outlined"
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleNewPasswordVisibility} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <List dense>
              {passwordRequirements.map((req, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {req.isValid ? (
                      <CheckCircle color="success" fontSize="small" />
                    ) : (
                      <Cancel color="error" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={req.label}
                    primaryTypographyProps={{
                      variant: "body2",
                      color: req.isValid ? "success.main" : "text.secondary",
                    }}
                  />
                </ListItem>
              ))}
            </List>
            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPasswordState.value}
              onChange={confirmPasswordChangeHandler}
              error={confirmPasswordState.isValid === false && confirmPasswordState.value !== ""}
              helperText={
                confirmPasswordState.isValid === false && confirmPasswordState.value !== ""
                  ? "Passwords do not match"
                  : ""
              }
              variant="outlined"
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!formIsValid || isLoading}
                sx={{ px: 4, py: 1.5, borderRadius: 1, fontSize: "1rem", textTransform: "none" }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PasswordReset;