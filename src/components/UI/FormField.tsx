import React from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";

interface FormFieldProps {
  type?: "text" | "number" | "email" | "password" | "select" | "date";
  label: string;
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: any; label: string }>;
  error?: string;
  required?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;  sx?: SxProps<Theme>;
  
}

export const GenericFormField: React.FC<FormFieldProps> = ({
  type = "text",
  label,
  value,
  onChange,
  options = [],
  error,
  required = false,
  fullWidth = true,
  disabled = false,
  multiline = false,
  rows = 1,
}) => {
  const renderField = () => {
    switch (type) {
      case "select":
        return (
          <FormControl fullWidth={fullWidth} error={!!error}>
            <InputLabel>{label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              label={label}
              disabled={disabled}
            >
              {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {error && <FormHelperText>{error}</FormHelperText>}
          </FormControl>
        );
      default:
        return (
          <TextField
            type={type}
            label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            helperText={error}
            required={required}
            fullWidth={fullWidth}
            disabled={disabled}
            multiline={multiline}
            rows={rows}
          />
        );
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {type !== "select" && (
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {label}
          {required && " *"}
        </Typography>
      )}
      {renderField()}
    </Box>
  );
};
