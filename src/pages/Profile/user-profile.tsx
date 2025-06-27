import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  TextField,
  Button,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  CircularProgress,
  Typography,
  Box,
  Fade,
  Tabs,
  Tab,
  useTheme,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { toast } from "react-toastify";
import useAuth from "../../hooks/useAuth";
import maleAvatar from "../../assets/avatar_male.jpg";
import femaleAvatar from "../../assets/avatar_female.jpg";
import { RootState } from "../../store/store";
import { useTranslation } from "react-i18next";
import { actions } from "../../store/user/slice";
import { PasswordField } from "../../components/UI/PasswordField";
import {
  setFormField,
  resetFormState,
} from "../../store/user/profileForm";
import { GenderType } from "../../types/enum/Gender";

interface FormState {
  email: string;
  username: string;
  Gender: GenderType; // Changed to lowercase
}

interface SecurityState {
  currentPassword: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email: string;
  password: string;
  confirmPassword: string;
}

const UserProfile = () => {
  document.title = "Beams Profile";
  const theme = useTheme();

  const { auth, setAuth } = useAuth();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux state
  const user = useSelector(
    (state: RootState) => state.users.entities[auth?.user?.id]
  );
  const formState = useSelector((state: RootState) => state.profileForm);
  // Refs
  const personalFormRef = useRef<HTMLFormElement>(null);
  const securityFormRef = useRef<HTMLFormElement>(null);

  // State
  const [securityState, setSecurityState] = useState<SecurityState>({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [isPersonalDirty, setIsPersonalDirty] = useState(false);
  const [isSecurityValid, setIsSecurityValid] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  // Initialize form with user data
  useEffect(() => {
    if (user || auth?.user) {
      dispatch(
        setFormField({
          field: "email",
          value: user?.email || auth?.user?.email || "",
        })
      );
      dispatch(
        setFormField({
          field: "username",
          value: user?.username || auth?.user?.username || "",
        })
      );
      dispatch(
        setFormField({
          field: "Gender",
          value: auth?.user?.Gender,
        })
      );
    }

    return () => {
      dispatch(resetFormState());
    };
  }, [user, auth, dispatch]);

  // Check if personal form has changes
  useEffect(() => {
    const initialValues = {
      email: user?.email || auth?.user?.email || "",
      username: user?.username || auth?.user?.username || "",
      Gender: auth?.user?.Gender,
    };

    setIsPersonalDirty(
      formState.email !== initialValues.email ||
        formState.username !== initialValues.username ||
        formState.Gender !== initialValues.Gender
    );
  }, [formState, user, auth]);

  // Validate security form
  useEffect(() => {
    const allFieldsFilled = Object.values(securityState).every(
      (field) => field !== ""
    );
    const passwordsMatch =
      securityState.password === securityState.confirmPassword;
    const passwordValid = validatePassword(securityState.password);

    setIsSecurityValid(allFieldsFilled && passwordsMatch && passwordValid);
  }, []);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = re.test(email);
    if (!isValid && email) {
      setFormErrors((prev) => ({
        ...prev,
        email: t("Invalid email address"),
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, email: "" }));
    }
    return isValid;
  };

  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid = hasMinLength && hasNumber && hasSpecialChar;
    if (!isValid && password) {
      setFormErrors((prev) => ({
        ...prev,
        password: t(
          "Password must be at least 8 characters with a number and special character"
        ),
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, password: "" }));
    }
    return isValid;
  };

  const handleTextFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!name) return;

    dispatch(
      setFormField({ field: name as keyof FormState, value: value as string })
    );

    if (name === "email") {
      validateEmail(value);
    }
  };

  const handleSelectChange = (
    e: SelectChangeEvent<GenderType>,
    child: React.ReactNode
  ) => {
    const { name, value } = e.target;
    if (!name) return;

    dispatch(
      setFormField({ field: name as keyof FormState, value: value as string })
    );
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityState((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      validatePassword(value);
    }

    if (name === "confirmPassword" || name === "password") {
      setFormErrors((prev) => ({
        ...prev,
        confirmPassword:
          securityState.password === value ||
          (name === "password" && value === securityState.confirmPassword)
            ? ""
            : t("Passwords do not match"),
      }));
    }
  };

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth?.accessToken) {
      toast.error(t("Please log in to update your profile"));
      return;
    }

    if (!validateEmail(formState.email)) {
      return;
    }
    const userData = {
      id: auth.user?.id,
      email: formState.email,
      Gender: formState.Gender,
      username: formState.username,
    };

    try {
      setLoadingPersonal(true);
      await dispatch(
        actions.editProfileRequest({
          user: userData,
          authToken: auth.accessToken,
        })
      );
      setAuth((prev) => ({
        ...prev,
        user: { ...prev.user, ...userData },
      }));
      toast.success(t("Personal information updated successfully!"));
    } catch (error) {
      toast.error(t("Failed to update personal information"));
    } finally {
      setLoadingPersonal(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth?.accessToken) {
      toast.error(t("Please log in to update your password"));
      return;
    }

    if (!isSecurityValid) {
      toast.error(t("Please fill all fields correctly"));
      return;
    }

    const passwordData = {
      id: auth.user?.id,
      currentPassword: securityState.currentPassword,
      password: securityState.password,
    };

    try {
      setLoadingSecurity(true);
      await dispatch(
        actions.verifyPasswordRequest({
          passwordData,
          authToken: auth.accessToken,
        })
      );
      toast.success(t("Password updated successfully!"));
      setSecurityState({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(t("Failed to update password"));
    } finally {
      setLoadingSecurity(false);
    }
  };
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        p: 3,
        height: "100%",
        backgroundColor: theme.palette.grey.A100,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          bgcolor: "white",
          overflow: "hidden",
        }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            bgcolor: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
            p: 2,
            borderRadius: "12px 12px 0 0",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "white",
              letterSpacing: 0.5,
            }}
          >
            {t("Profile Settings")}
          </Typography>
        </Box>

        {/* Avatar */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10, mb: 3 }}>
          <Avatar
            src={
              formState.Gender === GenderType.Male ? maleAvatar : femaleAvatar
            }
            sx={{
              width: { xs: 80, sm: 120 },
              height: { xs: 80, sm: 120 },
              border: `3px solid ${
                formState.Gender === GenderType.Male ? "#1976d2" : "#e91e63"
              }`,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>

        {/* Tabs for Personal and Security */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          sx={{
            mb: 3,
            "& .MuiTab-root": {
              fontWeight: 500,
              textTransform: "none",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            },
            "& .Mui-selected": {
              color: "#1976d2 !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#1976d2",
            },
          }}
          aria-label="profile settings tabs"
        >
          <Tab label={t("Personal Information")} />
          <Tab label={t("Security")} />
        </Tabs>

        {/* Personal Information Form */}
        {tabValue === 0 && (
          <Fade in={tabValue === 0}>
            <Box>
              <form ref={personalFormRef} onSubmit={handlePersonalSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("Email")}
                      variant="outlined"
                      name="email"
                      value={formState.email}
                      onChange={handleTextFieldChange}
                      required
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      slotProps={{
                        input: {
                          sx: {
                            borderRadius: 2,
                            bgcolor: "grey.50",
                            "&:hover": { bgcolor: "grey.100" },
                          },
                        },
                      }}
                      aria-describedby="email-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label={t("Username")}
                      variant="outlined"
                      name="username"
                      value={formState.username}
                      onChange={handleTextFieldChange}
                      required
                      slotProps={{
                        input: {
                          sx: {
                            borderRadius: 2,
                            bgcolor: "grey.50",
                            "&:hover": { bgcolor: "grey.100" },
                          },
                        },
                      }}
                      aria-describedby="username-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t("Gender")}</InputLabel>
                      <Select
                        name="Gender"
                        value={formState.Gender}
                        onChange={handleSelectChange}
                        label={t("Gender")}
                        sx={{
                          borderRadius: 2,
                          bgcolor: "grey.50",
                          "&:hover": { bgcolor: "grey.100" },
                        }}
                        aria-describedby="gender-select"
                      >
                        <MenuItem value={GenderType.Male}>{t("Male")}</MenuItem>
                        <MenuItem value={GenderType.Female}>
                          {t("Female")}
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loadingPersonal || !isPersonalDirty}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                        bgcolor: "#1976d2",
                        "&:hover": {
                          bgcolor: "#1565c0",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        },
                        "&:disabled": {
                          bgcolor: "grey.300",
                          color: "grey.600",
                        },
                        transition: "all 0.3s ease",
                      }}
                      aria-label={t("Save")}
                    >
                      {loadingPersonal ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        t("Save")
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Fade>
        )}

        {/* Security Form */}
        {tabValue === 1 && (
          <Fade in={tabValue === 1}>
            <Box>
              <form ref={securityFormRef} onSubmit={handleSecuritySubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <PasswordField
                      label={t("Current Password")}
                      name="currentPassword"
                      value={securityState.currentPassword}
                      show={showCurrentPassword}
                      onChange={handleSecurityChange}
                      toggleVisibility={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      // slotProps={{
                      //   input: {
                      //     sx: {
                      //       borderRadius: 2,
                      //       bgcolor: "grey.50",
                      //       "&:hover": { bgcolor: "grey.100" },
                      //     },
                      //   },
                      // }}
                      aria-describedby="current-password-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PasswordField
                      label={t("New Password")}
                      name="password"
                      value={securityState.password}
                      show={showPassword}
                      error={formErrors.password}
                      onChange={handleSecurityChange}
                      toggleVisibility={() => setShowPassword(!showPassword)}
                      // slotProps={{
                      //   input: {
                      //     sx: {
                      //       borderRadius: 2,
                      //       bgcolor: "grey.50",
                      //       "&:hover": { bgcolor: "grey.100" },
                      //     },
                      //   },
                      // }}
                      aria-describedby="new-password-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <PasswordField
                      label={t("Confirm Password")}
                      name="confirmPassword"
                      value={securityState.confirmPassword}
                      show={showConfirmPassword}
                      error={formErrors.confirmPassword}
                      onChange={handleSecurityChange}
                      toggleVisibility={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      // slotProps={{
                      //   input: {
                      //     sx: {
                      //       borderRadius: 2,
                      //       bgcolor: "grey.50",
                      //       "&:hover": { bgcolor: "grey.100" },
                      //     },
                      //   },
                      // }}
                      aria-describedby="confirm-password-helper-text"
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loadingSecurity || !isSecurityValid}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                        bgcolor: "#1976d2",
                        "&:hover": {
                          bgcolor: "#1565c0",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                        },
                        "&:disabled": {
                          bgcolor: "grey.300",
                          color: "grey.600",
                        },
                        transition: "all 0.3s ease",
                      }}
                      aria-label={t("Update Password")}
                    >
                      {loadingSecurity ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        t("Update Password")
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Fade>
        )}
      </Paper>
    </Box>
  );
};

export default UserProfile;
