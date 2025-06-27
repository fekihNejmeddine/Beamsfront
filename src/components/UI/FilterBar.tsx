import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { StyledButton } from "../../pages/Style";

interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: FilterOption[];
  min?: number; // For number type
  max?: number; // For number type
  placeholder?: string;
}

interface FilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  filters: Record<string, string | number | undefined>;
  onFilterChange: (key: string, value: string | number | undefined) => void;
  filtersConfig: FilterConfig[];
  onSearch: () => void;
  onReset: () => void;
  placeholder?: string;
  disableSearchButton?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  filters,
  onFilterChange,
  filtersConfig,
  onSearch,
  onReset,
  placeholder = "Search...",
  disableSearchButton = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // < 600px
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600px - 900px
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg")); // 900px - 1200px
  const isLg = useMediaQuery(theme.breakpoints.between("lg", "xl")); // 1200px - 1536px
  const isXl = useMediaQuery(theme.breakpoints.up("xl")); // ≥ 1536px

  // Determine layout direction and sizes based on screen size
  const isMobile = isXs;
  const flexDirection = isMobile ? "column" : "row";
  const searchWidth = isXs ? "100%" : isSm ? "200px" : isMd ? "250px" : "300px";
  const filterWidth = isXs
    ? "100%"
    : isSm
    ? "150px"
    : isMd
    ? "180px"
    : isLg
    ? "200px"
    : "220px";
  const buttonWidth = isXs ? "100%" : isSm ? "100px" : "120px";
  const inputHeight = isXs ? "48px" : isSm ? "50px" : "52px";
  const buttonFlexDirection = isMobile ? "column" : "row";

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  const handleClearSearch = () => {
    onSearchQueryChange("");
    onSearch();
  };

  const renderFilterInput = (config: FilterConfig) => {
    const value = filters[config.key] ?? "";

    switch (config.type) {
      case "text":
        return (
          <TextField
            fullWidth
            label={t(config.label)}
            variant="outlined"
            value={value}
            onChange={(e) => onFilterChange(config.key, e.target.value)}
            placeholder={config.placeholder}
            sx={{
              height: inputHeight,
              "& .MuiOutlinedInput-root": {
                height: "100%",
                borderRadius: "8px",
                fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem",
              },
              "& .MuiInputLabel-outlined": {
                transform: `translate(14px, ${isXs ? "14px" : "16px"}) scale(1)`,
                fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem",
                "&.MuiInputLabel-shrink": {
                  transform: `translate(14px, ${isXs ? "-6px" : "-8px"}) scale(0.75)`,
                },
              },
            }}
          />
        );
      case "number":
        return (
          <TextField
            fullWidth
            type="number"
            label={t(config.label)}
            variant="outlined"
            value={value}
            onChange={(e) =>
              onFilterChange(config.key, parseInt(e.target.value) || undefined)
            }
            inputProps={{
              min: config.min,
              max: config.max,
            }}
            sx={{
              height: inputHeight,
              "& .MuiOutlinedInput-root": {
                height: "100%",
                borderRadius: "8px",
                fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem",
              },
              "& .MuiInputLabel-outlined": {
                transform: `translate(14px, ${isXs ? "14px" : "16px"}) scale(1)`,
                fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem",
                "&.MuiInputLabel-shrink": {
                  transform: `translate(14px, ${isXs ? "-6px" : "-8px"}) scale(0.75)`,
                },
              },
            }}
          />
        );
      case "select":
        return (
          <FormControl sx={{ height: inputHeight, width: "100%" }}>
            <InputLabel
              id={`${config.key}-select-label`}
              sx={{
                fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem",
                transform: `translate(14px, ${isXs ? "14px" : "16px"}) scale(1)`,
                "&.MuiInputLabel-shrink": {
                  transform: `translate(14px, ${isXs ? "-6px" : "-8px"}) scale(0.75)`,
                },
              }}
            >
              {t(config.label)}
            </InputLabel>
            <Select
              labelId={`${config.key}-select-label`}
              value={value.toString()}
              onChange={(e) =>
                onFilterChange(config.key, e.target.value || undefined)
              }
              label={t(config.label)}
              sx={{
                height: "100%",
                borderRadius: "8px",
                fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem",
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  height: "100% !important",
                },
              }}
              disabled={!config.options || config.options.length === 0}
            >
              {config.options?.length ? (
                config.options.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{ fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem" }}
                  >
                    {t(option.label)}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  {t("No options available")}
                </MenuItem>
              )}
            </Select>
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: isXs ? 1.5 : isSm ? 2 : 2.5,
        mb: 1,
        borderRadius: "12px",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: isXs ? 1.5 : isSm ? 2 : 2.5,
          alignItems: "stretch",
          flexDirection,
        }}
      >
        {/* Search Field */}
        
          <Box
          sx={{
            display: "flex",
            flex: 1,
            minWidth: isMobile ? "100%" : 250,
            height: "50px",
          }}
        >
          <TextField
            fullWidth
            label={t(placeholder)}
            variant="outlined"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              height: "100%",
              "& .MuiOutlinedInput-root": {
                height: "100%",
                pr: isXs ? 5 : 6,
                borderRadius: "8px",
                fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem",
              },
              "& .MuiInputLabel-outlined": {
                transform: `translate(14px, ${isXs ? "14px" : "16px"}) scale(1)`,
                fontSize: isXs ? "0.9rem" : isSm ? "0.95rem" : "1rem",
                "&.MuiInputLabel-shrink": {
                  transform: `translate(14px, ${isXs ? "-6px" : "-8px"}) scale(0.75)`,
                },
              },
            }}
            InputProps={{
              sx: { height: "100%" },
              startAdornment: (
                <SearchIcon
                  sx={{
                    color: theme.palette.action.active,
                    mr: isXs ? 0.5 : 1,
                    fontSize: isXs ? "1.2rem" : "1.5rem",
                  }}
                />
              ),
              endAdornment: searchQuery && (
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{
                    position: "absolute",
                    right: isXs ? 4 : 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <ClearIcon
                    fontSize={isXs ? "small" : "medium"}
                    sx={{ fontSize: isXs ? "1rem" : "1.2rem" }}
                  />
                </IconButton>
              ),
            }}
          />
        </Box>

        {/* Dynamic Filters */}
        {filtersConfig.map((config) => (
          <Box
            key={config.key}
            sx={{
              width: filterWidth,
              minWidth: isMobile ? "100%" : undefined,
              height: inputHeight,
            }}
          >
            {renderFilterInput(config)}
          </Box>
        ))}

        {/* Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: isXs ? 1 : isSm ? 1.5 : 2,
            width: isMobile ? "100%" : "auto",
            height: isMobile ? "auto" : inputHeight,
            flexDirection: buttonFlexDirection,
            alignItems: isMobile ? "stretch" : "center",
          }}
        >
          <StyledButton
            variant="contained"
            onClick={onSearch}
            disabled={disableSearchButton}
            startIcon={
              <SearchIcon
                sx={{ fontSize: isXs ? "1.2rem" : isSm ? "1.4rem" : "1.6rem" }}
              />
            }
            sx={{
              height: isMobile ? "48px" : "100%",
              borderRadius: "8px",
              fontSize: isXs ? "0.85rem" : isSm ? "0.9rem" : "1rem",
              px: isXs ? 1.5 : isSm ? 2 : 2.5,
              minWidth: buttonWidth,
              width: isMobile ? "100%" : undefined,
            }}
          >
            {t("Search")}
          </StyledButton>
          <Button
            variant="outlined"
            onClick={onReset}
            sx={{
              height: isMobile ? "48px" : "100%",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: isXs ? "0.85rem" : isSm ? "0.9rem" : "1rem",
              px: isXs ? 1.5 : isSm ? 2 : 2.5,
              minWidth: buttonWidth,
              width: isMobile ? "100%" : undefined,
            }}
          >
            {t("Reset")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FilterBar;