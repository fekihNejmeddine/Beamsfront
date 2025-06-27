import React from "react";
import { Box, Typography, Button, useTheme, SxProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import { StyledButton } from "../../pages/Style";

interface HeaderBarProps {
  title: string;
  buttonLabel?: string;
  buttonIcon?: React.ReactNode;
  onButtonClick?: () => void;
  sx?: SxProps;
  buttonSx?: SxProps;
  children?: React.ReactNode;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  buttonLabel,
  buttonIcon,
  onButtonClick,
  sx,
  buttonSx,
  children,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        mb: 4,
        ...sx,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: theme.palette.text.primary,
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
          [theme.breakpoints.down("sm")]: {
            fontSize: "1.75rem",
          },
        }}
      >
        {t(title)}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {children}
        {buttonLabel && onButtonClick && (
          <StyledButton
            variant="contained"
            startIcon={buttonIcon}
            onClick={onButtonClick}
          >
            {t(buttonLabel)}
          </StyledButton>
        )}
      </Box>
    </Box>
  );
};

export default HeaderBar;
