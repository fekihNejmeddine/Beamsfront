import React from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Link,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { t } from "i18next";

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: "none",
  fontWeight: 500,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  transition: "all 0.3s ease",
  "&:hover": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const FooterDivider = styled(Box)(({ theme }) => ({
  width: "1px",
  height: "20px",
  backgroundColor: theme.palette.divider,
  margin: theme.spacing(0, 2),
}));

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        height: { xs: "80px", sm: "64px" }, 
        background: `linear-gradient(135deg, ${theme.palette.grey[300]} 0%, ${theme.palette.grey[300]} 0%)`,
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
        zIndex: 1200,
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="xl" 
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          px: { xs: 2, md: 4 }, 
        }}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          sx={{
            flexWrap: { xs: "wrap", sm: "nowrap" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          {/* Left Section: Branding & Copyright */}
          <Grid
            item
            xs={12}
            sm={4}
            md={3}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-start" },
            }}
          >
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                letterSpacing: 0.2,
                textTransform: "uppercase",
              }}
            >
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
                Upzet
              </Box>
              © {currentYear}
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
            md={3}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", sm: "flex-end" },
            }}
          >
            <Typography
              variant="body2"
              component="div"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {t("Designed by")}
              <FooterLink
                target="_blank"
                rel="noopener noreferrer"
              >
                Wind-Consulting
              </FooterLink>
              <FooterDivider />
              <Box
                //component="span"
                sx={{
                  color: theme.palette.grey[600],
                  fontStyle: "italic",
                }}
              >
                v1.0.0
              </Box>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
