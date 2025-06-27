import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  SxProps,
  Theme,
} from "@mui/material";
import {
  AccountCircle,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  UseFormRegister,
  RegisterOptions,
  FieldError,
  Merge,
  FieldErrorsImpl,
} from "react-hook-form";

interface InputProps {
  name: string;
  label: string;
  icon?: "account" | "lock";
  type?:
    | "text"
    | "number"
    | "password"
    | "email"
    | "tel"
    | "date"
    | "datetime-local";
  error?: boolean;
  helperText?: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  register: UseFormRegister<any>;
  rules?: RegisterOptions;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputProps?: { min?: number | string; max?: number; step?: number };
}

const Input: React.FC<InputProps> = ({
  name,
  label,
  icon,
  type = "text",
  error,
  helperText,
  register,
  disabled,
  rules,
  sx,
  onChange,
  inputProps,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const renderIcon = () => {
    if (icon === "account") return <AccountCircle />;
    if (icon === "lock") return <LockOutlined />;
    return null;
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const formattedHelperText = (() => {
    if (typeof helperText === "string") {
      return helperText;
    }
    if (
      helperText &&
      "message" in helperText &&
      typeof helperText.message === "string"
    ) {
      return helperText.message;
    }
    return undefined;
  })();

  return (
    <TextField
      fullWidth
      onChange={onChange}
      disabled={disabled}
      type={type === "password" ? (showPassword ? "text" : "password") : type}
      label={label}
      variant="outlined"
      margin="dense"
      sx={sx}
      error={error}
      helperText={formattedHelperText}
      {...register(name, rules)}
      InputProps={{
        startAdornment: icon ? (
          <InputAdornment position="start">{renderIcon()}</InputAdornment>
        ) : null,
        endAdornment:
          label === "Password" ? (
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  showPassword ? "hide the password" : "display the password"
                }
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ) : null,
        inputProps: inputProps, // Pass inputProps to TextField
      }}
      FormHelperTextProps={{
        sx: {
          position: "absolute",
          marginTop: 7,
        },
      }}
    />
  );
};

export default Input;
