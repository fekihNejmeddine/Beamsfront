import React from "react";
import {
  Button,
  Badge,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

interface InboxSidebarProps {
  count: number[];
  toggleCustom: (tab: string) => void;
  customActiveTab: string;
  setCompose: (value: boolean) => void;
  setOpen: (value: boolean) => void;
  setContact: (value: object) => void;
}

const InboxSidebar: React.FC<InboxSidebarProps> = ({
  count,
  toggleCustom,
  customActiveTab,
  setCompose,
  setOpen,
  setContact,
}) => {
  const categories = [
    { label: "All", icon: <InboxIcon />, count: count[4] + count[0] },
    { label: "Unsolved", icon: <HighlightOffIcon />, count: count[1] },
    { label: "In progress", icon: <HourglassEmptyIcon />, count: count[2] },
    { label: "Solved", icon: <CheckCircleOutlineIcon />, count: count[3] },
  ];

  const labels = [
    { text: "Admission Help", color: "success" },
    { text: "Reunion", color: "warning" },
    { text: "Reclamation", color: "error" },
    { text: "Other", color: "info" },
  ];

  return (
    <Box sx={{ width: 300 }}>
      <Paper sx={{ p: 2, height: "100%" }}>
        <Button
          variant="contained"
          color="error"
          fullWidth
          startIcon={<AddIcon />}
          sx={{ mb: 2, borderRadius: 2 }}
          onClick={() => {
            setOpen(false);
            setCompose(true);
            setContact({});
          }}
        >
          Compose
        </Button>

        <List>
          {categories.map(({ label, icon, count }) => (
            <ListItem key={label} disablePadding>
              <ListItemButton
                selected={customActiveTab === label}
                onClick={() => {
                  toggleCustom(label);
                  setOpen(false);
                  setCompose(false);
                }}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
                <Badge color="secondary" badgeContent={count} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <Box component="h6" sx={{ mb: 1 }}>
            Labels
          </Box>
          {labels.map(({ text, color }) => (
            <Badge
              key={text}
              sx={{
                mr: 1,
                p: 1,
                fontSize: "0.8rem",
                borderRadius: 1,
                bgcolor: `${color}.light`,
                color: "bg-success",
              }}
            >
              {text}
            </Badge>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default InboxSidebar;
