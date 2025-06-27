import React from "react";
import { useTranslation } from "react-i18next";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Controller,  Control } from "react-hook-form";
import { SelectChangeEvent } from "@mui/material/Select";

interface CustomSelectProps {
  name: string;
  label: string;
  value?: string | number;
  selectOptions: { value: string; label: string; disabled?: boolean }[];
  control: Control<Record<string, any>>;
  rules?: any;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  onChange?: (e: SelectChangeEvent<string>) => void;
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "100%",
  "& .MuiInputLabel-root": {
    color: theme.palette.text.secondary,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius,
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-disabled .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.action.disabled,
    },
  },
  "& .MuiFormHelperText-root": {
    position: "absolute",
    marginTop: 0,
    lineHeight: 11,
  },
}));

const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  label,
  value,
  selectOptions,
  control,
  rules,
  error = false,
  helperText,
  disabled = false,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <StyledFormControl variant="outlined" error={error} margin="dense">
      <InputLabel id={`${name}-select-label`}>{t(label)}</InputLabel>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => (
          <Select
            labelId={`${name}-select-label`}
            value={field.value?.toString() || ""}
            label={t(label)}
            onChange={(e: SelectChangeEvent<string>) => {
              field.onChange(e.target.value); 
              if (onChange) onChange(e); 
            }}
            disabled={disabled}
            error={!!error}
          >
            {selectOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {t(option.label)}
              </MenuItem>
            ))}
          </Select>
        )}
      />
      {helperText && <FormHelperText>{t(helperText)}</FormHelperText>}
    </StyledFormControl>
  );
};

export default CustomSelect;
