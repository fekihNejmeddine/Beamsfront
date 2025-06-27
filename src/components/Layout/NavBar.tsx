import React, {  useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import ProfileMenu from "../../components/Common/ProfileMenu";
import LanguageDropdown from "./LanguageDropdown";
import NotificationDropdown from "../Common/TopbarDropdown/NotificationDropdown";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(rgb(54, 78, 146), rgb(14, 36, 110))`,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  p: { xs: 2, sm: 3 },
}));

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        //  dropdown close logic
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <StyledAppBar position="fixed" sx={{ zIndex: 1000, height: 64 }}>
      <Toolbar
        sx={{
          minHeight: "64px !important",
          px: { xs: 1, md: 3 },
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}
        >
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={onMenuClick}
              sx={{
                ml: "2px",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
              }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant={isMobile ? "h6" : "h5"}
            sx={{
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            <Link
              to="/dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src="https://wind-consulting-tunisia.com/images/windsite/windc_1.png"
                alt="Logo"
                sx={{
                  height: { xs: 32, md: 40 },
                  width: "auto",
                  objectFit: "contain",
                  transition: "height 0.3s ease",
                }}
              />
            </Link>
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 2 },
            bgcolor: "rgba(255, 255, 255, 0.05)",
            borderRadius: theme.shape.borderRadius,
            p: 0.5,
            flexDirection: "row",
          }}
        >
          <Box ref={dropdownRef}>
            <NotificationDropdown />
          </Box>
          <LanguageDropdown />
          <ProfileMenu />
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
