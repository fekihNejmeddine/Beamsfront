import React, { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";

const Preloader: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        display: loading ? "flex" : "none",
      }}
    >
      <CircularProgress size="3rem" />
    </Box>
  );
};

export default Preloader;
