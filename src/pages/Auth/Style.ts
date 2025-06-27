import { Box, Paper, styled } from "@mui/material";
import signinBg from "../../assets/signin.png";

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  overflow: "hidden",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[8],
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "40vw",
  background: theme.palette.background.paper,
  [theme.breakpoints.down("md")]: {
    width: "100%",
    padding: theme.spacing(3),
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  width: "40vw",
  padding: theme.spacing(4),
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${signinBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: theme.palette.common.white,
  [theme.breakpoints.down("md")]: {
    width: "100%",
    minHeight: "50vh",
  },
}));
export { StyledPaper, LeftPanel, RightPanel };
