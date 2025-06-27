import React from "react";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import moment from "moment";
import { useTheme } from "@mui/material/styles";
import {
  UseFormRegister,
  RegisterOptions,
  FieldError,
  Merge,
  FieldErrorsImpl,
} from "react-hook-form";

const CustomDateTimePickerRoot = styled("div")(({ theme }) => ({
  "& .MuiTextField-root": {
    width: "100%",
    "& .MuiInputBase-root": {
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.default,
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
      "&.Mui-focused": {
        backgroundColor: theme.palette.background.paper,
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-error": {
        borderColor: theme.palette.error.main,
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.text.secondary,
      "&.Mui-focused": {
        color: theme.palette.primary.main,
      },
      "&.Mui-error": {
        color: theme.palette.error.main,
      },
    },
    "& .MuiFormHelperText-root": {
      color: theme.palette.text.secondary,
      position: "absolute",
      marginTop: 70,
      "&.Mui-error": {
        color: theme.palette.error.main,
      },
    },
  },
}));

interface CustomDateTimePickerProps {
  name: string;
  label: string;
  value?: string | null; // Added value prop
  register: UseFormRegister<any>;
  rules?: RegisterOptions;
  error?: boolean;
  helperText?: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>>;
  disabled?: boolean;
  minDateTime?: moment.Moment;
  format?: string;
  timeSteps?: { minutes?: number };
  views?: ("year" | "month" | "day" | "hours" | "minutes")[];
  onChange?: (e: { target: { name: string; value: string | null } }) => void;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  name,
  label,
  value, // Added to props destructuring
  register,
  rules,
  error,
  helperText,
  disabled,
  minDateTime,
  format = "DD/MM/YYYY HH:mm",
  timeSteps = { minutes: 1 },
  views = ["year", "month", "day", "hours", "minutes"],
  onChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

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
    <CustomDateTimePickerRoot>
      <DateTimePicker
        label={t(label)}
        value={value ? moment(value, "YYYY-MM-DD HH:mm") : null} // Use value prop
        onChange={(newValue) => {
          const formattedValue = newValue
            ? moment(newValue).format("YYYY-MM-DD HH:mm")
            : null;
          onChange?.({
            target: {
              name,
              value: formattedValue,
            },
          });
        }}
        disabled={disabled}
        minDateTime={minDateTime}
        format={format}
        timeSteps={timeSteps}
        views={views}
        slotProps={{
          textField: {
            ...register(name, {
              ...rules,
              setValueAs: (v) =>
                v ? moment(v).format("YYYY-MM-DD HH:mm") : null,
            }),
            error,
            helperText: formattedHelperText,
            fullWidth: true,
            FormHelperTextProps: {
              sx: {
                position: "absolute",
                marginTop: 7,
              },
            },
            sx: {
              "& .MuiInputBase-root": {
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                },
                "&.Mui-error": {
                  borderColor: theme.palette.error.main,
                },
              },
            },
          },
        }}
      />
    </CustomDateTimePickerRoot>
  );
};

export default CustomDateTimePicker;
