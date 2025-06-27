import React, { lazy } from "react";
import EmailVerification from "../pages/Auth/EmailVerification";
import ListRooms from "../pages/listRooms";
import ListBuildings from "../pages/listBuildings";
import Layout from "../components/Layout";
import { GestionReclamations } from "../pages/Reclamation/GestionReclamations";
import ReclamationsResident from "../pages/Reclamation/ReclamationResdent/ReclamationsResident";
import ROUTE from "../PATH/route";
import Error_403 from "../pages/Utility/Error_403";
import { Navigate } from "react-router-dom";
import Error_404 from "../pages/Utility/Error_404";
import PasswordReset from "../pages/Auth/PasswordReset";
import ListResidents from "../pages/listResident";
import ListEventSyndic from "../pages/ListEvent";
import ListEventResident from "../pages/ListEventResident";

const Caisse = lazy(() => import("../pages/Caisse/Caisse"));
const GestionCaisse = lazy(() => import("../pages/Caisse/GestionCaisse"));
const ListUsers = lazy(() => import("../pages/listUsers"));
const Login = lazy(() => import("../pages/Auth/login"));
const Dashboard = lazy(() => import("../pages/Dashboard/index"));
const UserProfile = lazy(() => import("../pages/Profile/user-profile"));
const Calendar = lazy(() => import("../pages/Calendar/calendar"));

export interface AppRoute {
  path: string;
  element: React.ReactNode;
  allowedRoles?: string[];
  redirectIfAuth?: boolean;
}

const routes: AppRoute[] = [
  {
    path: "/",
    element: <Navigate to={ROUTE.DASHBOARD} replace />,
  },
  {
    path: ROUTE.LOGIN,
    element: <Login />,
    redirectIfAuth: true,
  },
  {
    path: ROUTE.FORGET_PASSWORD,
    element: <EmailVerification />,
    redirectIfAuth: true,
  },
  {
    path: ROUTE.RESET_PASSWORD,
    element: <PasswordReset />,
    redirectIfAuth: true,
  },
  {
    path: ROUTE.DASHBOARD,
    element: (
      <Layout>
        <Dashboard />
      </Layout>
    ),
    allowedRoles: ["Admin"],
  },
  {
    path: ROUTE.USER_PROFIL,
    element: (
      <Layout>
        <UserProfile />
      </Layout>
    ),
    allowedRoles: ["Admin", "Rh", "Resident", "Syndic", "Employee"],
  },
  {
    path: ROUTE.USERS,
    element: (
      <Layout>
        <ListUsers />
      </Layout>
    ),
    allowedRoles: ["Admin", "Syndic"],
  },
  {
    path: ROUTE.RESIDENTS,
    element: (
      <Layout>
        <ListResidents />
      </Layout>
    ),
    allowedRoles: ["Syndic"],
  },
  {
    path: ROUTE.ROOMS,
    element: (
      <Layout>
        <ListRooms />
      </Layout>
    ),
    allowedRoles: ["Admin"],
  },
  {
    path: ROUTE.BUILDING,
    element: (
      <Layout>
        <ListBuildings />
      </Layout>
    ),
    allowedRoles: ["Admin"],
  },
  {
    path: ROUTE.RECLAMATIONS,
    element: (
      <Layout>
        <GestionReclamations />
      </Layout>
    ),
    allowedRoles: ["Syndic"],
  },
  {
    path: ROUTE.RECLAMATION_RESIDENT,
    element: (
      <Layout>
        <ReclamationsResident />
      </Layout>
    ),
    allowedRoles: ["Resident"],
  },
  {
    path: ROUTE.CALENDAR,
    element: (
      <Layout>
        <Calendar />
      </Layout>
    ),
    allowedRoles: ["Admin", "Rh", "Employee"],
  },
  {
    path: ROUTE.CAISSE,
    element: (
      <Layout>
        <Caisse />
      </Layout>
    ),
    allowedRoles: ["Rh", "Syndic"],
  },
  {
    path: ROUTE.GESTION_CAISSE,
    element: (
      <Layout>
        <GestionCaisse />
      </Layout>
    ),
    allowedRoles: ["Admin"],
  },
  {
    path: ROUTE.LIST_EVENT,
    element: (
      <Layout>
        <ListEventSyndic />
      </Layout>
    ),
    allowedRoles: ["Syndic"],
  },
  {
    path: ROUTE.LIST_EVENT_RESIDENT,
    element: (
      <Layout>
        <ListEventResident />
      </Layout>
    ),
    allowedRoles: ["Resident"],
  },
  //utility
  // {
  //   path: ROUTE.ERROR_403,
  //   element: <Error_403 />,
  // },
  // {
  //   path: "*",
  //   element: <Error_404 />,
  // },
];

export default routes;
