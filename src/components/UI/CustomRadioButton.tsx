import React from "react";
import {
  FormControl,

} from "@mui/material";



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
