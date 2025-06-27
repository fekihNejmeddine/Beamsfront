import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Container,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import signin from "../../assets/signin1.png";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PATHS from "../../PATH/apiPath";
import Input from "../../components/UI/Input";
import CustomButton from "../../components/UI/Button";
import CustomForm from "../../components/UI/Form";
import {
  LoginFormData,
  ForgotPasswordFormData,
} from "../../types/interface/Login";
import { LeftPanel, RightPanel, StyledPaper } from "./Style";
import { CheckCircleOutline } from "@mui/icons-material";

const Login: React.FC = () => {
  document.title = "Beams";
  const theme = useTheme();
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const {
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isValid: isLoginValid },
    register: registerLogin,
    reset: resetLoginForm,
  } = useForm<LoginFormData>({
    mode: "onChange",
  });

  const {
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors, isValid: isForgotValid },
    register: registerForgot,
    reset: resetForgotForm,
    watch,
  } = useForm<ForgotPasswordFormData>({
    mode: "onChange",
  });

  useEffect(() => {
    if (!isForgotPassword) {
      resetLoginForm();
      setResetEmailSent(false);
    } else {
      resetForgotForm();
    }
  }, [isForgotPassword, resetLoginForm, resetForgotForm]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await axios.post(PATHS.AUTH.LOGIN, data, {
        withCredentials: true,
      });
      if (response.data.user) {
        setAuth({
          user: response.data.user,
          accessToken: response.data.accessToken,
          role: response.data.user.role,
        });
        localStorage.setItem("showWelcomeToast", "true");
        navigate("/", { replace: true });
      } else {
        toast.warning(
          "Please check Administrative for activation of your account"
        );
      }
    } catch (error) {
      toast.error("Login failed!");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setEmailError(null);
    try {
      await axios.post(PATHS.AUTH.FORGETPASSWORD, { email: data.email });
      toast.success("Password reset mail sent successfully!");
      setResetEmailSent(true);
    } catch (error) {
      setEmailError("Invalid email, try again");
      toast.warning("Wrong Email, try again");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <LeftPanel>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          textAlign: "center",
          mb: 1,
          color: theme.palette.primary.main,
        }}
      >
        Welcome to Beams
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        textAlign="center"
        sx={{ mb: 4 }}
      >
        Sign in to continue your journey
      </Typography>
      <CustomForm onSubmit={handleLoginSubmit(onLoginSubmit)}>
        <Input
          name="email"
          label="Email"
          icon="account"
          register={registerLogin}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: "Invalid email address",
            },
          }}
          error={!!loginErrors.email}
          helperText={loginErrors.email?.message}
          sx={{ marginBottom: "5%" }}
        />
        <Input
          name="password"
          label="Password"
          icon="lock"
          type="password"
          register={registerLogin}
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            validate: {
              hasUppercase: (value) =>
                /[A-Z]/.test(value) ||
                "Password must contain at least one uppercase letter",
              hasLowercase: (value) =>
                /[a-z]/.test(value) ||
                "Password must contain at least one lowercase letter",
              hasSpecialChar: (value) =>
                /[=+-/*!?]/.test(value) ||
                "Password must contain at least one special character ( =+-/*!? )",
            },
          }}
          error={!!loginErrors.password}
          helperText={loginErrors.password?.message}
          sx={{ marginBottom: "5%" }}
        />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer" }}
            onClick={() => setIsForgotPassword(true)}
          >
            Forgot password?
          </Typography>
        </Box>
        <CustomButton type="submit" isFormValid={isLoginValid}>
          {isLoading ? "Signing In..." : "Sign In"}
        </CustomButton>
      </CustomForm>
    </LeftPanel>
  );

  const renderForgotPasswordForm = () => (
    <LeftPanel>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          textAlign: "center",
          mb: 1,
          color: theme.palette.common.white,
        }}
      >
        Password Reset
      </Typography>
      <Typography
        variant="body1"
        textAlign="center"
        sx={{ mb: 4, color: theme.palette.common.white }}
      >
        {resetEmailSent
          ? `Reset link sent to ${watch("email")}`
          : "Enter your email address to receive a password reset link."}
      </Typography>
      <CustomForm onSubmit={handleForgotSubmit(onForgotSubmit)}>
        {resetEmailSent ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <CheckCircleOutline
              sx={{
                fontSize: 60,
                color: theme.palette.success.main,
                mb: 2,
              }}
            />
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ color: theme.palette.common.white }}
            >
              Check your email for the reset link
            </Typography>
          </Box>
        ) : (
          <Input
            name="email"
            label="Email"
            icon="account"
            register={registerForgot}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Invalid email address",
              },
            }}
            error={!!forgotErrors.email}
            helperText={forgotErrors.email?.message}
            sx={{ marginBottom: "5%" }}
          />
        )}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          {!resetEmailSent && (
            <CustomButton
              type="submit"
              isFormValid={isForgotValid}
              sx={{ maxWidth: 300 }}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Send Reset Link"
              )}
            </CustomButton>
          )}
          <CustomButton
            variant="outlined"
            onClick={() => {
              setIsForgotPassword(false);
              setResetEmailSent(false);
            }}
            sx={{
              maxWidth: 300,
              borderColor: theme.palette.common.white,
              color: theme.palette.common.white,
              "&:hover": {
                borderColor: theme.palette.common.white,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            {resetEmailSent ? "Back to Login" : "Cancel"}
          </CustomButton>
        </Box>
      </CustomForm>
    </LeftPanel>
  );

  const renderRightPanelContent = () => (
    <RightPanel>
      <Box
        sx={{
          textAlign: "center",
          bgcolor: "rgba(0, 0, 0, 0.7)",
          p: 3,
          borderRadius: theme.shape.borderRadius,
          mb: 3,
          width: "80%",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Hello, Friend!
        </Typography>
        <Typography variant="body2">
          Enter your details and embark on an amazing journey with Beams.
        </Typography>
      </Box>
      <img
        src={signin}
        alt="sign in"
        style={{
          width: "70%",
          maxWidth: "300px",
          marginBottom: theme.spacing(2),
          animation: "float 3s ease-in-out infinite",
        }}
      />
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Beams Awaits
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        Sign in to unlock your potential
      </Typography>
    </RightPanel>
  );

  const renderLeftPanelContent = () => (
    <RightPanel>
      <Box
        sx={{
          textAlign: "center",
          p: 3,
          borderRadius: theme.shape.borderRadius,
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Reset Your Password
        </Typography>
        <Typography variant="body2">
          {resetEmailSent
            ? "Check your email for the reset link"
            : "Provide your email to receive a link to reset your password."}
        </Typography>
      </Box>
      <img
        src={signin}
        alt="sign in"
        style={{
          width: "70%",
          maxWidth: "300px",
          marginBottom: theme.spacing(2),
          animation: "float 3s ease-in-out infinite",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </RightPanel>
  );

  return (
    <Container
      sx={{
        minHeight: "100vh",
        minWidth: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${theme.palette.grey[100]} 0%, ${theme.palette.grey[300]} 100%)`,
        padding: theme.spacing(2),
      }}
    >
      <StyledPaper elevation={3}>
        {isForgotPassword ? (
          <>
            {renderLeftPanelContent()}
            {renderForgotPasswordForm()}
          </>
        ) : (
          <>
            {renderLoginForm()}
            {renderRightPanelContent()}
          </>
        )}
      </StyledPaper>

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
        `}
      </style>
    </Container>
  );
};

export default Login;
