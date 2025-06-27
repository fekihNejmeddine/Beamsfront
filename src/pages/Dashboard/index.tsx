import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  useTheme,
  Typography,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { actions as userActions, usersSelectors } from "../../store/user/slice";
import {
  actions as buildingActions,
  buildingsSelectors,
} from "../../store/building/slice";
import useAuth from "../../hooks/useAuth";
import Preloader from "../../components/UI/Preloader";
import HeaderBar from "../../components/UI/HeaderBar";
import FilterBar, { FilterConfig } from "../../components/UI/FilterBar";
import { useTranslation } from "react-i18next";
import ApexCharts from "apexcharts";
import { User } from "../../types/interface/User";
import { Building } from "../../types/interface/Building";
import { UserRole } from "../../types/enum/UserRole.enum";
import { GenderType } from "../../types/enum/Gender";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LayersIcon from "@mui/icons-material/Layers";

// Interface for chart options
interface ChartOptions {
  chart: {
    type: string;
    height: number;
    animations?: {
      enabled: boolean;
    };
  };
  labels?: string[];
  series: number[] | { name: string; data: number[] }[];
  title: {
    text: string;
  };
  xaxis?: {
    categories?: string[];
    title?: { text: string };
  };
  tooltip?: {
    enabled: boolean;
  };
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { auth } = useAuth();

  // Select data from Redux store
  const users = useSelector(usersSelectors.selectAll);
  const buildings = useSelector(buildingsSelectors.selectAll);
  const { loading: usersLoading } = useSelector(
    (state: RootState) => state.users
  );
  const { loading: buildingsLoading } = useSelector(
    (state: RootState) => state.buildings
  );

  // Filter state
  const [filters, setFilters] = useState<{
    roleTP: string;
    countryTP: string;
    minYearTP: string;
    maxYearTP: string;
  }>({
    roleTP: "",
    countryTP: "",
    minYearTP: "2000",
    maxYearTP: new Date().getFullYear().toString(),
  });

  // Chart visibility toggles
  const [showRoleChart, setShowRoleChart] = useState(true);
  const [showGenderChart, setShowGenderChart] = useState(true);
  const [showCountryChart, setShowCountryChart] = useState(true);
  const [showYearChart, setShowYearChart] = useState(true);

  // Store chart instances with correct ApexCharts instance type
  const chartInstances = useRef<{
    roleChart?: ApexCharts;
    genderChart?: ApexCharts;
    countryChart?: ApexCharts;
    yearChart?: ApexCharts;
  }>({});

  // Filter configuration for FilterBar
  const roles = useMemo(
    () => [
      { value: "", label: t("All Roles") },
      ...Object.values(UserRole).map((role) => ({
        value: role,
        label: role,
      })),
    ],
    [t]
  );

  const countries = useMemo(
    () => [
      { value: "", label: t("All Countries") },
      ...Array.from(new Set(buildings.map((b) => b.country))).map((country) => ({
        value: country,
        label: country,
      })),
    ],
    [buildings, t]
  );

  const filterConfig: FilterConfig[] = [
    {
      key: "roleTP",
      label: t("Role"),
      type: "select",
      options: roles,
    },
    {
      key: "countryTP",
      label: t("Country"),
      type: "select",
      options: countries,
    },
    {
      key: "minYearTP",
      label: t("Min Construction Year"),
      type: "number",
      placeholder: t("Min Year"),
      min: 1900,
      max: new Date().getFullYear(),
    },
    {
      key: "maxYearTP",
      label: t("Max Construction Year"),
      type: "number",
      placeholder: t("Max Year"),
      min: 1900,
      max: new Date().getFullYear(),
    },
  ];

  // Fetch data on mount
  useEffect(() => {
    if (auth.accessToken) {
      dispatch(
        userActions.fetchUsersRequest({
          page: 1,
          limit: 100,
          search: "",
          role: "",
          pageSize: 100,
          authToken: auth.accessToken,
        })
      );
      dispatch(
        buildingActions.fetchBuildingsRequest({
          page: 1,
          limit: 100,
          search: "",
          address: "",
          numberOfFloors: undefined,
          pageSize: 100,
          authToken: auth.accessToken,
        })
      );
    }
  }, [dispatch, auth.accessToken]);

