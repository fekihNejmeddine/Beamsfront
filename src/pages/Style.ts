import {
  Button,
  IconButton,
  styled,
  TableContainer,
  TableRow,
} from "@mui/material";

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "8px", // Rounded corners for a modern look
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
  border: "1px solid #e5e7eb", // Light gray border
  backgroundColor: "#ffffff", // White background for the table
  height: "62%", // Ensure it takes the full height of the parent
  overflowY: "auto", // Allow scrolling
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f5f9", // Light track
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#94a3b8", // Slate thumb
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#64748b", // Darker on hover
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.3s ease", // Smooth hover transition
  "&:hover": {
    backgroundColor: "#f8fafc", // Light gray hover effect
    cursor: "pointer",
  },
}));
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

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

export { StyledButton, StyledIconButton };
