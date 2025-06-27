import React from "react";
import {
  Radio,
  FormControl,

} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledRadio = styled(Radio)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&.Mui-checked": {
    color: theme.palette.primary.main,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "&.Mui-disabled": {
    color: theme.palette.action.disabled,
  },
}));

interface CustomRadioButtonProps {
  component?: React.ElementType;
  error?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  component = "div",
  error = false,
  disabled = false,
  children,
  ...props
}) => {
  return (
    <FormControl
      component={component}
      error={error}
      disabled={disabled}
      {...props}
    >
      {children}
    </FormControl>
  );
};

export default CustomRadioButton;