  // Memoized data calculations
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        !user.isDeleted &&
        (filters.roleTP === "" || user.role === filters.roleTP)
    );
  }, [users, filters.roleTP]);

  const filteredBuildings = useMemo(() => {
    const minYear = Number(filters.minYearTP) || 1900;
    const maxYear = Number(filters.maxYearTP) || new Date().getFullYear();
    return buildings.filter(
      (building) =>
        !building.isDeleted &&
        (filters.countryTP === "" || building.country === filters.countryTP) &&
        building.constructionYear >= minYear &&
        building.constructionYear <= maxYear
    );
  }, [buildings, filters.countryTP, filters.minYearTP, filters.maxYearTP]);

  // User Role Pie Chart Data
  const roleData = useMemo(() => {
    const roleCounts: { [key: string]: number } = {};
    filteredUsers.forEach((user) => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    return {
      labels: Object.keys(roleCounts),
      series: Object.values(roleCounts),
    };
  }, [filteredUsers]);

  // User Gender Donut Chart Data
  const genderData = useMemo(() => {
    const genderCounts: { [key: string]: number } = {
      [GenderType.Male]: 0,
      [GenderType.Female]: 0,
    };
    filteredUsers.forEach((user) => {
      if (user.Gender in genderCounts) {
        genderCounts[user.Gender]++;
      }
    });
    return {
      labels: Object.keys(genderCounts),
      series: Object.values(genderCounts),
    };
  }, [filteredUsers]);

  // Buildings by Country Bar Chart Data
  const countryData = useMemo(() => {
    const countryCounts: { [key: string]: number } = {};
    filteredBuildings.forEach((building) => {
      countryCounts[building.country] = (countryCounts[building.country] || 0) + 1;
    });
    return {
      categories: Object.keys(countryCounts),
      series: [{ name: t("Buildings"), data: Object.values(countryCounts) }],
    };
  }, [filteredBuildings, t]);

  // Buildings by Construction Year Line Chart Data
  const yearData = useMemo(() => {
    const yearCounts: { [key: number]: number } = {};
    filteredBuildings.forEach((building) => {
      yearCounts[building.constructionYear] =
        (yearCounts[building.constructionYear] || 0) + 1;
    });
    const years = Object.keys(yearCounts)
      .map(Number)
      .sort((a, b) => a - b);
    return {
      categories: years.map(String),
      series: [{ name: t("Buildings"), data: years.map((y) => yearCounts[y]) }],
    };
  }, [filteredBuildings, t]);

  // Data Insights
  const insights = useMemo(() => ({
    totalUsers: filteredUsers.length,
    totalBuildings: filteredBuildings.length,
    avgFloors: filteredBuildings.length
      ? (
          filteredBuildings.reduce((sum, b) => sum + (b.numberOfFloors || 0), 0) /
          filteredBuildings.length
        ).toFixed(1)
      : "0",
  }), [filteredUsers, filteredBuildings]);

  // Render charts
  useEffect(() => {
    if (!usersLoading && !buildingsLoading) {
      // Clear previous charts
      Object.values(chartInstances.current).forEach((chart) => chart?.destroy());
      chartInstances.current = {};

      // User Role Pie Chart
      if (showRoleChart) {
        const roleChartOptions: ChartOptions = {
          chart: { type: "pie", height: 350, animations: { enabled: true } },
          labels: roleData.labels,
          series: roleData.series,
          title: { text: t("Users by Role") },
          tooltip: { enabled: true },
        };
        const roleChart = new ApexCharts(document.querySelector("#roleChart"), roleChartOptions);
        roleChart.render();
        chartInstances.current.roleChart = roleChart;
      }

      // User Gender Donut Chart
      if (showGenderChart) {
        const genderChartOptions: ChartOptions = {
          chart: { type: "donut", height: 350, animations: { enabled: true } },
          labels: genderData.labels,
          series: genderData.series,
          title: { text: t("Users by Gender") },
          tooltip: { enabled: true },
        };
        const genderChart = new ApexCharts(document.querySelector("#genderChart"), genderChartOptions);
        genderChart.render();
        chartInstances.current.genderChart = genderChart;
      }

      // Buildings by Country Bar Chart
      if (showCountryChart) {
        const countryChartOptions: ChartOptions = {
          chart: { type: "bar", height: 350, animations: { enabled: true } },
          series: countryData.series,
          title: { text: t("Buildings by Country") },
          xaxis: { categories: countryData.categories, title: { text: t("Country") } },
          tooltip: { enabled: true },
        };
        const countryChart = new ApexCharts(document.querySelector("#countryChart"), countryChartOptions);
        countryChart.render();
        chartInstances.current.countryChart = countryChart;
      }

      // Buildings by Year Line Chart
      if (showYearChart) {
        const yearChartOptions: ChartOptions = {
          chart: { type: "line", height: 350, animations: { enabled: true } },
          series: yearData.series,
          title: { text: t("Buildings by Construction Year") },
          xaxis: { categories: yearData.categories, title: { text: t("Year") } },
          tooltip: { enabled: true },
        };
        const yearChart = new ApexCharts(document.querySelector("#yearChart"), yearChartOptions);
        yearChart.render();
        chartInstances.current.yearChart = yearChart;
      }

      // Cleanup charts on unmount or update
      return () => {
        Object.values(chartInstances.current).forEach((chart) => chart?.destroy());
        chartInstances.current = {};
      };
    }
  }, [
    usersLoading,
    buildingsLoading,
    roleData,
    genderData,
    countryData,
    yearData,
    showRoleChart,
    showGenderChart,
    showCountryChart,
    showYearChart,
    t,
  ]);

  // Handle filter reset
  const handleReset = () => {
    setFilters({
      roleTP: "",
      countryTP: "",
      minYearTP: "2000",
      maxYearTP: new Date().getFullYear().toString(),
    });
  };

  return (
    <>
      {(usersLoading || buildingsLoading) ? (
        <Preloader />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            p: 3,
            height: "100%",
            backgroundColor: theme.palette.grey.A100,
          }}
        >
          <HeaderBar title={t("Dashboard")} />

          <FilterBar
            searchQuery=""
            onSearchQueryChange={() => {}}
            filters={filters}
            onFilterChange={(key, value) => {
              setFilters((prev) => ({ ...prev, [key]: value }));
            }}
            filtersConfig={filterConfig}
            onSearch={() => {}}
            onReset={handleReset}
            placeholder={t("Filter dashboard data...")}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("Key Metrics")}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                    <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {insights.totalUsers}
                      </Typography>
                      <Typography variant="body2">{t("Total Users")}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    backgroundColor: theme.palette.secondary.light,
                    color: theme.palette.secondary.contrastText,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                    <ApartmentIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {insights.totalBuildings}
                      </Typography>
                      <Typography variant="body2">{t("Total Buildings")}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card
                  sx={{
                    backgroundColor: theme.palette.info.light,
                    color: theme.palette.info.contrastText,
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                    <LayersIcon sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {insights.avgFloors}
                      </Typography>
                      <Typography variant="body2">{t("Average Floors per Building")}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{t("Users by Role")}</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showRoleChart}
                          onChange={(e) => setShowRoleChart(e.target.checked)}
                        />
                      }
                      label={t("Show Chart")}
                    />
                  </Box>
                  {showRoleChart && <div id="roleChart" />}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{t("Users by Gender")}</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showGenderChart}
                          onChange={(e) => setShowGenderChart(e.target.checked)}
                        />
                      }
                      label={t("Show Chart")}
                    />
                  </Box>
                  {showGenderChart && <div id="genderChart" />}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{t("Buildings by Country")}</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showCountryChart}
                          onChange={(e) => setShowCountryChart(e.target.checked)}
                        />
                      }
                      label={t("Show Chart")}
                    />
                  </Box>
                  {showCountryChart && <div id="countryChart" />}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{t("Buildings by Construction Year")}</Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showYearChart}
                          onChange={(e) => setShowYearChart(e.target.checked)}
                        />
                      }
                      label={t("Show Chart")}
                    />
                  </Box>
                  {showYearChart && <div id="yearChart" />}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};

export default Dashboard;