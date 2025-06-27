import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  Avatar,
  IconButton,
  Typography,
  Divider,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import { Link } from "react-router-dom";
import useLogout from "../../hooks/useLogout";
import useAuth from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import femaleAvatar from "../../assets/avatar_female.jpg";
import maleAvatar from "../../assets/avatar_male.jpg";
import { GenderType } from "../../types/enum/Gender";


const ProfileMenu: React.FC = () => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const logout = useLogout();

  const Gender = auth?.user?.Gender;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
  };
  return (
    <>
      <IconButton onClick={handleClick} color="inherit">
        <Avatar
          src={Gender === GenderType.Male ? maleAvatar : femaleAvatar}
          sx={{
            width: 50,
            height: 50,
            border: `2px solid ${
              Gender === GenderType.Male ? "#1976d2" : "#e91e63"
            }`,
          }}
        />
        <Typography
          variant="body1"
          sx={{ ml: 1,mr:1, display: { xs: "block", md: "block" } }}
        >
          {auth?.user?.username}
        </Typography>
        <ArrowDropDownIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem component={Link} to="/user-profile" onClick={handleClose}>
          <AccountCircleIcon sx={{ mr: 1 }} /> {t("Profile")}
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <SettingsIcon sx={{ mr: 1 }} />
          {t("Settings")}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1, color: "error.main" }} /> {t("Logout")}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
