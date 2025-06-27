import React, { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Layout/NavBar";
import Sidebar from "../components/Layout/SideBar";
import Footer from "../components/Layout/Footer";
import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { LanguageContext } from "../context/LanguageContext";

const NAVBAR_HEIGHT = 64;
const FOOTER_HEIGHT = 50;
const SIDEBAR_WIDTH = { md: 250, lg: 240 };
const MOBILE_SIDEBAR_WIDTH = 75;

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { isRTL } = useContext(LanguageContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hideNavAndSidebar = ["/login", "/signup", "/forgot-password"].includes(
    location.pathname
  );

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isRTL,sidebarOpen]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {!hideNavAndSidebar && (
        <Box sx={{ position: "fixed", top: 0, width: "100%", zIndex: 1300 }}>
          <Navbar onMenuClick={handleMenuClick} />
        </Box>
      )}

      <Box sx={{ display: "flex", flex: 1 }}>
        {!hideNavAndSidebar && !isMobile && (
          <Box
            sx={{
              position: "fixed",
              top: NAVBAR_HEIGHT,
              [isRTL ? "right" : "left"]: 0,
              width: SIDEBAR_WIDTH,
              height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
              zIndex: 1200,
            }}
          >
            <Sidebar
              open={sidebarOpen}
              onMenuClick={handleMenuClick}
            />
          </Box>
        )}

        {!hideNavAndSidebar && (
          <Drawer
            anchor={isRTL ? "right" : "left"}
            open={sidebarOpen}
            onClose={handleMenuClick}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                width: MOBILE_SIDEBAR_WIDTH,
                top: NAVBAR_HEIGHT,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                background: theme.palette.grey[800],
              },
            }}
            aria-controls="mobile-sidebar"
            aria-expanded={sidebarOpen}
          >
            <Sidebar
              open={sidebarOpen}
              onMenuClick={handleMenuClick}
            />
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flex: 1,
            marginLeft: isRTL
              ? 0
              : hideNavAndSidebar
              ? 0
              : {
                  xs: 0,
                  md: `${SIDEBAR_WIDTH.md}px`,
                  lg: `${SIDEBAR_WIDTH.lg}px`,
                },
            marginRight:
              isRTL && !hideNavAndSidebar
                ? {
                    xs: 0,
                    md: `${SIDEBAR_WIDTH.md}px`,
                    lg: `${SIDEBAR_WIDTH.lg}px`,
                  }
                : 0,
            mt: hideNavAndSidebar ? 0 : `${NAVBAR_HEIGHT}px`,
            mb: hideNavAndSidebar ? 0 : `${FOOTER_HEIGHT}px`,
            minHeight: `calc(100vh - ${NAVBAR_HEIGHT}px - ${FOOTER_HEIGHT}px)`,
            overflowY: "auto",
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ flex: 1, height: "100%" }}>{children}</Box>
        </Box>
      </Box>
      {!hideNavAndSidebar && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            height: `${FOOTER_HEIGHT}px`,
            zIndex: 1200,
          }}
        >
          <Footer />
        </Box>
      )}
    </Box>
  );
};

export default Layout;
