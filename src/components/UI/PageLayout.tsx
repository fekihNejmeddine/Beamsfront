import React from "react";
import { Box, Typography, Button } from "@mui/material";

interface PageLayoutProps {
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  actionButton,
  children,
}) => {
  return (
    <Box
      sx={{
        padding: 4,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {actionButton && (
          <Button
            variant="contained"
            startIcon={actionButton.icon}
            onClick={actionButton.onClick}
            sx={{ textTransform: "none" }}
          >
            {actionButton.label}
          </Button>
        )}
      </Box>
      {children}
    </Box>
  );
};
