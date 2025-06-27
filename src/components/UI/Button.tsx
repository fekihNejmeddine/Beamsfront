import React from "react";
import { Button, Box, styled, SxProps, Theme } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface ButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: "text" | "contained" | "outlined";
  path?: string;
  sx?: SxProps<Theme>;
  isFormValid?: boolean;
}


const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  padding: "10px 20px",
  textTransform: "none",
  fontWeight: 600,
  background: "linear-gradient(45deg, #1976d2, #42a5f5)",
  "&:hover": {
    background: "linear-gradient(45deg, #1565c0, #2196f3)",
    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
  },
}));
const CustomButton: React.FC<ButtonProps> = ({
  onClick,
  type = "button",
  children,
  fullWidth = true,
  variant = "contained",
  path,
  sx,
  isFormValid = true,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isFormValid) return;
    if (path) {
      navigate(path);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <Box mt={2}>
      <StyledButton
        fullWidth={fullWidth}
        variant={variant}
        color="primary"
        type={type}
        onClick={handleClick}
        sx={sx}
      >
        {children}
      </StyledButton>
    </Box>
  );
};

export default CustomButton;
