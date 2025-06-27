import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Box,
  Divider,
  Tooltip,
  styled,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ApartmentIcon from "@mui/icons-material/Apartment";
import RoomRoundedIcon from "@mui/icons-material/RoomRounded";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import useAuth from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import ROUTE from "../../PATH/route";
import { useLocation } from "react-router-dom";

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  tooltip?: string;
}
interface SideBarProps {
  open: boolean;
  onMenuClick: () => void;
}
const StyledStack = styled(Stack)(({ theme }) => ({
  //width: { xs: "72px", md: "260px" },
  height: "100%",
  background: `linear-gradient(180deg, ${theme.palette.grey[800]} 0%, ${theme.palette.grey[800]} 100%)`,
  borderRight: `1px solid ${theme.palette.grey[700]}40`,
  boxShadow: `0 4px 16px ${theme.palette.grey[900]}20`,
  transition: "width 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  overflow: "hidden",
  backdropFilter: "blur(8px)",
  "&:hover": {
    boxShadow: `0 6px 24px ${theme.palette.grey[900]}30`,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1.5),
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    transform: `translateX(${theme.direction === "rtl" ? -4 : 4}px)`,
    boxShadow: `0 2px 8px ${theme.palette.grey[900]}20`,
  },
  "&.Mui-selected": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    "& .MuiListItemIcon-root": {
      color: theme.palette.common.white,
    },
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
      transform: `translateX(${theme.direction === "rtl" ? -4 : 4}px)`,
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.grey[400],
  minWidth: "40px",
  transition: "color 0.3s ease-in-out, transform 0.3s ease-in-out",
  "&:hover": {
    color: theme.palette.primary.light,
    transform: "scale(1.1)",
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: `rgba(${theme.palette.grey[700]}80)`,
  margin: theme.spacing(1, 2),
  transition: "background-color 0.3s ease-in-out",
}));

const SideBar: React.FC<SideBarProps> = ({ open, onMenuClick }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { auth } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const mainListItems = React.useMemo<MenuItem[]>(() => {
    const baseItems: MenuItem[] = [];
    if (auth?.user?.role === "Syndic") {
      baseItems.push(
        {
          text: t("Reclamations"),
          icon: <ReportProblemIcon />,
          path: ROUTE.RECLAMATIONS,
          tooltip: t("Reclamations Management"),
        },
        {
          text: t("List Resident"),
          icon: <PeopleRoundedIcon />,
          path: ROUTE.USERS,
          tooltip: t("List Resident"),
        },

        {
          text: t("List Event"),
          icon: <PeopleRoundedIcon />,
          path: ROUTE.LIST_EVENT,
          tooltip: t("User Management"),
        }
      );
    }
    if (auth?.user?.role === "Resident") {
      baseItems.push(
        {
          text: t("Reclamations"),
          icon: <ReportProblemIcon />,
          path: ROUTE.RECLAMATION_RESIDENT,
          tooltip: t("Reclamations"),
        },
        {
          text: t("List Event"),
          icon: <ReportProblemIcon />,
          path: ROUTE.LIST_EVENT_RESIDENT,
          tooltip: t("Reclamations"),
        }
      );
    }
    if (auth?.user?.role === "Rh" || auth?.user?.role === "Syndic") {
      baseItems.push({
        text: t("Cash Management"),
        icon: <PointOfSaleIcon />,
        path: ROUTE.CAISSE,
        tooltip: t("Cash Management"),
      });
    }

    if (auth?.user?.role === "Admin") {
      baseItems.push(
        {
          text: t("Dashboard"),
          icon: <HomeRoundedIcon />,
          path: ROUTE.DASHBOARD,
          tooltip: t("Dashboard"),
        },
        {
          text: t("User Management"),
          icon: <PeopleRoundedIcon />,
          path: ROUTE.USERS,
          tooltip: t("User Management"),
        },

        {
          text: t("Buildings Management"),
          icon: <ApartmentIcon />,
          path: ROUTE.BUILDING,
          tooltip: t("Buildings Management"),
        },
        {
          text: t("Meeting Room"),
          icon: <RoomRoundedIcon />,
          path: ROUTE.ROOMS,
          tooltip: t("Meeting Room"),
        },

        {
          text: t("Cash Operations"),
          icon: <PointOfSaleIcon />,
          path: ROUTE.GESTION_CAISSE,
          tooltip: t("Cash Operations"),
        }
      );
    }
    if (
      auth?.user?.role === "Rh" ||
      auth?.user?.role === "Admin" ||
      auth?.user?.role === "Employee"
    ) {
      baseItems.push({
        text: t("Schedule"),
        icon: <CalendarMonthIcon />,
        path: ROUTE.CALENDAR,
        tooltip: t("Schedule"),
      });
    }
    return baseItems;
  }, [auth?.user?.role, t]);

  React.useEffect(() => {
    const allItems = [...mainListItems];
    const currentIndex = allItems.findIndex(
      (item) => item.path === location.pathname
    );
    setSelectedIndex(currentIndex !== -1 ? currentIndex : null);
  }, [location.pathname, mainListItems]);
  const handleNavigation = (path: string | undefined) => {
    if (path) {
      navigate(path);
      if (isMobile && open) {
        onMenuClick();
      }
    }
  };

  const renderListItems = (items: MenuItem[], section: "main" | "secondary") =>
    items.map((item, index) => {
      const globalIndex =
        section === "main" ? index : index + mainListItems.length;
      return (
        <Tooltip
          key={item.text}
          title={isMobile ? item.tooltip || t(item.text) : ""}
          placement="right"
        >
          <ListItem disablePadding sx={{ display: "block" }}>
            <StyledListItemButton
              selected={selectedIndex === globalIndex}
              onClick={() => handleNavigation(item.path)}
              aria-label={t(item.text)}
            >
              <StyledListItemIcon
                sx={{
                  color:
                    selectedIndex === globalIndex
                      ? theme.palette.common.white
                      : theme.palette.grey[100],
                }}
              >
                {item.icon}
              </StyledListItemIcon>
              {!isMobile && (
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: selectedIndex === globalIndex ? 700 : 500,
                    color:
                      selectedIndex === globalIndex
                        ? "common.white"
                        : "grey.300",
                    textAlign: "left",
                  }}
                />
              )}
            </StyledListItemButton>
          </ListItem>
        </Tooltip>
      );
    });

  return (
    <StyledStack
      sx={{
        width: isMobile ? "73px" : { md: "250px" },
        "&:hover": {
          width: isMobile ? "72px" : "250px",
        },
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: "auto", pt: 2 }}>
        <List>{renderListItems(mainListItems, "main")}</List>
      </Box>
      <StyledDivider />
    </StyledStack>
  );
};

export default SideBar;
